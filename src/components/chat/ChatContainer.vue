<template>
  <div class="flex flex-col h-full bg-gray-50">
    <!-- 메시지 리스트 -->
    <div class="flex-1 overflow-hidden">
      <MessageList />
    </div>

    <!-- 입력 영역 - 메시지 영역과 통합된 디자인 -->
    <div class="bg-gray-50 pb-6">
      <div class="max-w-4xl mx-auto px-6">
        <ChatInput />
      </div>
    </div>
  </div>
</template>

<script setup>
import MessageList from './MessageList.vue'
import ChatInput from './ChatInput.vue'
</script>