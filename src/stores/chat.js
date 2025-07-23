import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { useConversationStore } from "./conversation";
import { useUIStore } from "./ui";
import { sendMessageStreamAPI, uploadFileAPI } from "@/services/api";

export const useChatStore = defineStore("chat", () => {
    const conversationStore = useConversationStore();
    const uiStore = useUIStore();

    // 채팅 상태 - conversation별로 관리
    const streamingStates = ref(new Map()); // conversationId -> streaming state
    const uploadedFiles = ref([]);
    const abortControllers = ref(new Map()); // conversationId -> abort controller

    // 현재 대화의 스트리밍 상태
    const isStreaming = computed(() => {
        const currentConvId = conversationStore.currentConversationId;
        return streamingStates.value.get(currentConvId)?.isStreaming || false;
    });

    const streamingMessage = computed(() => {
        const currentConvId = conversationStore.currentConversationId;
        return streamingStates.value.get(currentConvId)?.streamingMessage || "";
    });

    const currentStatus = computed(() => {
        const currentConvId = conversationStore.currentConversationId;
        return streamingStates.value.get(currentConvId)?.currentStatus || "";
    });

    // 대화별 스트리밍 상태 초기화
    const initStreamingState = (conversationId) => {
        if (!streamingStates.value.has(conversationId)) {
            streamingStates.value.set(conversationId, {
                isStreaming: false,
                streamingMessage: "",
                currentStatus: "",
            });
        }
    };

    // 대화별 스트리밍 상태 업데이트
    const updateStreamingState = (conversationId, updates) => {
        initStreamingState(conversationId);
        const currentState = streamingStates.value.get(conversationId);
        streamingStates.value.set(conversationId, {
            ...currentState,
            ...updates,
        });
    };

    // 메시지 전송
    const sendMessage = async (messageData) => {
        const { content, mentionedDepartments = [], files = [] } = messageData;
        console.log("Sending message:", content, mentionedDepartments, files);
        if (!content.trim() && files.length === 0) return;

        const currentConvId = conversationStore.currentConversationId;

        try {
            // 파일 업로드 처리
            const uploadedFileData = [];
            if (files.length > 0) {
                for (const file of files) {
                    try {
                        const uploadResult = await uploadFileAPI(file);
                        uploadedFileData.push(uploadResult.data);
                    } catch (error) {
                        uiStore.setError(`파일 업로드 실패: ${file.name}`);
                        console.error("File upload error:", error);
                    }
                }
            }

            // 사용자 메시지 추가
            const userMessage = {
                role: "user",
                content,
                files:
                    uploadedFileData.length > 0 ? uploadedFileData : undefined,
                mentionedDepartments: mentionedDepartments.length > 0 ? mentionedDepartments : undefined,
            };

            conversationStore.addMessage(currentConvId, userMessage);

            // AI 응답 요청 - 현재 대화에만 스트리밍 상태 설정
            updateStreamingState(currentConvId, {
                isStreaming: true,
                streamingMessage: "",
                currentStatus: "요청 처리 중...",
            });

            // API 요청 페이로드
            const payload = {
                conversationId: currentConvId,
                message: content,
                files: uploadedFileData,
                mentionedDepartments: mentionedDepartments,
                stream: true,
            };

            // 스트리밍 응답 처리
            const abortController = await sendMessageStreamAPI(
                payload,
                // onChunk - 스트림 데이터 수신
                (chunk) => {
                    console.log("Received chunk:", chunk);

                    // 백엔드에서 보내는 다양한 청크 타입 처리
                    if (typeof chunk === "string") {
                        // 텍스트 청크인 경우
                        const currentState =
                            streamingStates.value.get(currentConvId);
                        updateStreamingState(currentConvId, {
                            streamingMessage:
                                (currentState?.streamingMessage || "") + chunk,
                        });
                    } else if (chunk.content) {
                        // 텍스트 컨텐츠 청크
                        const currentState =
                            streamingStates.value.get(currentConvId);
                        updateStreamingState(currentConvId, {
                            streamingMessage:
                                (currentState?.streamingMessage || "") +
                                chunk.content,
                        });
                    } else if (chunk.status) {
                        // 상태 업데이트
                        updateStreamingState(currentConvId, {
                            currentStatus: chunk.status,
                        });
                        console.log(
                            "Status update:",
                            chunk.status,
                            chunk.stage
                        );
                    } else if (chunk.search_complete) {
                        // 검색 완료
                        updateStreamingState(currentConvId, {
                            currentStatus: `${chunk.sources_count}개의 관련 정보를 찾았습니다. 답변 생성 중...`,
                        });
                    } else if (chunk.complete) {
                        // 처리 완료
                        updateStreamingState(currentConvId, {
                            currentStatus: `완료 (${chunk.processing_time?.toFixed(
                                2
                            )}초)`,
                        });
                        console.log("Processing complete:", chunk);
                    } else if (chunk.error) {
                        // 에러 처리
                        console.error("Stream error:", chunk.error);
                        if (chunk.content) {
                            const currentState =
                                streamingStates.value.get(currentConvId);
                            updateStreamingState(currentConvId, {
                                streamingMessage:
                                    (currentState?.streamingMessage || "") +
                                    chunk.content,
                            });
                        }
                        uiStore.setError(chunk.error);
                    } else if (chunk.delta && chunk.delta.content) {
                        // OpenAI 스타일 델타 응답 (호환성)
                        const currentState =
                            streamingStates.value.get(currentConvId);
                        updateStreamingState(currentConvId, {
                            streamingMessage:
                                (currentState?.streamingMessage || "") +
                                chunk.delta.content,
                        });
                    }
                },
                // onError - 에러 처리
                (error) => {
                    console.error("Streaming error:", error);
                    uiStore.setError("응답 생성 중 오류가 발생했습니다.");

                    // 현재 대화의 스트리밍 상태만 초기화
                    const currentState =
                        streamingStates.value.get(currentConvId);
                    updateStreamingState(currentConvId, {
                        isStreaming: false,
                        streamingMessage: "",
                        currentStatus: "",
                    });

                    // 부분 응답이 있으면 저장
                    if (currentState?.streamingMessage?.trim()) {
                        conversationStore.addMessage(currentConvId, {
                            role: "assistant",
                            content:
                                currentState.streamingMessage +
                                "\n\n*[오류로 인해 응답이 중단되었습니다]*",
                        });
                    }

                    abortControllers.value.delete(currentConvId);
                },
                // onComplete - 완료 처리
                () => {
                    console.log(
                        "Streaming complete:",
                        streamingStates.value.get(currentConvId)
                            ?.streamingMessage
                    );
                    const currentState =
                        streamingStates.value.get(currentConvId);

                    if (currentState?.streamingMessage?.trim()) {
                        conversationStore.addMessage(currentConvId, {
                            role: "assistant",
                            content: currentState.streamingMessage,
                        });
                    }

                    // 현재 대화의 스트리밍 상태만 초기화
                    updateStreamingState(currentConvId, {
                        isStreaming: false,
                        streamingMessage: "",
                        currentStatus: "",
                    });

                    abortControllers.value.delete(currentConvId);
                }
            );

            // abort controller 저장
            abortControllers.value.set(currentConvId, abortController);

            // 업로드된 파일 초기화
            uploadedFiles.value = [];
        } catch (error) {
            console.error("Send message error:", error);
            uiStore.setError("메시지 전송에 실패했습니다.");

            // 현재 대화의 스트리밍 상태만 초기화
            updateStreamingState(currentConvId, {
                isStreaming: false,
                streamingMessage: "",
                currentStatus: "",
            });

            abortControllers.value.delete(currentConvId);
        }
    };

    // 파일 추가
    const addFile = (file) => {
        // 파일 유효성 검사
        const allowedTypes = [
            "text/plain",
            "image/png",
            "image/jpeg",
            "image/jpg",
            "application/pdf",
        ];
        const maxSize = 10 * 1024 * 1024; // 10MB

        if (!allowedTypes.includes(file.type)) {
            uiStore.setError(
                "지원하지 않는 파일 형식입니다. (txt, png, jpg, pdf만 가능)"
            );
            return false;
        }

        if (file.size > maxSize) {
            uiStore.setError("파일 크기는 10MB 이하여야 합니다.");
            return false;
        }

        // 중복 파일 체크
        const isDuplicate = uploadedFiles.value.some(
            (f) => f.name === file.name && f.size === file.size
        );

        if (isDuplicate) {
            uiStore.setError("이미 추가된 파일입니다.");
            return false;
        }

        uploadedFiles.value.push(file);
        return true;
    };

    // 파일 제거
    const removeFile = (index) => {
        uploadedFiles.value.splice(index, 1);
    };

    // 스트리밍 중단
    const stopStreaming = () => {
        const currentConvId = conversationStore.currentConversationId;
        const abortController = abortControllers.value.get(currentConvId);

        if (abortController) {
            abortController();
            abortControllers.value.delete(currentConvId);
        }

        // 현재 대화의 스트리밍 상태만 초기화
        const currentState = streamingStates.value.get(currentConvId);
        updateStreamingState(currentConvId, {
            isStreaming: false,
            streamingMessage: "",
            currentStatus: "",
        });

        // 부분 응답이 있으면 저장
        if (currentState?.streamingMessage?.trim()) {
            conversationStore.addMessage(currentConvId, {
                role: "assistant",
                content:
                    currentState.streamingMessage +
                    "\n\n*[응답이 중단되었습니다]*",
            });
        }
    };

    // 대화 삭제 시 스트리밍 상태 정리
    const cleanupConversation = (conversationId) => {
        // 스트리밍 중단
        const abortController = abortControllers.value.get(conversationId);
        if (abortController) {
            abortController();
            abortControllers.value.delete(conversationId);
        }

        // 스트리밍 상태 제거
        streamingStates.value.delete(conversationId);
    };

    return {
        isStreaming,
        streamingMessage,
        uploadedFiles,
        currentStatus,
        sendMessage,
        addFile,
        removeFile,
        stopStreaming,
        cleanupConversation,
    };
});
