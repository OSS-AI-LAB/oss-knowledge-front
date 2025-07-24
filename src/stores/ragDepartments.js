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
      keywords: ['기술', '지원', '문제', '해결', '설정', '오류', '버그']
    },
    {
      id: 'customer-service',
      name: 'WM',
      description: '고객 문의 및 서비스 관련',
      icon: '👥',
      color: 'green',
      keywords: ['고객', '서비스', '문의', '상담', '불만', '건의']
    },
    {
      id: 'billing',
      name: 'PNA',
      description: '결제 및 요금 관련 문의',
      icon: '💳',
      color: 'purple',
      keywords: ['결제', '요금', '청구', '인보이스', '환불', '할인']
    },
    {
      id: 'sales',
      name: '영업팀',
      description: '제품 구매 및 계약 관련',
      icon: '📈',
      color: 'orange',
      keywords: ['구매', '계약', '영업', '견적', '데모', '시연']
    },
    {
      id: 'development',
      name: '개발팀',
      description: '개발 및 API 관련 문의',
      icon: '💻',
      color: 'indigo',
      keywords: ['개발', 'API', '코드', '프로그래밍', 'SDK', '라이브러리']
    },
    {
      id: 'security',
      name: '보안팀',
      description: '보안 및 인증 관련 문의',
      icon: '🔒',
      color: 'red',
      keywords: ['보안', '인증', '암호화', '권한', '접근', '해킹']
    },
    {
      id: 'operations',
      name: '운영팀',
      description: '시스템 운영 및 모니터링',
      icon: '⚙️',
      color: 'gray',
      keywords: ['운영', '모니터링', '성능', '가용성', '백업', '복구']
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

  return {
    departments,
    filteredDepartments,
    getDepartmentById,
    getDepartmentByName
  }
}) 