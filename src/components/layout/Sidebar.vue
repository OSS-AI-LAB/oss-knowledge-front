<template>
    <!-- 접힌 상태의 세로 아이콘 바 -->
    <div
        v-if="isCollapsed"
        class="fixed md:relative inset-y-0 left-0 z-40 w-12 bg-gray-50 border-r border-gray-200 flex flex-col"
    >
        <!-- 상단 아이콘들 -->
        <div class="flex flex-col items-center py-4 space-y-2">
            <!-- 펼치기 버튼 -->
            <button
                @click="toggleCollapse"
                class="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                title="사이드바 펼치기"
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
                        d="M4 6h16M4 12h16M4 18h16"
                    />
                </svg>
            </button>

            <!-- 새 채팅 버튼 -->
            <button
                @click="conversationStore.createNewConversation()"
                class="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                title="새 채팅"
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
                        d="M12 4v16m8-8H4"
                    />
                </svg>
            </button>

            <!-- 검색 버튼 -->
            <button
                @click="expandForSearch"
                class="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                title="검색"
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
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                </svg>
            </button>

            <!-- 대화 아이콘들 -->
            <div class="border-t border-gray-200 pt-2 w-full">
                <div class="flex flex-col items-center space-y-1">
                    <div
                        v-for="conv in conversationStore.filteredConversations.slice(
                            0,
                            6
                        )"
                        :key="conv.id"
                        @click="conversationStore.selectConversation(conv.id)"
                        :class="[
                            'relative p-1.5 rounded-lg cursor-pointer transition-all duration-200 group',
                            conversationStore.currentConversationId === conv.id
                                ? 'bg-white shadow-sm border border-gray-200'
                                : 'hover:bg-gray-100',
                        ]"
                        :title="conv.title"
                    >
                        <!-- 대화 아이콘 -->
                        <svg
                            class="w-4 h-4 text-gray-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                            />
                        </svg>

                        <!-- 호버 시 제목 툴팁 -->
                        <div
                            class="absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50 pointer-events-none"
                        >
                            {{ conv.title }}
                        </div>
                    </div>

                    <!-- 더 많은 대화가 있을 때 -->
                    <div
                        v-if="
                            conversationStore.filteredConversations.length > 6
                        "
                        class="text-center"
                    >
                        <button
                            @click="toggleCollapse"
                            class="w-full p-1.5 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                            title="모든 대화 보기"
                        >
                            ⋯
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- 하단 아이콘들 -->
        <div
            class="mt-auto flex flex-col items-center pb-4 space-y-2 border-t border-gray-200 pt-2"
        >
            <!-- 사용자 아바타 -->
            <button
                @click="openUserMenu"
                class="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-white font-medium text-xs hover:ring-2 hover:ring-blue-200 transition-all"
                title="사용자 메뉴"
            >
                NJ
            </button>

            <!-- 설정 버튼 -->
            <button
                @click="openSettings"
                class="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                title="설정"
            >
                <svg
                    class="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                </svg>
            </button>
        </div>
    </div>

    <!-- 펼쳐진 상태의 사이드바 -->
    <Transition
        enter-active-class="transition-transform duration-300 ease-out"
        enter-from-class="-translate-x-full"
        enter-to-class="translate-x-0"
        leave-active-class="transition-transform duration-300 ease-in"
        leave-from-class="translate-x-0"
        leave-to-class="-translate-x-full"
    >
        <div
            v-if="!isCollapsed && isOpen"
            class="fixed md:relative inset-y-0 left-0 z-40 w-80 bg-gray-50 border-r border-gray-200 flex flex-col transition-all duration-300"
        >
            <!-- 상단 헤더 -->
            <div class="p-4 border-b border-gray-200">
                <div class="flex items-center justify-between">
                    <!-- 햄버거 메뉴 (항상 표시) -->
                    <button
                        @click="toggleCollapse"
                        class="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                        :title="
                            isCollapsed ? '사이드바 펼치기' : '사이드바 접기'
                        "
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
                                d="M4 6h16M4 12h16M4 18h16"
                            />
                        </svg>
                    </button>

                    <!-- 새 채팅 버튼 -->
                    <button
                        @click="conversationStore.createNewConversation()"
                        class="flex-1 ml-3 px-4 py-2 bg-white hover:bg-gray-50 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2 border border-gray-200 shadow-sm text-sm"
                    >
                        <svg
                            class="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M12 4v16m8-8H4"
                            />
                        </svg>
                        <span class="font-medium">새 채팅</span>
                    </button>
                </div>
            </div>

            <!-- 검색 영역 -->
            <div class="p-4 border-b border-gray-200">
                <div class="relative">
                    <input
                        v-model="conversationStore.searchQuery"
                        type="text"
                        placeholder="대화 검색..."
                        class="w-full px-4 py-2.5 pr-10 bg-white rounded-lg border border-gray-200 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                    />
                    <div class="absolute right-3 top-1/2 -translate-y-1/2">
                        <svg
                            class="w-4 h-4 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                        </svg>
                    </div>
                </div>
            </div>

            <!-- 대화 목록 -->
            <div class="flex-1 overflow-y-auto">
                <!-- 빈 상태 -->
                <div
                    v-if="conversationStore.filteredConversations.length === 0"
                    class="p-6 text-center"
                >
                    <div
                        class="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center"
                    >
                        <svg
                            class="w-6 h-6 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                            />
                        </svg>
                    </div>
                    <p class="text-sm text-gray-500">
                        {{
                            conversationStore.searchQuery
                                ? "검색 결과가 없습니다"
                                : "아직 대화가 없습니다"
                        }}
                    </p>
                </div>

                <!-- 대화 목록 -->
                <div v-else class="p-2 space-y-0.5">
                    <div
                        v-for="conv in conversationStore.filteredConversations"
                        :key="conv.id"
                        @click="conversationStore.selectConversation(conv.id)"
                        :class="[
                            'group relative px-2 py-1.5 rounded-lg cursor-pointer transition-all duration-200',
                            conversationStore.currentConversationId === conv.id
                                ? 'bg-white shadow-sm border border-gray-200'
                                : 'hover:bg-white hover:shadow-sm',
                        ]"
                        style="min-height: 44px"
                    >
                        <!-- 대화 내용 -->
                        <div class="pr-2">
                            <div class="flex items-center justify-between">
                                <h3
                                    :class="[
                                        'text-sm font-medium truncate',
                                        conversationStore.currentConversationId ===
                                        conv.id
                                            ? 'text-gray-900'
                                            : 'text-gray-700',
                                    ]"
                                >
                                    {{ conv.title }}
                                </h3>
                                <span
                                    class="text-xs text-gray-400 ml-2 whitespace-nowrap"
                                    >{{ formatDate(conv.updatedAt) }}</span
                                >
                            </div>
                            <p
                                class="text-xs text-gray-500 truncate mt-0.5"
                                style="max-width: 70%"
                            >
                                {{ getLastMessagePreview(conv).slice(0, 18) }}
                                <span
                                    v-if="
                                        getLastMessagePreview(conv).length > 18
                                    "
                                    >…</span
                                >
                            </p>
                        </div>

                        <!-- 액션 버튼들 -->
                        <div
                            class="absolute bottom-1.5 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        >
                            <!-- 편집 버튼 -->
                            <button
                                @click.stop="startEditing(conv.id)"
                                class="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                                title="제목 편집"
                            >
                                <svg
                                    class="w-3.5 h-3.5 text-gray-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="2"
                                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                    />
                                </svg>
                            </button>

                            <!-- 삭제 버튼 -->
                            <button
                                @click.stop="handleDelete(conv.id)"
                                class="p-1 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                                title="삭제"
                            >
                                <svg
                                    class="w-3.5 h-3.5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="2"
                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 하단 사용자 정보 -->
            <div class="border-t border-gray-200 bg-white">
                <div class="p-4">
                    <div class="flex items-center gap-3">
                        <div
                            class="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center text-white font-medium"
                        >
                            NJ
                        </div>
                        <div class="flex-1 min-w-0">
                            <p
                                class="text-sm font-medium text-gray-900 truncate"
                            >
                                NJ
                            </p>
                            <p class="text-xs text-gray-500 truncate">
                                nj@example.com
                            </p>
                        </div>

                        <!-- 설정 버튼 -->
                        <button
                            @click="openSettings"
                            class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            title="설정"
                        >
                            <svg
                                class="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                                />
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </Transition>

    <!-- 모바일 오버레이 -->
    <Transition
        enter-active-class="transition-opacity duration-300"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition-opacity duration-300"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
    >
        <div
            v-if="isOpen && uiStore.isMobile"
            @click="uiStore.toggleSidebar()"
            class="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
        ></div>
    </Transition>
