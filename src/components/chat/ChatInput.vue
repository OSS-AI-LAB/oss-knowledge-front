<template>
    <div>
        <!-- 파일 업로드 컴포넌트 -->
        <FileUpload ref="fileUploadRef" />

        <!-- 메인 입력 영역 -->
        <div class="relative">
            <!-- 입력창 컨테이너 -->
            <div
                :class="[
                    'relative bg-white rounded-3xl border-2 transition-all duration-200 shadow-lg',
                    isFocused
                        ? 'border-blue-300 shadow-xl'
                        : 'border-gray-200 hover:border-gray-300',
                ]"
            >
                <!-- 텍스트 입력 영역 -->
                <div class="flex items-end">
                    <div class="flex-1">
                        <textarea
                            ref="textareaRef"
                            v-model="message"
                            @input="adjustHeight"
                            @keydown="handleKeydown"
                            @focus="isFocused = true"
                            @blur="isFocused = false"
                            @compositionstart="handleCompositionStart"
                            @compositionend="handleCompositionEnd"
                            :placeholder="placeholder"
                            :disabled="chatStore.isStreaming"
                            class="w-full px-6 py-4 bg-transparent resize-none focus:outline-none min-h-[60px] max-h-[200px] placeholder-gray-400 text-gray-900 leading-relaxed whitespace-pre-wrap break-words chat-textarea"
                            rows="1"
                            style="
                                word-wrap: break-word;
                                overflow-wrap: break-word;
                            "
                        ></textarea>
                    </div>

                    <!-- 버튼 영역 -->
                    <div class="flex items-end pb-3 pr-3 gap-2">
                        <!-- 파일 첨부 버튼 -->
                        <button
                            @click="$refs.fileUploadRef.openFileDialog()"
                            :disabled="chatStore.isStreaming"
                            class="p-2.5 text-gray-400 hover:text-gray-600 disabled:opacity-50 transition-colors rounded-lg hover:bg-gray-100"
                            title="파일 첨부 (Ctrl+U)"
                        >
                            <svg
                                class="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                                />
                            </svg>
                        </button>

                        <!-- 전송/중지 버튼 -->
                        <button
                            v-if="!chatStore.isStreaming"
                            @click="sendMessage"
                            :disabled="!canSend"
                            :class="[
                                'p-3 rounded-2xl transition-all duration-200 flex items-center justify-center',
                                canSend
                                    ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-md hover:shadow-lg'
                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed',
                            ]"
                            title="전송 (Enter)"
                        >
                            <svg
                                class="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                                />
                            </svg>
                        </button>

                        <!-- 중지 버튼 -->
                        <button
                            v-else
                            @click="stopGeneration"
                            class="p-3 bg-red-500 hover:bg-red-600 text-white rounded-2xl transition-colors shadow-md hover:shadow-lg flex items-center justify-center"
                            title="생성 중지"
                        >
                            <svg
                                class="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M21 12H3"
                                />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            <!-- 하단 정보 -->
            <div class="flex items-center justify-between mt-3 px-2">
                <div class="flex items-center gap-4 text-xs text-gray-500">
                    <span
                        v-if="chatStore.isStreaming"
                        class="flex items-center gap-2"
                    >
                        <div class="flex space-x-1">
                            <div
                                class="w-2 h-2 bg-blue-500 rounded-full animate-pulse"
                            ></div>
                            <div
                                class="w-2 h-2 bg-blue-500 rounded-full animate-pulse"
                                style="animation-delay: 0.2s"
                            ></div>
                            <div
                                class="w-2 h-2 bg-blue-500 rounded-full animate-pulse"
                                style="animation-delay: 0.4s"
                            ></div>
                        </div>
                        Claude가 응답하고 있습니다...
                    </span>
                    <span v-else class="flex items-center gap-2">
                        <span>
                            <kbd
                                class="px-2 py-1 bg-white rounded text-xs border border-gray-200"
                                >Enter</kbd
                            >로 전송
                        </span>
                        <span>
                            <kbd
                                class="px-2 py-1 bg-white rounded text-xs border border-gray-200"
                                >Shift + Enter</kbd
                            >로 줄바꿈
                        </span>
                    </span>
                </div>

                <div class="flex items-center gap-3 text-xs text-gray-400">
                    <span>{{ message.length }}/4000</span>
                    <span
                        v-if="chatStore.uploadedFiles.length > 0"
                        class="flex items-center gap-1"
                    >
                        <svg
                            class="w-3 h-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                            />
                        </svg>
                        {{ chatStore.uploadedFiles.length }}개 파일
                    </span>
                </div>
            </div>
        </div>

        <!-- 드래그 앤 드롭 오버레이 -->
        <Transition
            enter-active-class="transition-all duration-200 ease-out"
            enter-from-class="opacity-0 scale-95"
            enter-to-class="opacity-100 scale-100"
            leave-active-class="transition-all duration-150 ease-in"
            leave-from-class="opacity-100 scale-100"
            leave-to-class="opacity-0 scale-95"
        >
            <div
                v-if="isDragging"
                @drop.prevent="handleDrop"
                @dragover.prevent
                @dragleave="handleDragLeave"
                class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center backdrop-blur-sm"
            >
                <div
                    class="bg-white rounded-3xl p-12 shadow-2xl border-2 border-dashed border-blue-300 max-w-md text-center"
                >
                    <div
                        class="w-16 h-16 mx-auto mb-6 rounded-full bg-blue-100 flex items-center justify-center"
                    >
                        <svg
                            class="w-8 h-8 text-blue-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                            />
                        </svg>
                    </div>
                    <h3 class="text-xl font-semibold text-gray-900 mb-2">
                        파일을 여기에 놓으세요
                    </h3>
                    <p class="text-gray-500">
                        지원 형식: TXT, PNG, JPG, PDF<br />
                        <span class="text-sm">최대 10MB</span>
                    </p>
                </div>
            </div>
        </Transition>
    </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, onUnmounted } from "vue";
