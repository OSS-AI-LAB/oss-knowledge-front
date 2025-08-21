<template>
    <div class="px-6 py-6 last:pb-4 group" style="border-bottom: 1px solid var(--color-gray-100)">
        <div class="max-w-4xl mx-auto">
            <div class="flex gap-3">
                <!-- 아바타 -->
                <div class="flex-shrink-0 mt-1">
                    <div
                        v-if="message.role === 'assistant'"
                        class="w-7 h-7 rounded-full flex items-center justify-center"
                        style="background: linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600))"
                    >
                        <svg
                            class="w-3.5 h-3.5 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M13 10V3L4 14h7v7l9-11h-7z"
                            />
                        </svg>
                    </div>
                    <div
                        v-else
                        class="w-7 h-7 rounded-full bg-gray-700 flex items-center justify-center text-white font-medium text-xs"
                    >
                        NJ
                    </div>
                </div>

                <!-- 메시지 내용 -->
                <div class="flex-1 min-w-0">
                    <!-- 역할 표시 -->
                    <div class="mb-2">
                        <span class="text-sm font-medium text-gray-700">
                            {{ message.role === "assistant" ? "Claude" : "NJ" }}
                        </span>
                    </div>

                    <!-- 파일 첨부 표시 -->
                    <div
                        v-if="message.files && message.files.length > 0"
                        class="mb-3"
                    >
                        <div class="flex flex-wrap gap-2">
                            <div
                                v-for="(file, index) in message.files"
                                :key="index"
                                class="inline-flex items-center gap-2 px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-md text-sm hover:bg-gray-100 transition-colors"
                            >
                                <span class="text-base">{{
                                    getFileIcon(file.type)
                                }}</span>
                                <div class="flex flex-col">
                                    <span class="font-medium text-gray-800">{{
                                        file.name
                                    }}</span>
                                    <span class="text-xs text-gray-500">{{
                                        formatFileSize(file.size)
                                    }}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 멘션된 부서 표시 -->
                    <div
                        v-if="message.mentionedDepartments && message.mentionedDepartments.length > 0"
                        class="mb-3"
                    >
                        <div class="flex items-center gap-2 mb-1.5">
                            <span class="text-xs font-medium text-gray-600">멘션된 부서:</span>
                        </div>
                        <div class="flex flex-wrap gap-1.5">
                            <MentionTag
                                v-for="dept in message.mentionedDepartments"
                                :key="dept.id"
                                :department="dept"
                                :removable="false"
                            />
                        </div>
                    </div>

                    <!-- 메시지 텍스트 -->
                    <div
                        class="message-content prose prose-sm max-w-none text-gray-800 leading-relaxed"
                        v-html="parsedContent"
                    ></div>

                    <!-- 메시지 액션 버튼들 (Assistant 메시지에만 표시) -->
                    <div
                        v-if="message.role === 'assistant'"
                        class="flex items-center gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    >
                        <button
                            @click="copyMessage"
                            class="inline-flex items-center gap-1 px-2 py-1 text-xs text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-all duration-200"
                            title="복사"
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
                                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                />
                            </svg>
                            복사
                        </button>

                        <button
                            @click="regenerateResponse"
                            class="inline-flex items-center gap-1 px-2 py-1 text-xs text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-all duration-200"
                            title="다시 생성"
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
                                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                />
                            </svg>
                            다시 생성
                        </button>

                        <button
                            @click="likeMessage"
                            class="inline-flex items-center gap-1 px-2 py-1 text-xs text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-all duration-200"
                            title="좋아요"
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
                                    d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                                />
                            </svg>
                            좋아요
                        </button>

                        <button
                            @click="dislikeMessage"
                            class="inline-flex items-center gap-1 px-2 py-1 text-xs text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-all duration-200"
                            title="싫어요"
                        >
                            <svg
                                class="w-3 h-3"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                transform="rotate(180)"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                                />
                            </svg>
                            싫어요
                        </button>
                    </div>

                    <!-- 시간 표시 -->
                    <div class="text-xs text-gray-400 mt-2">
                        {{ formatTime(message.timestamp) }}
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from "vue";
import { parseMarkdown } from "@/utils/markdown";
import { formatFileSize, getFileIcon } from "@/utils/fileHandler";
import { useUIStore } from "@/stores/ui";
import MentionTag from "./MentionTag.vue";

const props = defineProps({
    message: {
        type: Object,
        required: true,
    },
});

const uiStore = useUIStore();

// 마크다운 파싱
const parsedContent = computed(() => {
    return parseMarkdown(props.message.content);
});

// 시간 포맷팅
const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "방금 전";
    if (diffMins < 60) return `${diffMins}분 전`;
    if (diffHours < 24) return `${diffHours}시간 전`;
    if (diffDays < 7) return `${diffDays}일 전`;

    return date.toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

// 메시지 복사
const copyMessage = async () => {
    try {
        await navigator.clipboard.writeText(props.message.content);
        uiStore.setError("메시지가 클립보드에 복사되었습니다.");
    } catch (err) {
        uiStore.setError("복사에 실패했습니다.");
    }
};

// 응답 다시 생성
const regenerateResponse = () => {
    // TODO: 응답 재생성 로직 구현
    console.log("응답 다시 생성");
};

// 좋아요
const likeMessage = () => {
    // TODO: 피드백 로직 구현
    console.log("좋아요");
};

// 싫어요
const dislikeMessage = () => {
    // TODO: 피드백 로직 구현
    console.log("싫어요");
};
</script>

<style scoped>
/* 메시지 내용 스타일링 */
.message-content :deep(p) {
    @apply mb-3 last:mb-0 leading-relaxed;
}

.message-content :deep(pre) {
    @apply bg-gray-50 rounded-lg p-3 mb-3 overflow-x-auto border border-gray-200;
}

.message-content :deep(code) {
    @apply bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono;
}

.message-content :deep(pre code) {
    @apply bg-transparent p-0;
}

.message-content :deep(ul) {
    @apply list-disc pl-5 mb-3 space-y-1;
}

.message-content :deep(ol) {
    @apply list-decimal pl-5 mb-3 space-y-1;
}

.message-content :deep(blockquote) {
    @apply border-l-4 border-blue-300 pl-3 italic my-3 bg-blue-50 py-2 rounded-r-md;
}

.message-content :deep(h1) {
    @apply text-xl font-bold mb-3 mt-5 first:mt-0;
}

.message-content :deep(h2) {
    @apply text-lg font-bold mb-2 mt-4 first:mt-0;
}

.message-content :deep(h3) {
    @apply text-base font-bold mb-2 mt-3 first:mt-0;
}

.message-content :deep(table) {
    @apply w-full border-collapse border border-gray-300 mb-3 rounded-lg overflow-hidden;
}

.message-content :deep(th) {
    @apply border border-gray-300 px-3 py-2 bg-gray-50 font-semibold;
}

.message-content :deep(td) {
    @apply border border-gray-300 px-3 py-2;
}
</style>
