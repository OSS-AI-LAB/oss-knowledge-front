<template>
  <div class="chat-input-container">
    <div class="input-wrapper">
      <!-- 파일 업로드 영역 -->
      <div v-if="attachedFiles.length > 0" class="attached-files">
        <div v-for="(file, index) in attachedFiles" :key="index" class="file-chip">
          <span>{{ file.name }}</span>
          <button @click="removeFile(index)" class="remove-file">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="currentColor"/>
            </svg>
          </button>
        </div>
      </div>

      <div class="input-row">
        <!-- 파일 첨부 버튼 -->
        <button
          class="attach-button"
          @click="$refs.fileInput.click()"
          :disabled="disabled"
          title="파일 첨부"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z" fill="currentColor"/>
          </svg>
        </button>

        <!-- 텍스트 입력 -->
        <textarea
          ref="textareaRef"
          v-model="inputText"
          @keydown.enter="handleEnter"
          @input="adjustHeight"
          :placeholder="placeholder"
          :disabled="disabled"
          class="chat-textarea"
          rows="1"
        ></textarea>

        <!-- 전송 버튼 -->
        <button
          class="send-button"
          @click="sendMessage"
          :disabled="disabled || (!inputText.trim() && attachedFiles.length === 0)"
          title="전송 (Enter)"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" fill="currentColor"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- 파일 입력 (숨김) -->
    <input
      ref="fileInput"
      type="file"
      multiple
      @change="handleFileSelect"
      accept="image/*,.pdf,.txt,.doc,.docx,.xls,.xlsx,.csv,.json,.xml,.md"
      style="display: none"
    />

    <!-- 사용 안내 -->
    <div class="input-hint">
      <span>Enter로 전송, Shift+Enter로 줄바꿈</span>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted, watch } from 'vue'

const props = defineProps({
  disabled: {
    type: Boolean,
    default: false
  },
  placeholder: {
    type: String,
    default: '메시지를 입력하세요...'
  }
})

const emit = defineEmits(['send', 'file-upload'])

const textareaRef = ref(null)
const fileInput = ref(null)
const inputText = ref('')
const attachedFiles = ref([])

// 텍스트 영역 높이 자동 조절
const adjustHeight = () => {
  const textarea = textareaRef.value
  if (!textarea) return

  textarea.style.height = 'auto'
  const newHeight = Math.min(textarea.scrollHeight, 200)
  textarea.style.height = `${newHeight}px`
}

// Enter 키 처리
const handleEnter = (event) => {
  if (event.shiftKey) {
    // Shift+Enter: 줄바꿈
    return
  }

  event.preventDefault()
  sendMessage()
}

// 메시지 전송
const sendMessage = () => {
  const content = inputText.value.trim()

  if (!content && attachedFiles.value.length === 0) {
    return
  }

  emit('send', content)

  if (attachedFiles.value.length > 0) {
    emit('file-upload', [...attachedFiles.value])
    attachedFiles.value = []
  }

  inputText.value = ''
  nextTick(() => {
    adjustHeight()
    textareaRef.value?.focus()
  })
}

// 파일 선택 처리
const handleFileSelect = (event) => {
  const files = Array.from(event.target.files)

  files.forEach(file => {
    // 파일 크기 제한 (10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert(`${file.name}은(는) 10MB를 초과합니다.`)
      return
    }

    // 파일 객체에 URL 추가 (이미지 미리보기용)
    const fileWithUrl = {
      file: file,
      name: file.name,
      type: file.type,
      size: file.size,
      url: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
    }

    attachedFiles.value.push(fileWithUrl)
  })

  // 입력 초기화
  event.target.value = ''
}

// 파일 제거
const removeFile = (index) => {
  const file = attachedFiles.value[index]
  if (file.url) {
    URL.revokeObjectURL(file.url)
  }
  attachedFiles.value.splice(index, 1)
}

// disabled 상태 변경 시 포커스
watch(() => props.disabled, (newVal) => {
  if (!newVal) {
    nextTick(() => {
      textareaRef.value?.focus()
    })
  }
})

onMounted(() => {
  adjustHeight()
  textareaRef.value?.focus()
})
</script>

<style lang="scss" scoped>
.chat-input-container {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}

.input-wrapper {
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  overflow: hidden;
  transition: border-color 0.2s;

  &:focus-within {
    border-color: var(--accent-color);
  }
}

.attached-files {
  padding: 8px 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  border-bottom: 1px solid var(--border-color);

  .file-chip {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 8px;
    background-color: var(--bg-tertiary);
    border-radius: 16px;
    font-size: 12px;

    .remove-file {
      background: none;
      border: none;
      padding: 2px;
      cursor: pointer;
      color: var(--text-tertiary);
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      transition: all 0.2s;

      &:hover {
        background-color: var(--hover-bg);
        color: var(--text-primary);
      }
    }
  }
}

.input-row {
  display: flex;
  align-items: flex-end;
  padding: 8px 12px;
  gap: 8px;
}

.attach-button,
.send-button {
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  color: var(--text-tertiary);
  border-radius: 8px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover:not(:disabled) {
    background-color: var(--hover-bg);
    color: var(--text-primary);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.send-button {
  color: var(--accent-color);

  &:hover:not(:disabled) {
    background-color: var(--accent-color);
    color: white;
  }
}

.chat-textarea {
  flex: 1;
  resize: none;
  border: none;
  outline: none;
  background: transparent;
  color: var(--text-primary);
  font-family: inherit;
  font-size: 16px;
  line-height: 1.5;
  padding: 4px 0;
  min-height: 24px;
  max-height: 200px;

  &::placeholder {
    color: var(--text-tertiary);
  }

  &:disabled {
    opacity: 0.5;
  }
}

.input-hint {
  text-align: center;
  font-size: 12px;
  color: var(--text-tertiary);
  margin-top: 8px;
}

@media (max-width: 768px) {
  .chat-textarea {
    font-size: 16px; // iOS 줌 방지
  }

  .input-hint {
    display: none;
  }
}
</style>