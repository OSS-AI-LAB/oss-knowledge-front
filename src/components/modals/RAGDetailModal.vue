<template>
  <div v-if="isVisible" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-xl shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
      <div class="p-6">
        <!-- 헤더 -->
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center space-x-4">
            <div class="text-4xl">{{ department?.icon }}</div>
            <div>
                              <h3 class="text-xl font-semibold" style="color: var(--color-gray-900)">
                  {{ department?.name }}
                </h3>
              <p class="text-sm" style="color: var(--color-gray-600)">
                {{ department?.description }}
              </p>
            </div>
          </div>
          <button
            @click="closeModal"
            class="p-2 transition-colors rounded-lg hover:bg-gray-100"
            style="color: var(--color-gray-400)"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <!-- 시스템 정보 -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div class="p-4 border rounded-lg" style="border-color: var(--color-border-light)">
            <div class="text-sm" style="color: var(--color-gray-500)">상태</div>
            <div class="mt-1">
              <span
                :class="[
                  'px-2 py-1 text-xs rounded-full font-medium',
                  department?.status === 'active' ? 'badge-success' :
                  department?.status === 'inactive' ? 'badge-error' :
                  'badge-warning'
                ]"
              >
                {{ getStatusText(department?.status) }}
              </span>
            </div>
          </div>
          
          <div class="p-4 border rounded-lg" style="border-color: var(--color-border-light)">
            <div class="text-sm" style="color: var(--color-gray-500)">문서 수</div>
            <div class="mt-1 text-lg font-semibold" style="color: var(--color-gray-900)">
              {{ documents.length }}개
            </div>
          </div>
          
          <div class="p-4 border rounded-lg" style="border-color: var(--color-border-light)">
            <div class="text-sm" style="color: var(--color-gray-500)">이번 달 쿼리</div>
            <div class="mt-1 text-lg font-semibold" style="color: var(--color-gray-900)">
              {{ department?.monthlyQueries || 0 }}회
            </div>
          </div>
        </div>

        <!-- 키워드 -->
        <div v-if="department?.keywords?.length" class="mb-6">
          <h4 class="text-sm font-medium mb-2" style="color: var(--color-gray-700)">키워드</h4>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="keyword in department.keywords"
              :key="keyword"
              class="px-3 py-1 text-xs rounded-full"
              style="background-color: var(--color-primary-100); color: var(--color-primary-700)"
            >
              {{ keyword }}
            </span>
          </div>
        </div>

        <!-- 문서 관리 섹션 -->
        <div class="border-t pt-6" style="border-color: var(--color-border-light)">
          <div class="flex items-center justify-between mb-4">
            <h4 class="text-lg font-semibold" style="color: var(--color-gray-900)">문서 관리</h4>
            <div class="flex items-center space-x-2">
              <button
                @click="showUploadModal = true"
                class="btn btn-primary btn-sm"
              >
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                </svg>
                문서 업로드
              </button>
              <button
                @click="refreshDocuments"
                class="p-2 transition-colors rounded-lg hover:bg-gray-50"
                style="color: var(--color-gray-400)"
                title="새로고침"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- 문서 목록 -->
          <div v-if="documents.length > 0" class="space-y-3">
            <div
              v-for="doc in documents"
              :key="doc.id"
              class="flex items-center justify-between p-4 border rounded-xl transition-all duration-200 hover:shadow-md"
              style="border-color: var(--color-border-light); background-color: var(--color-bg-primary)"
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
                  @click="downloadDocument(doc)"
                  class="p-2 transition-all duration-200 rounded-lg hover:bg-blue-50"
                  style="color: var(--color-gray-400)"
                  title="다운로드"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                </button>
                <button
                  @click="deleteDocument(doc.id)"
                  class="p-2 transition-all duration-200 rounded-lg hover:bg-red-50"
                  style="color: var(--color-gray-400)"
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
            <p style="color: var(--color-gray-500)">
              {{ department?.name }}에 업로드된 문서가 없습니다
            </p>
            <button
              @click="showUploadModal = true"
              class="btn btn-primary btn-sm mt-3"
            >
              첫 문서 업로드하기
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 문서 업로드 모달 -->
    <div v-if="showUploadModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
        <div class="p-6">
          <div class="flex items-center justify-between mb-6">
            <h4 class="text-lg font-semibold" style="color: var(--color-gray-900)">
              {{ department?.name }}에 문서 업로드
            </h4>
            <button
              @click="showUploadModal = false"
              class="p-2 transition-colors rounded-lg hover:bg-gray-100"
              style="color: var(--color-gray-400)"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <!-- 간단한 파일 업로드 -->
          <div class="space-y-4">
            <div
              @drop="handleDrop"
              @dragover.prevent
              @dragenter="handleDragEnter"
              @dragleave="handleDragLeave"
              :class="[
                'border-2 border-dashed rounded-xl p-6 text-center transition-all duration-300',
                isDragOver ? 'border-primary-400 bg-primary-50' : 'border-gray-300 hover:border-primary-300'
              ]"
            >
              <div class="space-y-3">
                <div class="mx-auto w-12 h-12 rounded-full flex items-center justify-center" style="background: linear-gradient(135deg, var(--color-primary-100), var(--color-secondary-100))">
                  <svg class="w-6 h-6" style="color: var(--color-primary-600)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                  </svg>
                </div>
                <div>
                  <p class="text-sm font-medium" style="color: var(--color-gray-900)">
                    파일을 드래그하여 업로드하거나
                  </p>
                  <button
                    @click="triggerFileInput"
                    class="btn btn-primary btn-sm mt-2"
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
              </div>
            </div>

            <!-- 선택된 파일 목록 -->
            <div v-if="selectedFiles.length > 0" class="space-y-2">
              <h5 class="text-sm font-medium" style="color: var(--color-gray-700)">선택된 파일</h5>
              <div
                v-for="(file, index) in selectedFiles"
                :key="index"
                class="flex items-center justify-between p-2 rounded-lg"
                style="background-color: var(--color-bg-tertiary)"
              >
                <span class="text-sm" style="color: var(--color-gray-900)">{{ file.name }}</span>
                <button
                  @click="removeFile(index)"
                  class="p-1 text-red-500 hover:bg-red-50 rounded"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>
            </div>

            <!-- 업로드 버튼 -->
            <div v-if="selectedFiles.length > 0" class="flex justify-end space-x-3 pt-4">
              <button
                @click="showUploadModal = false"
                class="px-4 py-2 text-sm font-medium border rounded-lg transition-colors hover:bg-gray-50"
                style="border-color: var(--color-border-light); color: var(--color-gray-700)"
              >
                취소
              </button>
              <button
                @click="uploadFiles"
                :disabled="isUploading"
                class="btn btn-primary btn-sm disabled:opacity-50"
              >
                <span v-if="isUploading" class="flex items-center">
                  <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  업로드 중...
                </span>
                <span v-else>업로드</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useDataUploadStore } from '@/stores/dataUpload'

