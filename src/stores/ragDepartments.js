import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useRAGDepartmentsStore = defineStore('ragDepartments', () => {
  // RAG 부서 목록
  const departments = ref([
    {
      id: 'tech-support',
      name: 'LEAN',
      description: '기술 관련 문의 및 문제 해결',
      icon: '🔧',
      color: 'blue',
      status: 'active',
      keywords: ['기술', '지원', '문제', '해결', '설정', '오류', '버그'],
      createdAt: '2024-01-15T09:00:00Z',
      lastUpdated: '2024-12-01T14:30:00Z',
      monthlyQueries: 245
    },
    {
      id: 'customer-service',
      name: 'WM',
      description: '고객 문의 및 서비스 관련',
      icon: '👥',
      color: 'green',
      status: 'active',
      keywords: ['고객', '서비스', '문의', '상담', '불만', '건의'],
      createdAt: '2024-01-15T09:00:00Z',
      lastUpdated: '2024-11-28T16:45:00Z',
      monthlyQueries: 189
    },
    {
      id: 'billing',
      name: 'PNA',
      description: '결제 및 요금 관련 문의',
      icon: '💳',
      color: 'purple',
      status: 'active',
      keywords: ['결제', '요금', '청구', '인보이스', '환불', '할인'],
      createdAt: '2024-01-15T09:00:00Z',
      lastUpdated: '2024-11-30T11:20:00Z',
      monthlyQueries: 156
    },
    {
      id: 'sales',
      name: '영업팀',
      description: '제품 구매 및 계약 관련',
      icon: '📈',
      color: 'orange',
      status: 'active',
      keywords: ['구매', '계약', '영업', '견적', '데모', '시연'],
      createdAt: '2024-02-01T10:00:00Z',
      lastUpdated: '2024-12-02T09:15:00Z',
      monthlyQueries: 98
    },
    {
      id: 'development',
      name: '개발팀',
      description: '개발 및 API 관련 문의',
      icon: '💻',
      color: 'indigo',
      status: 'active',
      keywords: ['개발', 'API', '코드', '프로그래밍', 'SDK', '라이브러리'],
      createdAt: '2024-02-15T14:00:00Z',
      lastUpdated: '2024-12-01T18:30:00Z',
      monthlyQueries: 312
    },
    {
      id: 'security',
      name: '보안팀',
      description: '보안 및 인증 관련 문의',
      icon: '🔒',
      color: 'red',
      status: 'inactive',
      keywords: ['보안', '인증', '암호화', '권한', '접근', '해킹'],
      createdAt: '2024-03-01T11:00:00Z',
      lastUpdated: '2024-11-15T13:45:00Z',
      monthlyQueries: 67
    },
    {
      id: 'operations',
      name: '운영팀',
      description: '시스템 운영 및 모니터링',
      icon: '⚙️',
      color: 'gray',
      status: 'active',
      keywords: ['운영', '모니터링', '성능', '가용성', '백업', '복구'],
      createdAt: '2024-03-15T16:00:00Z',
      lastUpdated: '2024-12-02T12:00:00Z',
      monthlyQueries: 134
    }
  ])

  // 검색어에 따른 필터링된 부서 목록
  const filteredDepartments = computed(() => (searchQuery) => {
    if (!searchQuery) return departments.value
    
    const query = searchQuery.toLowerCase()
    return departments.value.filter(dept => 
      dept.name.toLowerCase().includes(query) ||
      dept.description.toLowerCase().includes(query) ||
      dept.keywords.some(keyword => keyword.toLowerCase().includes(query))
    )
  })

  // 부서 ID로 부서 찾기
  const getDepartmentById = (id) => {
    return departments.value.find(dept => dept.id === id)
  }

  // 부서 이름으로 부서 찾기
  const getDepartmentByName = (name) => {
    return departments.value.find(dept => dept.name === name)
  }

  // 새 부서 생성
  const createDepartment = async (departmentData) => {
    try {
      const newDepartment = {
        id: generateId(departmentData.name),
        ...departmentData,
        color: getColorForIcon(departmentData.icon),
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        monthlyQueries: 0
      }
      
      departments.value.push(newDepartment)
      
      // 실제 API 호출 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 500))
      
      return newDepartment
    } catch (error) {
      throw new Error('부서 생성에 실패했습니다: ' + error.message)
    }
  }

  // 부서 정보 수정
  const updateDepartment = async (id, departmentData) => {
    try {
      const index = departments.value.findIndex(dept => dept.id === id)
      if (index === -1) {
        throw new Error('부서를 찾을 수 없습니다')
      }
      
      departments.value[index] = {
        ...departments.value[index],
        ...departmentData,
        color: getColorForIcon(departmentData.icon),
        lastUpdated: new Date().toISOString()
      }
      
      // 실제 API 호출 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 500))
      
      return departments.value[index]
    } catch (error) {
      throw new Error('부서 수정에 실패했습니다: ' + error.message)
    }
  }

  // 부서 삭제
  const deleteDepartment = async (id) => {
    try {
      const index = departments.value.findIndex(dept => dept.id === id)
      if (index === -1) {
        throw new Error('부서를 찾을 수 없습니다')
      }
      
      departments.value.splice(index, 1)
      
      // 실제 API 호출 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 500))
      
    } catch (error) {
      throw new Error('부서 삭제에 실패했습니다: ' + error.message)
    }
  }

  // 부서 상태 변경
  const updateDepartmentStatus = async (id, status) => {
    try {
      const department = getDepartmentById(id)
      if (!department) {
        throw new Error('부서를 찾을 수 없습니다')
      }
      
      department.status = status
      department.lastUpdated = new Date().toISOString()
      
      // 실제 API 호출 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 500))
      
      return department
    } catch (error) {
      throw new Error('부서 상태 변경에 실패했습니다: ' + error.message)
    }
  }

  // ID 생성 헬퍼
  const generateId = (name) => {
    const timestamp = Date.now()
    const randomStr = Math.random().toString(36).substring(2, 8)
    const nameSlug = name.toLowerCase()
      .replace(/[^a-z0-9가-힣]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
    
    return `${nameSlug}-${randomStr}-${timestamp}`
  }

  // 아이콘에 따른 색상 매핑
  const getColorForIcon = (icon) => {
    const colorMap = {
      '🏢': 'gray',
      '🔧': 'blue',
      '👥': 'green',
      '💳': 'purple',
      '📈': 'orange',
      '💻': 'indigo',
      '🔒': 'red',
      '⚙️': 'gray',
      '📊': 'blue',
      '🎯': 'green',
      '🚀': 'purple',
      '💡': 'yellow',
      '📋': 'gray',
      '🔍': 'blue',
      '📞': 'green',
      '💬': 'blue'
    }
    return colorMap[icon] || 'gray'
  }

  return {
    departments,
    filteredDepartments,
    getDepartmentById,
    getDepartmentByName,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    updateDepartmentStatus
  }
}) 