import { useChatStore } from "@/stores/chat";
import FileUpload from "./FileUpload.vue";

const chatStore = useChatStore();

const message = ref("");
const textareaRef = ref(null);
const fileUploadRef = ref(null);
const isDragging = ref(false);
const isFocused = ref(false);
const isComposing = ref(false);
const shouldSendOnCompositionEnd = ref(false);

const placeholder = computed(() => {
    return chatStore.isStreaming
        ? "응답을 기다리는 중..."
        : "Claude에게 메시지를 보내세요...";
});

const canSend = computed(() => {
    return (
        (message.value.trim() || chatStore.uploadedFiles.length > 0) &&
        !chatStore.isStreaming
    );
});

// 텍스트 영역 높이 자동 조절
const adjustHeight = () => {
    nextTick(() => {
        if (textareaRef.value) {
            // 현재 커서 위치 저장
            const cursorPosition = textareaRef.value.selectionStart;

            // 높이 재설정
            textareaRef.value.style.height = "auto";
            const scrollHeight = textareaRef.value.scrollHeight;
            const maxHeight = 200; // max-h-[200px]와 일치
            const newHeight = Math.min(scrollHeight, maxHeight);

            textareaRef.value.style.height = newHeight + "px";

            // 스크롤이 필요한 경우 스크롤 조정
            if (scrollHeight > maxHeight) {
                textareaRef.value.style.overflowY = "auto";
            } else {
                textareaRef.value.style.overflowY = "hidden";
            }

            // 커서 위치 복원
            textareaRef.value.setSelectionRange(cursorPosition, cursorPosition);
        }
    });
};

// 키보드 이벤트 처리
const handleKeydown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        // If composition is active, wait for it to complete
        if (isComposing.value) {
            // Mark that we should send when composition ends
            shouldSendOnCompositionEnd.value = true;
            return;
        } else {
            sendMessage();
        }
    } else if (event.ctrlKey && event.key === "u") {
        event.preventDefault();
        fileUploadRef.value?.openFileDialog();
    } else {
        // 다른 키 입력 시 텍스트 렌더링 보장
        nextTick(() => {
            adjustHeight();
        });
    }
};

// 메시지 전송
const sendMessage = () => {
    if (!canSend.value) return;

    chatStore.sendMessage(message.value, chatStore.uploadedFiles);
    message.value = "";

    // Reset textarea immediately without nextTick
    if (textareaRef.value) {
        textareaRef.value.style.height = "auto";
        textareaRef.value.style.overflowY = "hidden";
        textareaRef.value.focus();
    }
};

// 생성 중지
const stopGeneration = () => {
    chatStore.stopStreaming();
};

// 드래그 앤 드롭 처리
let dragCounter = 0;

const handleDragEnter = (event) => {
    event.preventDefault();
    dragCounter++;
    isDragging.value = true;
};

const handleDragLeave = (event) => {
    event.preventDefault();
    dragCounter--;
    if (dragCounter === 0) {
        isDragging.value = false;
    }
};

const handleDragOver = (event) => {
    event.preventDefault();
};

const handleDrop = (event) => {
    event.preventDefault();
    isDragging.value = false;
    dragCounter = 0;

    const files = Array.from(event.dataTransfer.files);
    files.forEach((file) => {
        chatStore.addFile(file);
    });
};

// Composition start handler
const handleCompositionStart = () => {
    isComposing.value = true;
    shouldSendOnCompositionEnd.value = false;
};

// Composition end handler
const handleCompositionEnd = () => {
    isComposing.value = false;
    if (shouldSendOnCompositionEnd.value) {
        shouldSendOnCompositionEnd.value = false;
        sendMessage();
    }
};

// 전역 드래그 이벤트 리스너
onMounted(() => {
    document.addEventListener("dragenter", handleDragEnter);
    document.addEventListener("dragover", handleDragOver);
    document.addEventListener("dragleave", handleDragLeave);

    // 텍스트 영역 초기화
    nextTick(() => {
        if (textareaRef.value) {
            textareaRef.value.style.height = "auto";
            textareaRef.value.style.overflowY = "hidden";
            adjustHeight();
        }
    });
});

onUnmounted(() => {
    document.removeEventListener("dragenter", handleDragEnter);
    document.removeEventListener("dragover", handleDragOver);
    document.removeEventListener("dragleave", handleDragLeave);
});
</script>
