<template>
  <div
    v-if="show"
    class="absolute bottom-full left-0 mb-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50 max-h-64 overflow-hidden"
    style="border-color: var(--color-border-light)"
  >
    <!-- 검색 입력창 -->
    <div class="p-3 border-b" style="border-color: var(--color-border-light)">
      <div class="relative">
        <input
          ref="searchInput"
          :value="searchQuery"
          type="text"
          placeholder="부서 검색..."
          class="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          style="border-color: var(--color-border-light)"
          @keydown="handleKeydown"
          @input="handleSearchInput"
        />
        <svg
          class="absolute right-3 top-2.5 w-4 h-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
    </div>

    <!-- 부서 목록 -->
    <div class="max-h-48 overflow-y-auto">
      <div
        v-for="(department, index) in filteredDepartments"
        :key="department.id"
        @click="selectDepartment(department)"
        @mouseenter="hoveredIndex = index"
        :class="[
          'flex items-center gap-3 p-3 cursor-pointer transition-colors duration-150',
          hoveredIndex === index ? 'bg-blue-50' : 'hover:bg-gray-50',
          selectedIndex === index ? 'bg-blue-100' : ''
        ]"
      >
        <!-- 부서 아이콘 -->
        <div class="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-lg">
          {{ department.icon }}
        </div>

        <!-- 부서 정보 -->
        <div class="flex-1 min-w-0">
          <div class="font-medium text-sm text-gray-900 truncate">
            {{ department.name }}
          </div>
          <div class="text-xs text-gray-500 truncate">
            {{ department.description }}
          </div>
        </div>

        <!-- 선택 표시 -->
        <div
          v-if="selectedIndex === index"
          class="flex-shrink-0 w-5 h-5 text-blue-500"
        >
          <svg fill="currentColor" viewBox="0 0 20 20">
            <path
              fill-rule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clip-rule="evenodd"
            />
          </svg>
        </div>
      </div>

      <!-- 결과가 없을 때 -->
      <div
        v-if="filteredDepartments.length === 0"
        class="p-4 text-center text-sm text-gray-500"
      >
        검색 결과가 없습니다.
      </div>
    </div>

    <!-- 하단 정보 -->
    <div class="p-2 border-t text-xs text-gray-400 text-center" style="border-color: var(--color-border-light)">
      ↑↓ 키로 이동, Enter로 선택
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import { useRAGDepartmentsStore } from '@/stores/ragDepartments'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  searchQuery: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['select', 'close', 'update:searchQuery'])

const ragDepartmentsStore = useRAGDepartmentsStore()
const searchInput = ref(null)
const selectedIndex = ref(0)
const hoveredIndex = ref(-1)

// 필터링된 부서 목록
const filteredDepartments = computed(() => {
  return ragDepartmentsStore.filteredDepartments(props.searchQuery)
})

// 키보드 이벤트 처리
const handleKeydown = (event) => {
  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      selectedIndex.value = Math.min(selectedIndex.value + 1, filteredDepartments.value.length - 1)
      break
    case 'ArrowUp':
      event.preventDefault()
      selectedIndex.value = Math.max(selectedIndex.value - 1, 0)
      break
    case 'Enter':
      event.preventDefault()
      if (filteredDepartments.value[selectedIndex.value]) {
        selectDepartment(filteredDepartments.value[selectedIndex.value])
      }
      break
    case 'Escape':
      event.preventDefault()
      emit('close')
      break
  }
}

// 부서 선택
const selectDepartment = (department) => {
  emit('select', department)
}

// 검색 입력 처리
const handleSearchInput = (event) => {
  emit('update:searchQuery', event.target.value)
}

// 검색어 변경 시 선택 인덱스 리셋
watch(() => props.searchQuery, () => {
  selectedIndex.value = 0
  hoveredIndex.value = -1
})

// 드롭다운이 표시될 때 검색 입력창에 포커스
watch(() => props.show, async (newValue) => {
  if (newValue) {
    await nextTick()
    searchInput.value?.focus()
  }
})

onMounted(() => {
  if (props.show) {
    searchInput.value?.focus()
  }
})
</script> 