<template>
    <!-- 사이드바 (접힌/펼쳐진 상태 통합) -->
    <div
        v-show="isOpen"
        class="fixed md:relative inset-y-0 left-0 z-40 flex flex-col shadow-sm transform transition-all duration-300 ease-in-out sidebar"
        :class="isCollapsed ? 'w-12' : 'w-80'"
        style="background-color: var(--color-bg-primary); border-right: 1px solid var(--color-border-light)"
    >
        <!-- 접힌 상태일 때 아이콘들 -->
        <div v-if="isCollapsed" class="flex flex-col h-full">
            <!-- 상단 아이콘들 -->
            <div class="flex flex-col items-center py-4 space-y-2">
                <!-- 펼치기 버튼 -->
                <button
                    @click="toggleCollapse"
                    class="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200"
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

                <!-- 채팅 페이지 버튼 -->
                <router-link
                    to="/"
                    class="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200"
                    :class="{ 'bg-primary-50 text-primary-600': $route.path === '/' }"
                    title="채팅"
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
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                    </svg>
                </router-link>

                <!-- 새 채팅 버튼 -->
                <button
                    @click="conversationStore.createNewConversation()"
                    class="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200"
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
                    class="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200"
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

                <!-- 모드 토글 (접힌 상태) -->
                <div class="p-2">
                    <div 
                        @click="uiStore.toggleMode()"
                        class="w-6 h-6 rounded-full cursor-pointer transition-all duration-200 flex items-center justify-center"
                        :class="uiStore.isKnowledgeMode ? 'bg-gradient-to-r from-secondary-400 to-secondary-500' : 'bg-gradient-to-r from-primary-400 to-primary-500'"
                        :title="uiStore.isAgentMode ? 'Knowledge 모드로 전환' : 'Agent 모드로 전환'"
                    >
                        <svg v-if="uiStore.isKnowledgeMode" class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        <svg v-else class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    </div>
                </div>

                <!-- 데이터 업로드 버튼 -->
                <router-link
                    to="/upload"
                    class="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200"
                    :class="{ 'bg-primary-50 text-primary-600': $route.path === '/upload' }"
                    title="데이터 업로드"
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
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                    </svg>
                </router-link>

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
                                    ? 'bg-primary-50 text-primary-600'
                                    : 'hover:bg-gray-100 text-gray-600',
                            ]"
                            :title="conv.title"
                        >
                            <!-- 대화 아이콘 -->
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
                    class="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center text-white font-medium text-xs hover:ring-2 hover:ring-blue-200 transition-all"
                    title="사용자 메뉴"
                >
                    NJ
                </button>

                <!-- 설정 버튼 -->
                <button
                    @click="openSettings"
                    class="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200"
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

        <!-- 펼쳐진 상태일 때 전체 사이드바 -->
        <div v-else class="flex flex-col h-full">
            <!-- 상단 헤더 -->
            <div class="p-4 border-b border-gray-200">
                <div class="flex items-center justify-between mb-4">
                    <!-- 햄버거 메뉴 (항상 표시) -->
                    <button
                        @click="toggleCollapse"
                        class="p-2 hover:bg-gray-100 rounded-lg transition-all duration-200"
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
                        class="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200"
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
                        새 채팅
                    </button>
                </div>

                <!-- 모드 토글 -->
                <div class="mb-4 flex justify-center">
                    <ModeToggle />
                </div>

                <!-- 네비게이션 버튼들 -->
                <div class="flex gap-2 justify-center">
                    <router-link
                        to="/"
                        class="flex items-center gap-2 px-4 py-2.5 text-base font-medium rounded-lg transition-all duration-200 flex-1 justify-center max-w-32"
                        :class="$route.path === '/' ? 'bg-primary-50 text-primary-600 border border-primary-200' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'"
                    >
                        <svg v-if="uiStore.isKnowledgeMode" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                        </svg>
                        <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        {{ uiStore.isKnowledgeMode ? '채팅' : 'Agent' }}
                    </router-link>
                    
                    <router-link
                        to="/upload"
                        class="flex items-center gap-2 px-4 py-2.5 text-base font-medium rounded-lg transition-all duration-200 flex-1 justify-center max-w-40"
                        :class="$route.path === '/upload' ? 'bg-primary-50 text-primary-600 border border-primary-200' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'"
                    >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                        </svg>
                        데이터 업로드
                    </router-link>
                </div>
            </div>

            <!-- 검색 영역 -->
            <div class="p-4 border-b border-gray-200">
                <div class="relative">
                    <input
                        v-model="conversationStore.searchQuery"
                        type="text"
                        placeholder="대화 검색..."
                        class="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                    <svg
                        class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
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

            <!-- 대화 목록 -->
            <div class="flex-1 overflow-y-auto">
                <div class="p-2">
                    <div
                        v-for="conv in conversationStore.filteredConversations"
                        :key="conv.id"
                        @click="conversationStore.selectConversation(conv.id)"
                        :class="[
                            'group flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200 hover:bg-gray-50',
                            conversationStore.currentConversationId === conv.id
                                ? 'bg-primary-50 border border-primary-200'
                                : '',
                        ]"
                    >
                        <!-- 대화 아이콘 -->
                        <div
                            :class="[
                                'flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center',
                                conversationStore.currentConversationId === conv.id
                                    ? 'bg-primary-100 text-primary-600'
                                    : 'bg-gray-100 text-gray-600',
                            ]"
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
                                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                                />
                            </svg>
                        </div>

                        <!-- 대화 정보 -->
                        <div class="flex-1 min-w-0">
                            <div class="text-sm font-medium text-gray-900 truncate">
                                {{ conv.title }}
                            </div>
                            <div class="text-xs text-gray-500 mt-1">
                                {{ formatTime(conv.updatedAt) }}
                            </div>
                        </div>

                        <!-- 액션 버튼들 -->
                        <div class="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <button
                                @click.stop="handleDelete(conv.id)"
                                class="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-all duration-200"
                                title="삭제"
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
                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 하단 사용자 영역 -->
            <div class="p-4 border-t border-gray-200">
                <div class="flex items-center gap-3">
                    <div class="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center text-white font-medium text-sm">
                        NJ
                    </div>
                    <div class="flex-1">
                        <div class="text-sm font-medium text-gray-900">NJ</div>
                        <div class="text-xs text-gray-500">사용자</div>
                    </div>
                    <button
                        @click="openSettings"
                        class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
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
import ModeToggle from "@/components/common/ModeToggle.vue";

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

// 시간 포맷팅 (formatTime 함수 추가)
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
