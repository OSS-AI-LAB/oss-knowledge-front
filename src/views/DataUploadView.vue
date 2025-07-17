<template>
  <div class="h-full flex flex-col" style="background-color: var(--color-bg-secondary)">
    <!-- 헤더 -->
    <div class="bg-white border-b px-6 py-4" style="border-color: var(--color-border-light)">
      <div class="max-w-4xl mx-auto">
        <h1 class="text-2xl font-bold" style="color: var(--color-gray-900)">데이터 업로드</h1>
        <p class="mt-1" style="color: var(--color-gray-600)">RAG 시스템에 사용할 문서와 데이터를 업로드하세요</p>
      </div>
    </div>

    <!-- 메인 컨텐츠 -->
    <div class="flex-1 overflow-y-auto">
      <div class="max-w-4xl mx-auto p-6 space-y-8">
        <!-- 업로드 영역 -->
        <div class="bg-white rounded-xl shadow-sm border" style="border-color: var(--color-border-light)">
          <div class="p-6">
            <h2 class="text-lg font-semibold mb-4" style="color: var(--color-gray-900)">파일 업로드</h2>
            
            <!-- 드래그 앤 드롭 영역 -->
            <div
              @drop="handleDrop"
              @dragover.prevent
              @dragenter="handleDragEnter"
              @dragleave="handleDragLeave"
              :class="[
                'border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300',
                isDragOver ? 'border-primary-400 bg-primary-50 scale-105' : 'border-gray-300 hover:border-primary-300 hover:bg-primary-25'
              ]"
              :style="isDragOver ? 'border-color: var(--color-primary-400); background-color: var(--color-primary-50)' : 'border-color: var(--color-gray-300)'"
            >
              <div class="space-y-4">
                <div class="mx-auto w-16 h-16 rounded-full flex items-center justify-center" style="background: linear-gradient(135deg, var(--color-primary-100), var(--color-secondary-100))">
                  <svg class="w-8 h-8" style="color: var(--color-primary-600)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                  </svg>
                </div>
                <div>
                  <p class="text-lg font-medium" style="color: var(--color-gray-900)">파일을 드래그하여 업로드하거나</p>
                  <button
                    @click="triggerFileInput"
                    class="btn btn-primary mt-3"
                  >
                    파일 선택
                  </button>
                  <input
                    ref="fileInput"
                    type="file"
                    multiple
                    accept=".pdf,.txt,.md,.doc,.docx"
                    @change="handleFileSelect"
                    class="hidden"
                  >
                </div>
                <p class="text-sm" style="color: var(--color-gray-500)">
                  지원 형식: PDF, TXT, MD, DOC, DOCX (최대 10MB)
                </p>
              </div>
            </div>

            <!-- 선택된 파일 목록 -->
            <div v-if="selectedFiles.length > 0" class="mt-6">
              <h3 class="text-sm font-medium mb-3" style="color: var(--color-gray-900)">선택된 파일 ({{ selectedFiles.length }}개)</h3>
              <div class="space-y-2">
                <div
                  v-for="(file, index) in selectedFiles"
                  :key="index"
                  class="flex items-center justify-between p-3 rounded-lg transition-all duration-200 hover:shadow-sm"
                  style="background-color: var(--color-bg-tertiary)"
                >
                  <div class="flex items-center space-x-3">
                    <div class="w-8 h-8 rounded-lg flex items-center justify-center" style="background: linear-gradient(135deg, var(--color-primary-100), var(--color-primary-200))">
                      <svg class="w-4 h-4" style="color: var(--color-primary-600)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                      </svg>
                    </div>
                    <div>
                      <p class="text-sm font-medium" style="color: var(--color-gray-900)">{{ file.name }}</p>
                      <p class="text-xs" style="color: var(--color-gray-500)">{{ formatFileSize(file.size) }}</p>
                    </div>
                  </div>
                  <button
                    @click="removeFile(index)"
                    class="p-1 transition-colors hover:bg-red-50 rounded-lg"
                    style="color: var(--color-gray-400)"
                    onmouseover="this.style.color='var(--color-error-500)'"
                    onmouseout="this.style.color='var(--color-gray-400)'"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <!-- 업로드 버튼 -->
            <div v-if="selectedFiles.length > 0" class="mt-6 flex justify-end">
              <button
                @click="uploadFiles"
                :disabled="isUploading"
                class="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span v-if="isUploading" class="flex items-center">
                  <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  업로드 중...
                </span>
                <span v-else>업로드 시작</span>
              </button>
            </div>
          </div>
        </div>

        <!-- 업로드된 문서 목록 -->
        <div class="bg-white rounded-xl shadow-sm border" style="border-color: var(--color-border-light)">
          <div class="p-6">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-lg font-semibold" style="color: var(--color-gray-900)">업로드된 문서</h2>
              <button
                @click="refreshDocuments"
                class="p-2 transition-colors rounded-lg hover:bg-gray-50"
                style="color: var(--color-gray-400)"
                onmouseover="this.style.color='var(--color-gray-600)'"
                onmouseout="this.style.color='var(--color-gray-400)'"
                title="새로고침"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                </svg>
              </button>
            </div>

            <!-- 문서 목록 -->
            <div v-if="documents.length > 0" class="space-y-3">
              <div
                v-for="doc in documents"
                :key="doc.id"
                class="flex items-center justify-between p-4 border rounded-xl transition-all duration-200 hover:shadow-md hover:scale-[1.01]"
                style="border-color: var(--color-border-light); background-color: var(--color-bg-primary)"
                onmouseover="this.style.backgroundColor='var(--color-bg-tertiary)'"
                onmouseout="this.style.backgroundColor='var(--color-bg-primary)'"
              >
                <div class="flex items-center space-x-4">
                  <div class="w-10 h-10 rounded-xl flex items-center justify-center" style="background: linear-gradient(135deg, var(--color-success-50), var(--color-success-100))">
                    <svg class="w-5 h-5" style="color: var(--color-success-600)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 class="text-sm font-medium" style="color: var(--color-gray-900)">{{ doc.name }}</h3>
                    <p class="text-xs" style="color: var(--color-gray-500)">
                      {{ formatFileSize(doc.size) }} • {{ formatDate(doc.uploadedAt) }}
                    </p>
                  </div>
                </div>
                <div class="flex items-center space-x-2">
                  <span
                    :class="[
                      'px-3 py-1 text-xs rounded-full font-medium',
                      doc.status === 'processed' ? 'badge-success' :
                      doc.status === 'processing' ? 'badge-warning' :
                      'badge-error'
                    ]"
                  >
                    {{ getStatusText(doc.status) }}
                  </span>
                  <button
                    @click="deleteDocument(doc.id)"
                    class="p-2 transition-all duration-200 rounded-lg hover:bg-red-50"
                    style="color: var(--color-gray-400)"
                    onmouseover="this.style.color='var(--color-error-500)'"
                    onmouseout="this.style.color='var(--color-gray-400)'"
                    title="삭제"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <!-- 빈 상태 -->
            <div v-else class="text-center py-12">
              <div class="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4" style="background: linear-gradient(135deg, var(--color-gray-100), var(--color-gray-200))">
                <svg class="w-8 h-8" style="color: var(--color-gray-400)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
              </div>
              <p style="color: var(--color-gray-500)">아직 업로드된 문서가 없습니다</p>
            </div>
          </div>
        </div>

        <!-- 통계 카드 -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="bg-white rounded-xl shadow-sm border p-6 transition-all duration-200 hover:shadow-md hover:scale-[1.02]" style="border-color: var(--color-border-light)">
            <div class="flex items-center">
              <div class="w-12 h-12 rounded-xl flex items-center justify-center" style="background: linear-gradient(135deg, var(--color-primary-100), var(--color-primary-200))">
                <svg class="w-6 h-6" style="color: var(--color-primary-600)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-2xl font-bold" style="color: var(--color-gray-900)">{{ documents.length }}</p>
                <p class="text-sm" style="color: var(--color-gray-500)">총 문서 수</p>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-xl shadow-sm border p-6 transition-all duration-200 hover:shadow-md hover:scale-[1.02]" style="border-color: var(--color-border-light)">
            <div class="flex items-center">
              <div class="w-12 h-12 rounded-xl flex items-center justify-center" style="background: linear-gradient(135deg, var(--color-success-100), var(--color-success-200))">
                <svg class="w-6 h-6" style="color: var(--color-success-600)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-2xl font-bold" style="color: var(--color-gray-900)">{{ processedCount }}</p>
                <p class="text-sm" style="color: var(--color-gray-500)">처리 완료</p>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-xl shadow-sm border p-6 transition-all duration-200 hover:shadow-md hover:scale-[1.02]" style="border-color: var(--color-border-light)">
            <div class="flex items-center">
              <div class="w-12 h-12 rounded-xl flex items-center justify-center" style="background: linear-gradient(135deg, var(--color-warning-100), var(--color-warning-200))">
                <svg class="w-6 h-6" style="color: var(--color-warning-600)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-2xl font-bold" style="color: var(--color-gray-900)">{{ processingCount }}</p>
                <p class="text-sm" style="color: var(--color-gray-500)">처리 중</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useDataUploadStore } from '@/stores/dataUpload'

