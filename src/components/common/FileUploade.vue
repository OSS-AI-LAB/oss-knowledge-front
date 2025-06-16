<template>
  <div
    class="file-upload"
    :class="{ 'is-dragging': isDragging }"
    @drop="handleDrop"
    @dragover.prevent="handleDragOver"
    @dragleave="handleDragLeave"
  >
    <input
      ref="fileInput"
      type="file"
      :multiple="multiple"
      :accept="accept"
      @change="handleFileSelect"
      class="file-input"
    />

    <div class="upload-area" @click="triggerFileInput">
      <svg class="upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
      </svg>

      <p class="upload-text">
        <span class="primary-text">Click to upload</span> or drag and drop
      </p>

      <p class="upload-hint">
        {{ acceptText }}
      </p>
    </div>

    <!-- File list -->
    <div v-if="files.length > 0" class="file-list">
      <div
        v-for="(file, index) in files"
        :key="index"
        class="file-item"
      >
        <div class="file-info">
          <div v-if="isImage(file)" class="file-preview">
            <img :src="file.preview" :alt="file.name" />
          </div>
          <div v-else class="file-icon">
            {{ getFileIcon(file) }}
          </div>

          <div class="file-details">
            <p class="file-name">{{ file.name }}</p>
            <p class="file-size">{{ formatFileSize(file.size) }}</p>
          </div>
        </div>

        <button @click="removeFile(index)" class="remove-button">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import {
  validateFile,
  formatFileSize,
  getFileIcon,
  getFileCategory,
  FILE_CATEGORIES,
  readFileAsDataURL
} from '@/utils/fileHandler'

const props = defineProps({
  multiple: {
    type: Boolean,
    default: true
  },
  accept: {
    type: String,
    default: 'image/*,.pdf,.txt,.doc,.docx'
  },
  maxSize: {
    type: Number,
    default: 10 * 1024 * 1024 // 10MB
  },
  maxFiles: {
    type: Number,
    default: 5
  }
})

const emit = defineEmits(['update:files', 'error'])

// State
const files = ref([])
const isDragging = ref(false)
const fileInput = ref(null)

// Computed
const acceptText = computed(() => {
  const extensions = props.accept.split(',').map(ext => ext.trim())
  const types = extensions.map(ext => {
    if (ext.startsWith('.')) return ext.toUpperCase().slice(1)
    if (ext === 'image/*') return 'Images'
    if (ext === 'application/pdf') return 'PDF'
    return ext
  })

  return `${types.join(', ')} (Max ${formatFileSize(props.maxSize)})`
})

// Methods
function triggerFileInput() {
  fileInput.value?.click()
}

async function handleFileSelect(event) {
  const selectedFiles = Array.from(event.target.files)
  await processFiles(selectedFiles)
  event.target.value = '' // Reset input
}

async function handleDrop(event) {
  event.preventDefault()
  isDragging.value = false

  const droppedFiles = Array.from(event.dataTransfer.files)
  await processFiles(droppedFiles)
}

function handleDragOver(event) {
  event.preventDefault()
  isDragging.value = true
}

function handleDragLeave(event) {
  if (event.target === event.currentTarget) {
    isDragging.value = false
  }
}

async function processFiles(newFiles) {
  // Check max files limit
  if (files.value.length + newFiles.length > props.maxFiles) {
    emit('error', `Maximum ${props.maxFiles} files allowed`)
    return
  }

  for (const file of newFiles) {
    // Validate file
    const validation = validateFile(file)
    if (!validation.valid) {
      emit('error', validation.errors.join(', '))
      continue
    }

    // Check size
    if (file.size > props.maxSize) {
      emit('error', `File "${file.name}" exceeds maximum size of ${formatFileSize(props.maxSize)}`)
      continue
    }

    // Create file object with preview
    const fileObj = {
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      preview: null
    }

    // Generate preview for images
    if (isImage(file)) {
      try {
        fileObj.preview = await readFileAsDataURL(file)
      } catch (error) {
        console.error('Error generating preview:', error)
      }
    }

    files.value.push(fileObj)
  }

  // Emit updated files
  emit('update:files', files.value)
}

function removeFile(index) {
  files.value.splice(index, 1)
  emit('update:files', files.value)
}

function isImage(file) {
  return getFileCategory(file.file || file) === FILE_CATEGORIES.IMAGE
}

// Expose methods for parent component
defineExpose({
  clearFiles: () => {
    files.value = []
    emit('update:files', [])
  }
})
</script>

<style scoped>
.file-upload {
  width: 100%;
}

.file-input {
  display: none;
}

.upload-area {
  border: 2px dashed var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-2xl);
  text-align: center;
  cursor: pointer;
  transition: all var(--transition-fast);
  background-color: var(--color-surface);

  &:hover {
    border-color: var(--color-primary);
    background-color: var(--color-sidebar);
  }
}

.is-dragging .upload-area {
  border-color: var(--color-primary);
  background-color: var(--color-sidebar);
}

.upload-icon {
  width: 48px;
  height: 48px;
  margin: 0 auto var(--spacing-md);
  color: var(--color-text-secondary);
}

.upload-text {
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-xs);

  .primary-text {
    color: var(--color-primary);
    font-weight: 500;
  }
}

.upload-hint {
  font-size: var(--font-size-sm);
  color: var(--color-text-tertiary);
  margin: 0;
}

.file-list {
  margin-top: var(--spacing-md);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.file-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-sm);
  background-color: var(--color-sidebar);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}

.file-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  min-width: 0;
}

.file-preview {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-sm);
  overflow: hidden;
  flex-shrink: 0;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.file-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  flex-shrink: 0;
}

.file-details {
  min-width: 0;
}

.file-name {
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--color-text-primary);
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-size {
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
  margin: 0;
}

.remove-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: transparent;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
  flex-shrink: 0;

  &:hover {
    background-color: #fee2e2;
    border-color: #ef4444;
    color: #ef4444;
  }

  svg {
    width: 16px;
    height: 16px;
  }
}
</style>