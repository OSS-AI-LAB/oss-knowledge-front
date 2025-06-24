<template>
  <div ref="scrollContainer" class="h-full overflow-y-auto bg-gray-50" @scroll="handleScroll">
    <!-- 환영 메시지 -->
    <div v-if="!messages || messages.length === 0" class="h-full flex items-center justify-center">
      <div class="text-center max-w-2xl mx-auto px-6 pb-32">
        <div class="mb-8">
          <div class="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 class="text-3xl font-semibold text-gray-900 mb-2">안녕하세요!</h1>
          <p class="text-lg text-gray-600">
            무엇을 도와드릴까요?
          </p>
        </div>

        <!-- 예시 질문들 -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
          <button
            v-for="suggestion in suggestions"
            :key="suggestion.text"
            @click="handleSuggestionClick(suggestion.text)"
            class="p-4 text-left bg-white border border-gray-200 rounded-2xl hover:border-orange-300 hover:bg-orange-50 transition-all duration-200 group shadow-sm hover:shadow-md"
          >
            <div class="flex items-start gap-3">
              <span class="text-xl">{{ suggestion.icon }}</span>
              <div>
                <p class="font-medium text-gray-900 group-hover:text-orange-600">{{ suggestion.title }}</p>
                <p class="text-sm text-gray-500 mt-1">{{ suggestion.description }}</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>

    <!-- 메시지 목록 -->
    <div v-else class="pt-6 pb-4">
      <MessageItem
        v-for="message in messages"
        :key="message.id"
        :message="message"
      />

      <!-- 스트리밍 메시지 -->
      <div v-if="chatStore.isStreaming" class="px-6 py-6" ref="streamingMessageRef">
        <div class="max-w-4xl mx-auto">
          <div class="flex gap-4">
            <div class="flex-shrink-0 mt-1">
              <div class="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
            <div class="flex-1 min-w-0">
              <div class="mb-2">
                <span class="text-sm font-semibold text-gray-900">Claude</span>
              </div>
              
              <!-- 상태 표시 -->
              <div v-if="chatStore.currentStatus" class="mb-2">
                <div class="flex items-center gap-2 text-sm text-orange-600">
                  <div class="flex space-x-1">
                    <div class="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                    <div class="w-2 h-2 bg-orange-500 rounded-full animate-pulse" style="animation-delay: 0.2s"></div>
                    <div class="w-2 h-2 bg-orange-500 rounded-full animate-pulse" style="animation-delay: 0.4s"></div>
                  </div>
                  {{ chatStore.currentStatus }}
                </div>
              </div>
              
              <div class="message-content prose prose-lg max-w-none" v-html="streamingHtml"></div>
              <span class="inline-block w-3 h-5 bg-orange-500 animate-pulse ml-1 rounded-sm"></span>
            </div>
          </div>
        </div>
      </div>

      <!-- 하단 여백 -->
      <div class="h-4"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import { useConversationStore } from '@/stores/conversation'
import { useChatStore } from '@/stores/chat'
import { parseMarkdown } from '@/utils/markdown'
import MessageItem from './MessageItem.vue'

const conversationStore = useConversationStore()
const chatStore = useChatStore()

const scrollContainer = ref(null)
const streamingMessageRef = ref(null)
const isUserScrolling = ref(false)
const lastScrollTop = ref(0)
let scrollTimeout = null
let isAutoScrolling = ref(false)

// 제안 질문들
const suggestions = ref([
  {
    icon: '💡',
    title: 'Vue.js 프로젝트 개선',
    description: '코드 구조나 성능 최적화에 대해 문의하세요',
    text: 'Vue.js 프로젝트의 성능을 개선하는 방법을 알려주세요'
  },
  {
    icon: '🎨',
    title: 'UI/UX 디자인',
    description: '사용자 인터페이스 개선 아이디어를 얻어보세요',
    text: '현대적인 웹 인터페이스 디자인 트렌드를 알려주세요'
  },
  {
    icon: '🔧',
    title: '코드 리뷰',
    description: '작성한 코드의 문제점을 찾아보세요',
    text: '제 Vue.js 코드를 리뷰해주실 수 있나요?'
  },
  {
    icon: '📚',
    title: '학습 가이드',
    description: '새로운 기술을 배우는 방법을 알아보세요',
    text: 'Vue 3 Composition API를 효과적으로 학습하는 방법을 알려주세요'
  }
])