const dataUploadStore = useDataUploadStore()

// 반응형 상태
const selectedFiles = ref([])
const isDragOver = ref(false)
const isUploading = ref(false)
const fileInput = ref(null)

// 계산된 속성
const documents = computed(() => dataUploadStore.documents)
const processedCount = computed(() => documents.value.filter(doc => doc.status === 'processed').length)
const processingCount = computed(() => documents.value.filter(doc => doc.status === 'processing').length)

// 파일 선택 트리거
const triggerFileInput = () => {
  fileInput.value?.click()
}

// 파일 선택 처리
const handleFileSelect = (event) => {
  const files = Array.from(event.target.files)
  addFiles(files)
  event.target.value = '' // 같은 파일 재선택 가능하도록
}

// 드래그 앤 드롭 처리
const handleDrop = (event) => {
  event.preventDefault()
  isDragOver.value = false
  
  const files = Array.from(event.dataTransfer.files)
  addFiles(files)
}

// 파일 추가
const addFiles = (files) => {
  const validFiles = files.filter(file => {
    // 파일 크기 체크 (10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert(`${file.name}은(는) 10MB를 초과합니다.`)
      return false
    }
    
    // 파일 형식 체크
    const allowedTypes = ['.pdf', '.txt', '.md', '.doc', '.docx']
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase()
    if (!allowedTypes.includes(fileExtension)) {
      alert(`${file.name}은(는) 지원하지 않는 형식입니다.`)
      return false
    }
    
    return true
  })
  
  selectedFiles.value.push(...validFiles)
}

