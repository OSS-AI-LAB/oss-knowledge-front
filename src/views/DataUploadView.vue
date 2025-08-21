<template>
  <div class="h-full flex flex-col" style="background-color: var(--color-bg-secondary)">
    <!-- 헤더 -->
    <div class="bg-white border-b px-6 py-4" style="border-color: var(--color-border-light)">
      <div class="max-w-6xl mx-auto">
        <h1 class="text-2xl font-bold" style="color: var(--color-gray-900)">데이터 업로드</h1>
        <p class="mt-1" style="color: var(--color-gray-600)">OSS Knowledge 및 개별 RAG 시스템에 사용할 문서를 업로드하세요</p>
      </div>
    </div>

    <!-- 메인 컨텐츠 -->
    <div class="flex-1 overflow-y-auto">
      <div class="max-w-6xl mx-auto p-6 space-y-6">
        <!-- 업로드 영역 -->
        <div class="bg-white rounded-xl shadow-md border-0 overflow-hidden">
          <div class="p-6">
            <div class="text-center mb-6">
              <h2 class="text-2xl font-bold mb-2" style="color: var(--color-gray-900)">파일 업로드</h2>
              <p class="text-gray-600 text-sm">문서를 업로드하여 지식 베이스를 구축하세요</p>
            </div>
            
            <!-- 부서 선택 -->
            <div class="mb-6">
              <label class="block text-base font-semibold mb-3 text-center" style="color: var(--color-gray-800)">
                업로드 대상 선택
              </label>
              <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 max-w-3xl mx-auto">
                <button
                  @click="selectedDepartment = null"
                  :class="[
                    'group relative p-4 rounded-xl border-2 transition-all duration-200 text-center',
                    selectedDepartment === null 
                      ? 'border-primary-500 bg-primary-50 shadow-md' 
                      : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                  ]"
                >
                  <div class="text-2xl mb-2">🏢</div>
                  <div class="text-xs font-medium mb-1" style="color: var(--color-gray-900)">OSS Knowledge</div>
                  <div class="text-xs" style="color: var(--color-gray-600)">일반 문서</div>
                  <div v-if="selectedDepartment === null" class="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary-500"></div>
                </button>
                <button
                  v-for="dept in departments"
                  :key="dept.id"
                  @click="selectedDepartment = dept.id"
                  :class="[
                    'group relative p-4 rounded-xl border-2 transition-all duration-200 text-center',
                    selectedDepartment === dept.id 
                      ? 'border-primary-500 bg-primary-50 shadow-md' 
                      : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                  ]"
                >
                  <div class="text-2xl mb-2">{{ dept.icon }}</div>
                  <div class="text-xs font-medium mb-1" style="color: var(--color-gray-900)">{{ dept.name }}</div>
                  <div class="text-xs" style="color: var(--color-gray-600)">{{ dept.description }}</div>
                  <div v-if="selectedDepartment === dept.id" class="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary-500"></div>
                </button>
              </div>
              <div v-if="selectedDepartment" class="mt-4 text-center">
                <div class="inline-flex items-center px-3 py-1.5 rounded-full bg-primary-100 text-primary-800 text-sm">
                  <svg class="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <span class="font-medium">{{ getSelectedDepartmentName() }}</span>
                  <span class="ml-2 text-xs opacity-75">{{ getSelectedDepartmentDescription() }}</span>
                </div>
              </div>
            </div>      
      
            <!-- 드래그 앤 드롭 영역 -->
            <div
              @drop="handleDrop"
              @dragover.prevent
              @dragenter="handleDragEnter"
              @dragleave="handleDragLeave"
              :class="[
                'border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 relative',
                isDragOver ? 'border-primary-400 bg-primary-50' : 'border-gray-300 hover:border-primary-300 hover:bg-gray-50'
              ]"
            >
              <div class="space-y-4">
                <div class="mx-auto w-16 h-16 rounded-full flex items-center justify-center bg-primary-100">
                  <svg class="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                  </svg>
                </div>
                <div>
                  <p class="text-lg font-medium mb-2" style="color: var(--color-gray-900)">
                    {{ selectedDepartment ? `${getSelectedDepartmentName()}에 파일을 드래그하여 업로드하거나` : '파일을 드래그하여 업로드하거나' }}
                  </p>
                  <button
                    @click="triggerFileInput"
                    class="inline-flex items-center px-4 py-2 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600 transition-colors duration-200"
                  >
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                    </svg>
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
                <div class="flex items-center justify-center space-x-4 text-sm" style="color: var(--color-gray-500)">
                  <span class="flex items-center">
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    PDF, TXT, MD, DOC, DOCX
                  </span>
                  <span class="flex items-center">
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                    </svg>
                    최대 10MB
                  </span>
                </div>
              </div>
            </div>

            <!-- 선택된 파일 목록 -->
            <div v-if="selectedFiles.length > 0" class="mt-6">
              <div class="text-center mb-3">
                <h3 class="text-base font-semibold mb-1" style="color: var(--color-gray-900)">
                  선택된 파일 ({{ selectedFiles.length }}개)
                </h3>
                <p v-if="selectedDepartment" class="text-sm" style="color: var(--color-primary-600)">
                  → {{ getSelectedDepartmentName() }}에 업로드됩니다
                </p>
              </div>
              <div class="space-y-2 max-w-2xl mx-auto">
                <div
                  v-for="(file, index) in selectedFiles"
                  :key="index"
                  class="flex items-center justify-between p-3 rounded-lg transition-colors duration-200 hover:bg-gray-50"
                  style="background: var(--color-primary-50); border: 1px solid var(--color-primary-200)"
                >
                  <div class="flex items-center space-x-3">
                    <div class="w-8 h-8 rounded-lg flex items-center justify-center bg-primary-500">
                      <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                      </svg>
                    </div>
                    <div>
                      <p class="text-sm font-medium" style="color: var(--color-gray-900)">{{ file.name }}</p>
                      <p class="text-xs" style="color: var(--color-primary-600)">{{ formatFileSize(file.size) }}</p>
                    </div>
                  </div>
                  <button
                    @click="removeFile(index)"
                    class="p-1.5 transition-colors duration-200 rounded hover:bg-red-100"
                    style="color: var(--color-gray-400)"
                  >
                    <svg class="w-4 h-4 hover:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <!-- 업로드 버튼 -->
            <div v-if="selectedFiles.length > 0" class="mt-6 text-center">
              <button
                @click="uploadFiles"
                :disabled="isUploading"
                class="inline-flex items-center px-6 py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span v-if="isUploading" class="flex items-center">
                  <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  업로드 중...
                </span>
                <span v-else class="flex items-center">
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                  {{ selectedDepartment ? `${getSelectedDepartmentName()}에 업로드` : '업로드 시작' }}
                </span>
              </button>
            </div>
          </div>
        </div>

        <!-- RAG 관리 링크 -->
        <div class="bg-blue-50 rounded-xl shadow-md border-0">
          <div class="p-6 text-center">
            <div class="mb-4">
              <div class="mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-3 bg-blue-500">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
              </div>
              <h2 class="text-xl font-bold mb-2" style="color: var(--color-gray-900)">RAG 시스템 관리</h2>
              <p class="text-gray-600 mb-4 text-sm">
                업로드된 문서를 확인하고 RAG 시스템을 관리하세요
              </p>
              <router-link
                to="/rag-management"
                class="inline-flex items-center px-4 py-2 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors duration-200"
              >
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                </svg>
                RAG 관리 페이지로 이동
              </router-link>
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
import { useRAGDepartmentsStore } from '@/stores/ragDepartments'