const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false
  },
  department: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close'])

const dataUploadStore = useDataUploadStore()

// 반응형 상태
const showUploadModal = ref(false)
const selectedFiles = ref([])
const isDragOver = ref(false)
const isUploading = ref(false)
const fileInput = ref(null)

// 계산된 속성
const documents = computed(() => {
  if (!props.department) return []
  return dataUploadStore.getDepartmentDocuments(props.department.id)
})

// 상태 텍스트
const getStatusText = (status) => {
  const statusMap = {
    'active': '활성',
    'inactive': '비활성',
    'maintenance': '점검중',
    'processed': '처리완료',
    'processing': '처리중',
    'failed': '실패'
  }
  return statusMap[status] || status
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

// 파일 업로드 관련 메서드
const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileSelect = (event) => {
  const files = Array.from(event.target.files)
  addFiles(files)
  event.target.value = ''
}

const handleDrop = (event) => {
  event.preventDefault()
  isDragOver.value = false
  
  const files = Array.from(event.dataTransfer.files)
  addFiles(files)
}

const addFiles = (files) => {
  const validFiles = files.filter(file => {
    if (file.size > 10 * 1024 * 1024) {
      alert(`${file.name}은(는) 10MB를 초과합니다.`)
      return false
    }
    
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

const removeFile = (index) => {
  selectedFiles.value.splice(index, 1)
}

const uploadFiles = async () => {
  if (selectedFiles.value.length === 0) return
  
  isUploading.value = true
  
  try {
    await dataUploadStore.uploadFiles(selectedFiles.value, props.department.id)
    selectedFiles.value = []
    showUploadModal.value = false
    alert('파일 업로드가 완료되었습니다.')
  } catch (error) {
    alert('업로드 중 오류가 발생했습니다: ' + error.message)
  } finally {
    isUploading.value = false
  }
}

// 드래그 이벤트
const handleDragEnter = () => {
  isDragOver.value = true
}

const handleDragLeave = () => {
  isDragOver.value = false
}

// 문서 관리 메서드
const downloadDocument = async (doc) => {
  try {
    const blob = await dataUploadStore.downloadDocument(doc.id, props.department.id)
    
    const downloadUrl = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = doc.name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(downloadUrl)
  } catch (error) {
    alert('다운로드 중 오류가 발생했습니다: ' + error.message)
  }
}

const deleteDocument = async (id) => {
  if (confirm('이 문서를 삭제하시겠습니까?')) {
    try {
      await dataUploadStore.deleteDocument(id, props.department.id)
    } catch (error) {
      alert('삭제 중 오류가 발생했습니다: ' + error.message)
    }
  }
}

const refreshDocuments = () => {
  dataUploadStore.fetchDocuments(props.department.id)
}

// 모달 닫기
const closeModal = () => {
  emit('close')
  showUploadModal.value = false
  selectedFiles.value = []
}

// props 변경 감지
watch(() => props.isVisible, (newVal) => {
  if (!newVal) {
    showUploadModal.value = false
    selectedFiles.value = []
  }
})
</script>