// 파일 제거
const removeFile = (index) => {
  selectedFiles.value.splice(index, 1)
}

// 파일 업로드
const uploadFiles = async () => {
  if (selectedFiles.value.length === 0) return
  
  isUploading.value = true
  
  try {
    await dataUploadStore.uploadFiles(selectedFiles.value)
    selectedFiles.value = []
    alert('파일 업로드가 완료되었습니다.')
  } catch (error) {
    alert('업로드 중 오류가 발생했습니다: ' + error.message)
  } finally {
    isUploading.value = false
  }
}

// 문서 삭제
const deleteDocument = async (id) => {
  if (confirm('이 문서를 삭제하시겠습니까?')) {
    try {
      await dataUploadStore.deleteDocument(id)
    } catch (error) {
      alert('삭제 중 오류가 발생했습니다: ' + error.message)
    }
  }
}

// 문서 목록 새로고침
const refreshDocuments = () => {
  dataUploadStore.fetchDocuments()
}

// 파일 크기 포맷팅
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 날짜 포맷팅
const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 상태 텍스트
const getStatusText = (status) => {
  const statusMap = {
    'processed': '처리완료',
    'processing': '처리중',
    'failed': '실패'
  }
  return statusMap[status] || status
}

// 드래그 이벤트 처리
const handleDragEnter = () => {
  isDragOver.value = true
}

const handleDragLeave = () => {
  isDragOver.value = false
}

// 컴포넌트 마운트 시 문서 목록 로드
onMounted(() => {
  dataUploadStore.fetchDocuments()
})
</script>