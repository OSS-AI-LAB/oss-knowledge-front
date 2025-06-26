import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const useConversationStore = defineStore("conversation", () => {
    // 대화 목록
    const conversations = ref([
        {
            id: "1",
            title: "새 채팅",
            messages: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
    ]);

    // 현재 선택된 대화 ID
    const currentConversationId = ref("1");

    // 검색어
    const searchQuery = ref("");

    // 현재 대화 가져오기
    const currentConversation = computed(() => {
        return conversations.value.find(
            (c) => c.id === currentConversationId.value
        );
    });

    // 필터링된 대화 목록
    const filteredConversations = computed(() => {
        if (!searchQuery.value) {
            return conversations.value;
        }

        return conversations.value.filter(
            (conv) =>
                conv.title
                    .toLowerCase()
                    .includes(searchQuery.value.toLowerCase()) ||
                conv.messages.some((msg) =>
                    msg.content
                        .toLowerCase()
                        .includes(searchQuery.value.toLowerCase())
                )
        );
    });

    // 새 대화 생성
    const createNewConversation = () => {
        const newConv = {
            id: Date.now().toString(),
            title: "새 채팅",
            messages: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        conversations.value.unshift(newConv);
        currentConversationId.value = newConv.id;
        saveToLocalStorage();

        return newConv;
    };

    // 대화 선택
    const selectConversation = (id) => {
        currentConversationId.value = id;
    };

    // 대화 삭제
    const deleteConversation = (id) => {
        const index = conversations.value.findIndex((c) => c.id === id);
        if (index > -1) {
            conversations.value.splice(index, 1);

            // 현재 대화가 삭제된 경우 새 대화 생성
            if (currentConversationId.value === id) {
                if (conversations.value.length > 0) {
                    currentConversationId.value = conversations.value[0].id;
                } else {
                    createNewConversation();
                }
            }

            saveToLocalStorage();
        }
    };

    // 대화 제목 변경
    const updateConversationTitle = (id, newTitle) => {
        const conv = conversations.value.find((c) => c.id === id);
        if (conv) {
            conv.title = newTitle;
            conv.updatedAt = new Date().toISOString();
            saveToLocalStorage();
        }
    };

    // 메시지 추가
    const addMessage = (conversationId, message) => {
        const conv = conversations.value.find((c) => c.id === conversationId);
        if (conv) {
            conv.messages.push({
                ...message,
                id: Date.now().toString(),
                timestamp: new Date().toISOString(),
            });
            conv.updatedAt = new Date().toISOString();

            // 첫 메시지인 경우 제목 자동 생성
            if (conv.messages.length === 1 && message.role === "user") {
                conv.title =
                    message.content.slice(0, 30) +
                    (message.content.length > 30 ? "..." : "");
            }

            // 대화 목록 최상단으로 이동
            const index = conversations.value.findIndex(
                (c) => c.id === conversationId
            );
            if (index > 0) {
                conversations.value.unshift(
                    conversations.value.splice(index, 1)[0]
                );
            }

            saveToLocalStorage();
        }
    };

    // 로컬 스토리지에 저장
    const saveToLocalStorage = () => {
        localStorage.setItem(
            "conversations",
            JSON.stringify(conversations.value)
        );
        localStorage.setItem(
            "currentConversationId",
            currentConversationId.value
        );
    };

    // 로컬 스토리지에서 불러오기
    const loadFromLocalStorage = () => {
        const saved = localStorage.getItem("conversations");
        if (saved) {
            conversations.value = JSON.parse(saved);
        }

        const savedId = localStorage.getItem("currentConversationId");
        if (savedId && conversations.value.find((c) => c.id === savedId)) {
            currentConversationId.value = savedId;
        }
    };

    return {
        conversations,
        currentConversationId,
        searchQuery,
        currentConversation,
        filteredConversations,
        createNewConversation,
        selectConversation,
        deleteConversation,
        updateConversationTitle,
        addMessage,
        loadFromLocalStorage,
    };
});
