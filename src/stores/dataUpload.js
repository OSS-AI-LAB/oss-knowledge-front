import { defineStore } from 'pinia'
import { ref } from 'vue'
import { 
  getDocumentsAPI, 
  getDepartmentDocumentsAPI, 
  uploadDocumentsAPI, 
  uploadDepartmentDocumentsAPI,
  downloadDocumentAPI,
  downloadDepartmentDocumentAPI,
  deleteDocumentAPI,
  deleteDepartmentDocumentAPI,
  checkAzureFileShareConnectionAPI,
  syncAzureFileShareAPI
} from '@/services/api'

export const useDataUploadStore = defineStore('dataUpload', () => {
  // 상태
  const documents = ref([])
  const departmentDocuments = ref({}) // 부서별 문서 관리
  const isLoading = ref(false)
  const isSyncing = ref(false)
  const error = ref(null)
  const azureConnectionStatus = ref(null)

  // 문서 목록 가져오기
  const fetchDocuments = async (departmentId = null) => {
    isLoading.value = true
    error.value = null
    
    try {
      if (departmentId) {
        const response = await getDepartmentDocumentsAPI(departmentId)
        departmentDocuments.value[departmentId] = response.documents || []
      } else {
        const response = await getDocumentsAPI()
        documents.value = response.documents || []
      }
    } catch (err) {
      error.value = err.message
      // 개발 중에는 더미 데이터 사용
      const dummyData = [
        {
          id: '1',
          name: 'OSS-Knowledge-Guide.pdf',
          size: 1024000,
          status: 'processed',
          uploadedAt: new Date().toISOString(),
          departmentId: departmentId || null
        },
        {
          id: '2',
          name: 'User-Manual.docx',
          size: 2048000,
          status: 'processing',
          uploadedAt: new Date(Date.now() - 3600000).toISOString(),
          departmentId: departmentId || null
        },
        {
          id: '3',
          name: 'API-Documentation.pdf',
          size: 1536000,
          status: 'processed',
          uploadedAt: new Date(Date.now() - 7200000).toISOString(),
          departmentId: departmentId || null
        },
        {
          id: '4',
          name: 'Troubleshooting-Guide.pdf',
          size: 3072000,
          status: 'processed',
          uploadedAt: new Date(Date.now() - 10800000).toISOString(),
          departmentId: departmentId || null
        }
      ]
      
      if (departmentId) {
        departmentDocuments.value[departmentId] = dummyData
      } else {
        documents.value = dummyData
      }
      
      // 백엔드 연결 실패 시에도 에러를 던지지 않고 계속 진행
      console.log('백엔드 연결 실패, 더미 데이터로 계속 진행:', err.message)
    } finally {
      isLoading.value = false
    }
  }

  // 모든 부서의 문서 가져오기
  const fetchAllDepartmentDocuments = async (departmentIds) => {
    isLoading.value = true
    error.value = null
    
    try {
      const promises = departmentIds.map(id => fetchDocuments(id))
      await Promise.all(promises)
    } catch (err) {
      error.value = err.message
      // 백엔드 연결 실패 시에도 더미 데이터로 계속 진행
      console.log('백엔드 연결 실패, 더미 데이터로 계속 진행:', err.message)
      
      // 각 부서별로 더미 데이터 생성
      departmentIds.forEach(deptId => {
        if (!departmentDocuments.value[deptId]) {
          const dummyData = [
            {
              id: `${deptId}-1`,
              name: `${deptId}-sample-doc.pdf`,
              size: 1024000,
              status: 'processed',
              uploadedAt: new Date().toISOString(),
              departmentId: deptId
            },
            {
              id: `${deptId}-2`,
              name: `${deptId}-manual.docx`,
              size: 2048000,
              status: 'processing',
              uploadedAt: new Date(Date.now() - 3600000).toISOString(),
              departmentId: deptId
            }
          ]
          departmentDocuments.value[deptId] = dummyData
        }
      })
    } finally {
      isLoading.value = false
    }
  }

  // 파일 업로드
  const uploadFiles = async (files, departmentId = null) => {
    isLoading.value = true
    error.value = null

    try {
      let response
      if (departmentId) {
        response = await uploadDepartmentDocumentsAPI(files, departmentId)
      } else {
        response = await uploadDocumentsAPI(files)
      }
      
      // 업로드된 파일들을 문서 목록에 추가
      const newDocuments = files.map((file, index) => ({
        id: Date.now() + index,
        name: file.name,
        size: file.size,
        status: 'processing',
        uploadedAt: new Date().toISOString(),
        departmentId: departmentId || null
      }))
      
      if (departmentId) {
        if (!departmentDocuments.value[departmentId]) {
          departmentDocuments.value[departmentId] = []
        }
        departmentDocuments.value[departmentId].unshift(...newDocuments)
      } else {
        documents.value.unshift(...newDocuments)
      }
      
      // 실제 API 응답이 있다면 사용
      if (response.documents) {
        if (departmentId) {
          departmentDocuments.value[departmentId] = [...response.documents, ...departmentDocuments.value[departmentId].filter(doc => 
            !response.documents.some(newDoc => newDoc.id === doc.id)
          )]
        } else {
          documents.value = [...response.documents, ...documents.value.filter(doc => 
            !response.documents.some(newDoc => newDoc.id === doc.id)
          )]
        }
      }

      return response
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // 문서 다운로드
  const downloadDocument = async (documentId, departmentId = null) => {
    try {
      let blob
      if (departmentId) {
        blob = await downloadDepartmentDocumentAPI(documentId, departmentId)
      } else {
        blob = await downloadDocumentAPI(documentId)
      }
      
      return blob
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  // 문서 삭제
  const deleteDocument = async (id, departmentId = null) => {
    isLoading.value = true
    error.value = null

    try {
      if (departmentId) {
        await deleteDepartmentDocumentAPI(id, departmentId)
        departmentDocuments.value[departmentId] = departmentDocuments.value[departmentId].filter(doc => doc.id !== id)
      } else {
        await deleteDocumentAPI(id)
        documents.value = documents.value.filter(doc => doc.id !== id)
      }
    } catch (err) {
      error.value = err.message
      // 개발 중에는 로컬에서만 제거
      if (departmentId) {
        departmentDocuments.value[departmentId] = departmentDocuments.value[departmentId].filter(doc => doc.id !== id)
      } else {
        documents.value = documents.value.filter(doc => doc.id !== id)
      }
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // 문서 상태 업데이트
  const updateDocumentStatus = (id, status, departmentId = null) => {
    if (departmentId) {
      const doc = departmentDocuments.value[departmentId]?.find(d => d.id === id)
      if (doc) {
        doc.status = status
      }
    } else {
      const doc = documents.value.find(d => d.id === id)
      if (doc) {
        doc.status = status
      }
    }
  }

  // 부서별 문서 가져오기
  const getDepartmentDocuments = (departmentId) => {
    try {
      return departmentDocuments.value[departmentId] || []
    } catch (error) {
      console.log(`부서 ${departmentId} 문서 조회 중 오류, 빈 배열 반환:`, error.message)
      return []
    }
  }

  // 모든 문서 가져오기 (일반 + 부서별)
  const getAllDocuments = () => {
    try {
      const allDocs = [...(documents.value || [])]
      Object.values(departmentDocuments.value || {}).forEach(deptDocs => {
        if (deptDocs && Array.isArray(deptDocs)) {
          allDocs.push(...deptDocs)
        }
      })
      return allDocs
    } catch (error) {
      console.log('모든 문서 조회 중 오류, 빈 배열 반환:', error.message)
      return []
    }
  }

  // Azure File Share 연결 상태 확인
  const checkAzureConnection = async () => {
    try {
      const response = await checkAzureFileShareConnectionAPI()
      azureConnectionStatus.value = response
      return response
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  // Azure File Share 동기화
  const syncAzureFileShare = async () => {
    isSyncing.value = true
    error.value = null
    
    try {
      const response = await syncAzureFileShareAPI()
      // 동기화 후 문서 목록 새로고침
      await fetchDocuments()
      const departmentIds = Object.keys(departmentDocuments.value)
      if (departmentIds.length > 0) {
        await fetchAllDepartmentDocuments(departmentIds)
      }
      return response
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      isSyncing.value = false
    }
  }

  // 에러 초기화
  const clearError = () => {
    error.value = null
  }

  return {
    documents,
    departmentDocuments,
    isLoading,
    isSyncing,
    error,
    azureConnectionStatus,
    fetchDocuments,
    fetchAllDepartmentDocuments,
    uploadFiles,
    downloadDocument,
    deleteDocument,
    updateDocumentStatus,
    getDepartmentDocuments,
    getAllDocuments,
    checkAzureConnection,
    syncAzureFileShare,
    clearError
  }
})