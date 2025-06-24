import { defineStore } from "pinia";
import { ref } from "vue";
import { useConversationStore } from "./conversation";
import { useUIStore } from "./ui";
import { sendMessageStreamAPI, uploadFileAPI } from "@/services/api";

export const useChatStore = defineStore("chat", () => {
    const conversationStore = useConversationStore();
    const uiStore = useUIStore();

    // 채팅 상태
    const isStreaming = ref(false);
    const streamingMessage = ref("");
    const uploadedFiles = ref([]);
    const abortController = ref(null);

    // 메시지 전송
    const sendMessage = async (content, files = []) => {
        console.log("Sending message:", content, files);
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
            };

            conversationStore.addMessage(currentConvId, userMessage);

            // AI 응답 요청
            isStreaming.value = true;
            streamingMessage.value = "";

            // API 요청 페이로드
            const payload = {
                conversationId: currentConvId,
                message: content,
                files: uploadedFileData,
                stream: true,
            };

            // 스트리밍 응답 처리
            abortController.value = await sendMessageStreamAPI(
                payload,
                // onChunk - 스트림 데이터 수신
                (chunk) => {
                    console.log("Received chunk:", chunk);
                    if (typeof chunk === "string") {
                        // 텍스트 청크인 경우
                        streamingMessage.value += chunk;
                    } else if (chunk.content) {
                        // JSON 객체인 경우
                        streamingMessage.value += chunk.content;
                    } else if (chunk.delta && chunk.delta.content) {
                        // OpenAI 스타일 델타 응답
                        streamingMessage.value += chunk.delta.content;
                    }
                },
                // onError - 에러 처리
                (error) => {
                    console.error("Streaming error:", error);
                    uiStore.setError("응답 생성 중 오류가 발생했습니다.");
                    isStreaming.value = false;

                    // 부분 응답이 있으면 저장
                    if (streamingMessage.value.trim()) {
                        conversationStore.addMessage(currentConvId, {
                            role: "assistant",
                            content: streamingMessage.value,
                        });
                    }

                    streamingMessage.value = "";
                    abortController.value = null;
                },
                // onComplete - 완료 처리
                () => {
                    console.log("Streaming complete:", streamingMessage.value);
                    if (streamingMessage.value.trim()) {
                        conversationStore.addMessage(currentConvId, {
                            role: "assistant",
                            content: streamingMessage.value,
                        });
                    }

                    isStreaming.value = false;
                    streamingMessage.value = "";
                    abortController.value = null;
                }
            );

            // 업로드된 파일 초기화
            uploadedFiles.value = [];
        } catch (error) {
            console.error("Send message error:", error);
            uiStore.setError("메시지 전송에 실패했습니다.");
            isStreaming.value = false;
            streamingMessage.value = "";
            abortController.value = null;
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
        if (abortController.value) {
            abortController.value();
            abortController.value = null;
        }

        isStreaming.value = false;

        // 부분 응답이 있으면 저장
        if (streamingMessage.value.trim()) {
            conversationStore.addMessage(
                conversationStore.currentConversationId,
                {
                    role: "assistant",
                    content:
                        streamingMessage.value +
                        "\n\n*[응답이 중단되었습니다]*",
                }
            );
        }

        streamingMessage.value = "";
    };

    return {
        isStreaming,
        streamingMessage,
        uploadedFiles,
        sendMessage,
        addFile,
        removeFile,
        stopStreaming,
    };
});
