<template>
  <div
    class="conversation-item"
    :class="{ active }"
    @click="$emit('click')"
  >
    <div class="conversation-content">
      <h4 class="conversation-title">{{ conversation.title }}</h4>
      <p class="conversation-preview">{{ getPreview(conversation) }}</p>
    </div>

    <div class="conversation-actions" @click.stop>
      <button
        class="action-btn"
        @click="showMenu = !showMenu"
        title="옵션"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" fill="currentColor"/>
        </svg>
      </button>

      <!-- 드롭다운 메뉴 -->
      <div v-if="showMenu" class="dropdown-menu">
        <button @click="handleRename" class="menu-item">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="currentColor"/>
          </svg>
          <span>이름 변경</span>
        </button>
        <button @click="handleDelete" class="menu-item delete">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" fill="currentColor"/>
          </svg>
          <span>삭제</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  conversation: {
    type: Object,
    required: true
  },
  active: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['click', 'delete', 'rename'])

const showMenu = ref(false)

// 대화 미리보기 생성
const getPreview = (conversation) => {
  // 최신 업데이트 시간을 미리보기로 사용
  if (conversation.lastMessage) {
    return conversation.lastMessage
  }

  const date = new Date(conversation.updatedAt || conversation.createdAt)
  const now = new Date()
  const diff = now - date

  if (diff < 60000) { // 1분 이내
    return '방금 전'
  } else if (diff < 3600000) { // 1시간 이내
    const minutes = Math.floor(diff / 60000)
    return `${minutes}분 전`
  } else if (diff < 86400000) { // 24시간 이내
    const hours = Math.floor(diff / 3600000)
    return `${hours}시간 전`
  } else {
    return date.toLocaleDateString('ko-KR')
  }
}

// 이름 변경
const handleRename = () => {
  showMenu.value = false
  emit('rename')
}

// 삭제
const handleDelete = () => {
  showMenu.value = false
  if (confirm('이 대화를 삭제하시겠습니까?')) {
    emit('delete')
  }
}

// 외부 클릭 감지
const handleClickOutside = (event) => {
  if (showMenu.value && !event.target.closest('.conversation-actions')) {
    showMenu.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style lang="scss" scoped>
.conversation-item {
  position: relative;
  display: flex;
  align-items: center;
  padding: 12px 8px;
  margin: 2px 0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: var(--hover-bg);

    .conversation-actions {
      opacity: 1;
    }
  }

  &.active {
    background-color: var(--bg-tertiary);

    .conversation-title {
      font-weight: 600;
    }
  }
}

.conversation-content {
  flex: 1;
  min-width: 0;
  padding-right: 8px;
}

.conversation-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 2px;
}

.conversation-preview {
  font-size: 12px;
  color: var(--text-tertiary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.conversation-actions {
  opacity: 0;
  transition: opacity 0.2s;

  .action-btn {
    padding: 4px;
    background: none;
    border: none;
    border-radius: 4px;
    color: var(--text-secondary);
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      background-color: var(--bg-tertiary);
      color: var(--text-primary);
    }
  }
}

.dropdown-menu {
  position: absolute;
  right: 8px;
  top: 100%;
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 4px;
  min-width: 150px;
  z-index: 100;

  .menu-item {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    padding: 8px 12px;
    background: none;
    border: none;
    border-radius: 4px;
    font-size: 14px;
    color: var(--text-primary);
    cursor: pointer;
    transition: all 0.2s;
    text-align: left;

    &:hover {
      background-color: var(--hover-bg);
    }

    &.delete {
      color: #ef4444;

      &:hover {
        background-color: #fee2e2;
      }
    }
  }
}

[data-theme="dark"] {
  .dropdown-menu {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);

    .menu-item.delete:hover {
      background-color: rgba(239, 68, 68, 0.1);
    }
  }
}
</style>