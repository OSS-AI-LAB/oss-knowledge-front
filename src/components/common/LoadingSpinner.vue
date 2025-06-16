<template>
  <div class="loading-spinner" :class="sizeClass">
    <div class="spinner">
      <div class="spinner-ring"></div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  size: {
    type: String,
    default: 'medium',
    validator: (value) => ['small', 'medium', 'large'].includes(value)
  }
})

const sizeClass = computed(() => `spinner-${props.size}`)
</script>

<style scoped>
.loading-spinner {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.spinner {
  position: relative;
}

.spinner-ring {
  border-radius: 50%;
  border: 2px solid var(--color-border);
  border-top-color: var(--color-primary);
  animation: spin 0.8s linear infinite;
}

/* Size variants */
.spinner-small .spinner-ring {
  width: 16px;
  height: 16px;
}

.spinner-medium .spinner-ring {
  width: 24px;
  height: 24px;
}

.spinner-large .spinner-ring {
  width: 32px;
  height: 32px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>