const dataUploadStore = useDataUploadStore()
const ragDepartmentsStore = useRAGDepartmentsStore()

// 반응형 상태
const selectedFiles = ref([])
const isDragOver = ref(false)
const isUploading = ref(false)
const fileInput = ref(null)
const selectedDepartment = ref(null)

// 계산된 속성
const departments = computed(() => ragDepartmentsStore.departments)

// 선택된 부서 이름 가져오기
const getSelectedDepartmentName = () => {
  if (!selectedDepartment.value) return 'OSS Knowledge'
  const dept = ragDepartmentsStore.getDepartmentById(selectedDepartment.value)
  return dept ? dept.name : '알 수 없음'
}

// 선택된 부서 설명 가져오기
const getSelectedDepartmentDescription = () => {
  if (!selectedDepartment.value) return '일반적인 문서 업로드'
  const dept = ragDepartmentsStore.getDepartmentById(selectedDepartment.value)
  return dept ? dept.description : ''
}

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
    await dataUploadStore.uploadFiles(selectedFiles.value, selectedDepartment.value)
    selectedFiles.value = []
    alert(`파일 업로드가 완료되었습니다.${selectedDepartment.value ? ` (${getSelectedDepartmentName()})` : ''}`)
  } catch (error) {
    alert('업로드 중 오류가 발생했습니다: ' + error.message)
  } finally {
    isUploading.value = false
  }
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



// 드래그 이벤트 처리
const handleDragEnter = () => {
  isDragOver.value = true
}

const handleDragLeave = () => {
  isDragOver.value = false
}

// 컴포넌트 마운트 시 부서 목록 로드
onMounted(() => {
  // 부서 목록만 로드 (문서는 RAG 관리 페이지에서 관리)
})
</script>