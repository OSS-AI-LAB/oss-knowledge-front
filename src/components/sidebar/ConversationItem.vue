<template>
  <div
    class="conversation-item"
    :class="{ 'is-active': isActive }"
    @click="handleSelect"
  >
    <div class="conversation-content">
      <div v-if="!isEditing" class="conversation-info">
        <h4 class="conversation-title">{{ conversation.title }}</h4>
        <p v-if="conversation.preview" class="conversation-preview">
          {{ conversation.preview }}
        </p>
      </div>

      <input
        v-else
        v-model="editTitle"
        @keydown.enter="saveRename"
        @keydown.escape="cancelRename"
        @click.stop
        ref="editInput"
        class="edit-input"
        type="text"
      />
    </div>

    <div class="conversation-actions" @click.stop>
      <button
        v-if="!isEditing"
        @click="startRename"
        class="action-button"
        title="Rename"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      </button>

      <button
        v-if="!isEditing"
        @click="handleDelete"
        class="action-button delete"
        title="Delete"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>

      <button
        v-if="isEditing"
        @click="saveRename"
        class="action-button save"
        title="Save"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
      </button>

      <button
        v-if="isEditing"
        @click="cancelRename"
        class="action-button cancel"
        title="Cancel"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'

const props = defineProps({
  conversation: {
    type: Object,
    required: true
  },
  isActive: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['select', 'delete', 'rename'])

// State
const isEditing = ref(false)
const editTitle = ref('')
const editInput = ref(null)

// Methods
function handleSelect() {
  if (!isEditing.value) {
    emit('select', props.conversation.id)
  }
}

function handleDelete() {
  if (confirm('Delete this conversation?')) {
    emit('delete', props.conversation.id)
  }
}

function startRename() {
  isEditing.value = true
  editTitle.value = props.conversation.title
  nextTick(() => {
    editInput.value?.focus()
    editInput.value?.select()
  })
}

function saveRename() {
  const newTitle = editTitle.value.trim()
  if (newTitle && newTitle !== props.conversation.title) {
    emit('rename', props.conversation.id, newTitle)
  }
  isEditing.value = false
}

function cancelRename() {
  isEditing.value = false
  editTitle.value = ''
}
</script>

<style scoped>
.conversation-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-sm);
  margin-bottom: var(--spacing-xs);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
  position: relative;

  &:hover {
    background-color: var(--color-background);

    .conversation-actions {
      opacity: 1;
    }
  }

  &.is-active {
    background-color: var(--color-background);

    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 3px;
      height: 70%;
      background-color: var(--color-primary);
      border-radius: var(--radius-sm);
    }
  }
}

.conversation-content {
  flex: 1;
  min-width: 0;
  padding-left: var(--spacing-xs);
}

.conversation-info {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.conversation-title {
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--color-text-primary);
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.conversation-preview {
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.edit-input {
  width: 100%;
  padding: var(--spacing-xs);
  background-color: var(--color-surface);
  border: 1px solid var(--color-primary);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  font-family: inherit;

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(217, 119, 87, 0.2);
  }
}

.conversation-actions {
  display: flex;
  gap: var(--spacing-xs);
  opacity: 0;
  transition: opacity var(--transition-fast);
}

.is-active .conversation-actions,
.conversation-item:hover .conversation-actions {
  opacity: 1;
}

.action-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: transparent;
  border: none;
  border-radius: var(--radius-sm);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);

  &:hover {
    background-color: var(--color-sidebar);
    color: var(--color-text-primary);
  }

  &.delete:hover {
    color: #ef4444;
  }

  &.save:hover {
    color: #10b981;
  }

  &.cancel:hover {
    color: #f59e0b;
  }

  svg {
    width: 16px;
    height: 16px;
  }
}

/* Mobile adjustments */
@media (max-width: 768px) {
  .conversation-actions {
    opacity: 1;
  }
}
</style>