// 현재 대화의 메시지
const messages = computed(() => {
  return conversationStore.currentConversation?.messages || []
})

// 스트리밍 메시지 HTML
const streamingHtml = computed(() => {
  return parseMarkdown(chatStore.streamingMessage)
})

// 제안 클릭 처리
const handleSuggestionClick = (text) => {
  chatStore.sendMessage(text, [])
}

// 🔥 더 강력한 스크롤 함수
const scrollToBottom = (force = false) => {
  if (!scrollContainer.value) return

  // 디버깅용 로그
  console.log('🔄 스크롤 시도:', {
    force,
    isUserScrolling: isUserScrolling.value,
    scrollHeight: scrollContainer.value.scrollHeight,
    clientHeight: scrollContainer.value.clientHeight
  })

  nextTick(() => {
    if (!scrollContainer.value) return

    const container = scrollContainer.value
    const shouldScroll = force || !isUserScrolling.value || isNearBottom()

    if (shouldScroll) {
      isAutoScrolling.value = true
      
      // 즉시 스크롤 (부드러운 효과 없이)
      container.scrollTop = container.scrollHeight
      
      setTimeout(() => {
        isAutoScrolling.value = false
      }, 100)
      
      console.log('✅ 스크롤 완료:', container.scrollTop, container.scrollHeight)
    }
  })
}

// 하단 근처인지 체크
const isNearBottom = () => {
  if (!scrollContainer.value) return true
  
  const container = scrollContainer.value
  const threshold = 50
  return container.scrollHeight - container.scrollTop - container.clientHeight <= threshold
}

// 사용자 스크롤 감지
const handleScroll = () => {
  if (isAutoScrolling.value) return // 자동 스크롤 중에는 무시
  
  if (!scrollContainer.value) return

  const currentScrollTop = scrollContainer.value.scrollTop
  
  if (currentScrollTop < lastScrollTop.value && !isNearBottom()) {
    // 위로 스크롤하고 하단이 아닌 경우
    isUserScrolling.value = true
    console.log('👆 사용자 스크롤 감지')
  } else if (isNearBottom()) {
    // 하단 근처로 돌아온 경우
    isUserScrolling.value = false
    console.log('👇 하단 근처 도달')
  }

  lastScrollTop.value = currentScrollTop

  // 타임아웃 클리어
  if (scrollTimeout) {
    clearTimeout(scrollTimeout)
  }
  
  scrollTimeout = setTimeout(() => {
    isUserScrolling.value = false
    console.log('⏰ 스크롤 타임아웃 - 자동 스크롤 재활성화')
  }, 2000)
}

// 메시지 변경 감지
watch(messages, (newMessages, oldMessages) => {
  if (newMessages.length > (oldMessages?.length || 0)) {
    console.log('📨 새 메시지 추가')
    scrollToBottom(true)
  }
}, { deep: true })

// 스트리밍 시작
watch(() => chatStore.isStreaming, (isStreaming) => {
  if (isStreaming) {
    console.log('🎬 스트리밍 시작')
    isUserScrolling.value = false
    scrollToBottom(true)
  }
})

// 🔥 핵심: 스트리밍 메시지 실시간 스크롤
watch(() => chatStore.streamingMessage, (newMessage, oldMessage) => {
  if (newMessage && newMessage.length > (oldMessage?.length || 0)) {
    console.log('💬 스트리밍 메시지 업데이트:', newMessage.length)
    scrollToBottom()
  }
}, { flush: 'post' })

// 상태 변경 시 스크롤
watch(() => chatStore.currentStatus, () => {
  scrollToBottom()
})

onMounted(() => {
  console.log('🚀 MessageList 마운트됨')
  
  if (scrollContainer.value) {
    console.log('📏 컨테이너 크기:', {
      clientHeight: scrollContainer.value.clientHeight,
      scrollHeight: scrollContainer.value.scrollHeight
    })
  }
  
  nextTick(() => {
    scrollToBottom(true)
  })
})
</script>