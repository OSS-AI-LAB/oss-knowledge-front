import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useDataUploadStore = defineStore('dataUpload', () => {
  // 상태
  const documents = ref([])
  const isLoading = ref(false)
  const error = ref(null)

  // 문서 목록 가져오기
  const fetchDocuments = async () => {
    isLoading.value = true
    error.value = null
    
    try {
      // API 호출 (실제 구현 시 교체)
      const response = await fetch('/api/documents')
      if (!response.ok) throw new Error('문서 목록을 가져오는데 실패했습니다')
      
      const data = await response.json()
      documents.value = data.documents || []
    } catch (err) {
      error.value = err.message
      // 개발 중에는 더미 데이터 사용
      documents.value = [
        {
          id: '1',
          name: 'sample-document.pdf',
          size: 1024000,
          status: 'processed',
          uploadedAt: new Date().toISOString()
        },
        {
          id: '2',
          name: 'user-manual.docx',
          size: 2048000,
          status: 'processing',
          uploadedAt: new Date(Date.now() - 3600000).toISOString()
        }
      ]
    } finally {
      isLoading.value = false
    }
  }

  // 파일 업로드
  const uploadFiles = async (files) => {
    isLoading.value = true
    error.value = null

    try {
      const formData = new FormData()
      files.forEach((file, index) => {
        formData.append(`files[${index}]`, file)
      })

      // API 호출 (실제 구현 시 교체)
      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) throw new Error('파일 업로드에 실패했습니다')

      const data = await response.json()
      
      // 업로드된 파일들을 문서 목록에 추가
      const newDocuments = files.map((file, index) => ({
        id: Date.now() + index,
        name: file.name,
        size: file.size,
        status: 'processing',
        uploadedAt: new Date().toISOString()
      }))
      
      documents.value.unshift(...newDocuments)
      
      // 실제 API 응답이 있다면 사용
      if (data.documents) {
        documents.value = [...data.documents, ...documents.value.filter(doc => 
          !data.documents.some(newDoc => newDoc.id === doc.id)
        )]
      }

      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // 문서 삭제
  const deleteDocument = async (id) => {
    isLoading.value = true
    error.value = null

    try {
      // API 호출 (실제 구현 시 교체)
      const response = await fetch(`/api/documents/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('문서 삭제에 실패했습니다')

      // 로컬 상태에서 제거
      documents.value = documents.value.filter(doc => doc.id !== id)
    } catch (err) {
      error.value = err.message
      // 개발 중에는 로컬에서만 제거
      documents.value = documents.value.filter(doc => doc.id !== id)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // 문서 상태 업데이트
  const updateDocumentStatus = (id, status) => {
    const doc = documents.value.find(d => d.id === id)
    if (doc) {
      doc.status = status
    }
  }

  // 에러 초기화
  const clearError = () => {
    error.value = null
  }

  return {
    documents,
    isLoading,
    error,
    fetchDocuments,
    uploadFiles,
    deleteDocument,
    updateDocumentStatus,
    clearError
  }
})