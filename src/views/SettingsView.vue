<template>
  <div class="settings-view">
    <div class="settings-header">
      <button @click="goBack" class="back-button">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" fill="currentColor"/>
        </svg>
        뒤로
      </button>
      <h1>설정</h1>
    </div>

    <div class="settings-content">
      <!-- 테마 설정 -->
      <section class="settings-section">
        <h2>테마</h2>
        <div class="setting-item">
          <label>
            <input
              type="radio"
              name="theme"
              value="light"
              v-model="selectedTheme"
              @change="updateTheme"
            />
            <span>라이트 모드</span>
          </label>
        </div>
        <div class="setting-item">
          <label>
            <input
              type="radio"
              name="theme"
              value="dark"
              v-model="selectedTheme"
              @change="updateTheme"
            />
            <span>다크 모드</span>
          </label>
        </div>
        <div class="setting-item">
          <label>
            <input
              type="radio"
              name="theme"
              value="system"
              v-model="selectedTheme"
              @change="updateTheme"
            />
            <span>시스템 설정 따르기</span>
          </label>
        </div>
      </section>

      <!-- 채팅 설정 -->
      <section class="settings-section">
        <h2>채팅</h2>
        <div class="setting-item">
          <label class="switch-label">
            <span>Enter로 전송 (Shift+Enter로 줄바꿈)</span>
            <input
              type="checkbox"
              v-model="settings.enterToSend"
              @change="saveSettings"
            />
            <span class="switch"></span>
          </label>
        </div>
        <div class="setting-item">
          <label class="switch-label">
            <span>자동 저장</span>
            <input
              type="checkbox"
              v-model="settings.autoSave"
              @change="saveSettings"
            />
            <span class="switch"></span>
          </label>
        </div>
        <div class="setting-item">
          <label class="switch-label">
            <span>알림음</span>
            <input
              type="checkbox"
              v-model="settings.soundEnabled"
              @change="saveSettings"
            />
            <span class="switch"></span>
          </label>
        </div>
      </section>

      <!-- 표시 설정 -->
      <section class="settings-section">
        <h2>표시</h2>
        <div class="setting-item">
          <label for="fontSize">글꼴 크기</label>
          <select
            id="fontSize"
            v-model="settings.fontSize"
            @change="saveSettings"
            class="select-input"
          >
            <option value="small">작게</option>
            <option value="medium">보통</option>
            <option value="large">크게</option>
          </select>
        </div>
      </section>

      <!-- 데이터 관리 -->
      <section class="settings-section">
        <h2>데이터 관리</h2>
        <div class="setting-item">
          <p class="storage-info">
            저장 공간 사용량: {{ storageSize.kb }} KB
          </p>
        </div>
        <div class="setting-item">
          <button @click="exportData" class="action-button">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" fill="currentColor"/>
            </svg>
            데이터 내보내기
          </button>
        </div>
        <div class="setting-item">
          <button @click="clearAllData" class="action-button danger">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" fill="currentColor"/>
            </svg>
            모든 데이터 삭제
          </button>
        </div>
      </section>

      <!-- 정보 -->
      <section class="settings-section">
        <h2>정보</h2>
        <div class="setting-item">
          <p class="info-text">
            Claude Chat Clone v0.1.0<br>
            Vue.js로 제작된 AI 채팅 인터페이스
          </p>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useThemeStore } from '@/stores/theme'
import {
  saveSettings as saveSettingsToStorage,
  loadSettings,
  getStorageSize,
  clearStorage
} from '@/services/storage'
import { useConversationStore } from '@/stores/conversations'

const router = useRouter()
const themeStore = useThemeStore()
const conversationStore = useConversationStore()

const selectedTheme = ref('light')
const settings = ref({
  enterToSend: true,
  autoSave: true,
  soundEnabled: false,
  fontSize: 'medium'
})
const storageSize = ref({ kb: '0' })

// 뒤로 가기
const goBack = () => {
  router.back()
}

// 테마 업데이트
const updateTheme = () => {
  themeStore.setTheme(selectedTheme.value)
}

// 설정 저장
const saveSettings = () => {
  saveSettingsToStorage(settings.value)

  // 글꼴 크기 적용
  document.documentElement.style.fontSize = {
    small: '14px',
    medium: '16px',
    large: '18px'
  }[settings.value.fontSize]
}

// 데이터 내보내기
const exportData = () => {
  const data = {
    conversations: conversationStore.conversations,
    settings: settings.value,
    exportDate: new Date().toISOString()
  }

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `claude-chat-backup-${new Date().toISOString().split('T')[0]}.json`
  a.click()
  URL.revokeObjectURL(url)
}

// 모든 데이터 삭제
const clearAllData = () => {
  if (confirm('정말로 모든 데이터를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
    clearStorage()
    conversationStore.clearAllConversations()
    router.push('/')
  }
}

// 초기화
onMounted(() => {
  // 현재 테마 불러오기
  selectedTheme.value = localStorage.getItem('theme') || 'light'

  // 설정 불러오기
  settings.value = loadSettings()

  // 저장 공간 크기 계산
  storageSize.value = getStorageSize()

  // 글꼴 크기 적용
  document.documentElement.style.fontSize = {
    small: '14px',
    medium: '16px',
    large: '18px'
  }[settings.value.fontSize]
})
</script>

<style lang="scss" scoped>
.settings-view {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  min-height: 100vh;
}

.settings-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 32px;

  .back-button {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    background: none;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    color: var(--text-primary);
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      background-color: var(--hover-bg);
      border-color: var(--accent-color);
    }
  }

  h1 {
    font-size: 24px;
    font-weight: 600;
  }
}

.settings-content {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.settings-section {
  background-color: var(--bg-secondary);
  border-radius: 12px;
  padding: 24px;

  h2 {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 16px;
    color: var(--text-primary);
  }
}

.setting-item {
  margin-bottom: 16px;

  &:last-child {
    margin-bottom: 0;
  }

  label {
    display: flex;
    align-items: center;
    gap: 12px;
    cursor: pointer;
    font-size: 16px;
    color: var(--text-primary);

    input[type="radio"] {
      width: 20px;
      height: 20px;
    }
  }

  .switch-label {
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;

    input[type="checkbox"] {
      display: none;
    }

    .switch {
      position: relative;
      width: 48px;
      height: 24px;
      background-color: var(--border-color);
      border-radius: 24px;
      transition: background-color 0.2s;

      &::after {
        content: '';
        position: absolute;
        top: 2px;
        left: 2px;
        width: 20px;
        height: 20px;
        background-color: white;
        border-radius: 50%;
        transition: transform 0.2s;
      }
    }

    input:checked + .switch {
      background-color: var(--accent-color);

      &::after {
        transform: translateX(24px);
      }
    }
  }
}

.select-input {
  width: 100%;
  padding: 8px 12px;
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 16px;
  color: var(--text-primary);
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: var(--accent-color);
  }
}

.action-button {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 12px 16px;
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 16px;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: var(--hover-bg);
    border-color: var(--accent-color);
  }

  &.danger {
    color: #ef4444;

    &:hover {
      background-color: #fee2e2;
      border-color: #ef4444;
    }
  }
}

.storage-info {
  font-size: 14px;
  color: var(--text-secondary);
}

.info-text {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.6;
}

[data-theme="dark"] {
  .action-button.danger:hover {
    background-color: rgba(239, 68, 68, 0.1);
  }
}

@media (max-width: 768px) {
  .settings-view {
    padding: 16px;
  }

  .settings-section {
    padding: 16px;
  }
}
</style>