</template>

<script setup>
import { ref, computed } from "vue";
import { useConversationStore } from "@/stores/conversation";
import { useUIStore } from "@/stores/ui";
import { useChatStore } from "@/stores/chat";

const conversationStore = useConversationStore();
const uiStore = useUIStore();
const chatStore = useChatStore();

const editingId = ref(null);
const isCollapsed = ref(false);

const isOpen = computed(() => uiStore.isSidebarOpen);

// 사이드바 접기/펼치기
const toggleCollapse = () => {
    isCollapsed.value = !isCollapsed.value;
    // 로컬 스토리지에 상태 저장
    localStorage.setItem("sidebarCollapsed", isCollapsed.value);
};

// 검색을 위해 펼치기
const expandForSearch = () => {
    isCollapsed.value = false;
    // 다음 틱에서 검색 입력창에 포커스
    setTimeout(() => {
        const searchInput = document.querySelector(
            'input[placeholder="대화 검색..."]'
        );
        if (searchInput) {
            searchInput.focus();
        }
    }, 300); // transition 시간 후
};

// 사용자 메뉴 열기
const openUserMenu = () => {
    // 접힌 상태에서 사용자 아바타 클릭 시 펼치기
    if (isCollapsed.value) {
        isCollapsed.value = false;
    }
};

