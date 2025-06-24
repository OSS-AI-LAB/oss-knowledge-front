<template>
  <div class="flex flex-col h-full bg-gray-50 min-h-0">
    <!-- 메시지 리스트 - 고정 높이 보장 -->
    <div class="flex-1 min-h-0 overflow-hidden">
      <MessageList />
    </div>

    <!-- 입력 영역 - 고정 높이 -->
    <div class="flex-shrink-0 bg-gray-50 pb-6">
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