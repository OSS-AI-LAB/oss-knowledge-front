<template>
  <transition name="alert">
    <div v-if="visible" class="error-alert" :class="typeClass">
      <div class="alert-content">
        <div class="alert-icon">
          <svg v-if="type === 'error'" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>

          <svg v-else-if="type === 'warning'" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>

          <svg v-else-if="type === 'success'" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>

          <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <div class="alert-body">
          <h4 v-if="title" class="alert-title">{{ title }}</h4>
          <p class="alert-message">{{ message }}</p>

          <div v-if="actions.length > 0" class="alert-actions">
            <button
              v-for="(action, index) in actions"
              :key="index"
              @click="handleAction(action)"
              class="alert-button"
              :class="action.variant || 'default'"
            >
              {{ action.label }}
            </button>
          </div>
        </div>

        <button
          v-if="dismissible"
          @click="dismiss"
          class="dismiss-button"
          :aria-label="dismissLabel"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'

const props = defineProps({
  type: {
    type: String,
    default: 'error',
    validator: (value) => ['error', 'warning', 'success', 'info'].includes(value)
  },
  title: {
    type: String,
    default: ''
  },
  message: {
    type: String,
    required: true
  },
  dismissible: {
    type: Boolean,
    default: true
  },
  dismissLabel: {
    type: String,
    default: 'Dismiss alert'
  },
  timeout: {
    type: Number,
    default: 0 // 0 means no auto-dismiss
  },
  actions: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['dismiss', 'action'])

// State
const visible = ref(true)
let timeoutId = null

// Computed
const typeClass = computed(() => `alert-${props.type}`)

// Methods
function dismiss() {
  visible.value = false
  emit('dismiss')
}

function handleAction(action) {
  if (action.handler && typeof action.handler === 'function') {
    action.handler()
  }
  emit('action', action)

  if (action.dismiss !== false) {
    dismiss()
  }
}

// Auto-dismiss
watch(() => props.timeout, (newTimeout) => {
  if (timeoutId) {
    clearTimeout(timeoutId)
  }

  if (newTimeout > 0) {
    timeoutId = setTimeout(() => {
      dismiss()
    }, newTimeout)
  }
}, { immediate: true })

// Cleanup
onMounted(() => {
  return () => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
  }
})
</script>

<style scoped>
.error-alert {
  position: relative;
  margin-bottom: var(--spacing-md);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.alert-content {
  display: flex;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  align-items: flex-start;
}

.alert-icon {
  flex-shrink: 0;
  width: 24px;
  height: 24px;

  svg {
    width: 100%;
    height: 100%;
  }
}

.alert-body {
  flex: 1;
  min-width: 0;
}

.alert-title {
  font-size: var(--font-size-base);
  font-weight: 600;
  margin: 0 0 var(--spacing-xs) 0;
}

.alert-message {
  font-size: var(--font-size-sm);
  margin: 0;
  word-wrap: break-word;
}

.alert-actions {
  display: flex;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-sm);
  flex-wrap: wrap;
}

.alert-button {
  padding: var(--spacing-xs) var(--spacing-md);
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);

  &.default {
    background: rgba(0, 0, 0, 0.1);
    color: inherit;

    &:hover {
      background: rgba(0, 0, 0, 0.2);
    }
  }

  &.primary {
    background: currentColor;
    color: white;

    &:hover {
      opacity: 0.9;
    }
  }
}

.dismiss-button {
  position: absolute;
  top: var(--spacing-sm);
  right: var(--spacing-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: transparent;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
  opacity: 0.6;

  &:hover {
    opacity: 1;
    background: rgba(0, 0, 0, 0.1);
  }

  svg {
    width: 16px;
    height: 16px;
  }
}

/* Type variants */
.alert-error {
  background: #fee2e2;
  border: 1px solid #fecaca;
  color: #dc2626;
}

.alert-warning {
  background: #fef3c7;
  border: 1px solid #fde68a;
  color: #d97706;
}

.alert-success {
  background: #d1fae5;
  border: 1px solid #a7f3d0;
  color: #059669;
}

.alert-info {
  background: #dbeafe;
  border: 1px solid #bfdbfe;
  color: #2563eb;
}

/* Dark mode variants */
.dark {
  .alert-error {
    background: rgba(220, 38, 38, 0.1);
    border-color: rgba(220, 38, 38, 0.3);
    color: #fca5a5;
  }

  .alert-warning {
    background: rgba(217, 119, 6, 0.1);
    border-color: rgba(217, 119, 6, 0.3);
    color: #fcd34d;
  }

  .alert-success {
    background: rgba(5, 150, 105, 0.1);
    border-color: rgba(5, 150, 105, 0.3);
    color: #6ee7b7;
  }

  .alert-info {
    background: rgba(37, 99, 235, 0.1);
    border-color: rgba(37, 99, 235, 0.3);
    color: #93bbfe;
  }
}

/* Animation */
.alert-enter-active,
.alert-leave-active {
  transition: all var(--transition-base);
}

.alert-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.alert-leave-to {
  opacity: 0;
  transform: translateX(10px);
}

/* Mobile adjustments */
@media (max-width: 768px) {
  .alert-content {
    padding: var(--spacing-sm);
  }

  .alert-icon {
    width: 20px;
    height: 20px;
  }

  .dismiss-button {
    position: static;
    margin-left: var(--spacing-sm);
  }
}
</style>