<template>
    <MainLayout />
</template>

<script setup>
import { onMounted } from "vue";
import { useConversationStore } from "@/stores/conversation";
import MainLayout from "@/components/layout/MainLayout.vue";

const conversationStore = useConversationStore();

onMounted(() => {
    // 저장된 대화 불러오기
    conversationStore.loadFromLocalStorage();
});
</script>