// 마지막 메시지 미리보기
const getLastMessagePreview = (conversation) => {
    if (conversation.messages.length === 0) return "새 대화";

    const lastMessage = conversation.messages[conversation.messages.length - 1];
    const content = lastMessage.content.replace(/[#*`\n]/g, " ").trim();
    return content.length > 30 ? content.slice(0, 30) + "..." : content;
};

// 날짜 포맷팅
const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;

    if (diff < 60000) return "방금 전";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}분 전`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}시간 전`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}일 전`;

    return date.toLocaleDateString("ko-KR", {
        month: "short",
        day: "numeric",
    });
};

// 제목 편집 시작
const startEditing = (id) => {
    editingId.value = id;
    // TODO: 인라인 편집 모드 구현
    const newTitle = prompt("새 제목을 입력하세요:");
    if (newTitle && newTitle.trim()) {
        conversationStore.updateConversationTitle(id, newTitle.trim());
    }
    editingId.value = null;
};

// 대화 삭제
const handleDelete = (id) => {
    if (confirm("이 대화를 삭제하시겠습니까?")) {
        // 스트리밍 상태 정리
        chatStore.cleanupConversation(id);
        conversationStore.deleteConversation(id);
    }
};

// 설정 열기
const openSettings = () => {
    // TODO: 설정 모달 구현
    console.log("설정 열기");
};

// 컴포넌트 마운트 시 저장된 상태 복원
const restoreCollapsedState = () => {
    const saved = localStorage.getItem("sidebarCollapsed");
    if (saved !== null) {
        isCollapsed.value = saved === "true";
    }
};

// 초기화
restoreCollapsedState();
</script>
