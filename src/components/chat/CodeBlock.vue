<template>
  <div class="code-block-wrapper">
    <div class="code-header">
      <span class="language-label">{{ displayLanguage }}</span>
      <button
        @click="copyCode"
        class="copy-button"
        :class="{ copied: isCopied }"
        :title="copyButtonTitle"
      >
        <svg v-if="!isCopied" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
        <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        <span>{{ copyButtonText }}</span>
      </button>
    </div>

    <div class="code-container" ref="codeContainer">
      <pre><code :class="`language-${language}`" v-html="highlightedCode"></code></pre>

      <div v-if="showLineNumbers" class="line-numbers">
        <span v-for="n in lineCount" :key="n">{{ n }}</span>
      </div>
    </div>

    <div v-if="filename" class="code-footer">
      <span class="filename">{{ filename }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import hljs from 'highlight.js'

const props = defineProps({
  code: {
    type: String,
    required: true
  },
  language: {
    type: String,
    default: 'plaintext'
  },
  filename: {
    type: String,
    default: ''
  },
  showLineNumbers: {
    type: Boolean,
    default: false
  },
  maxHeight: {
    type: String,
    default: '500px'
  }
})

// State
const isCopied = ref(false)
const codeContainer = ref(null)

// Computed
const displayLanguage = computed(() => {
  const languageMap = {
    js: 'JavaScript',
    javascript: 'JavaScript',
    ts: 'TypeScript',
    typescript: 'TypeScript',
    py: 'Python',
    python: 'Python',
    java: 'Java',
    cpp: 'C++',
    c: 'C',
    cs: 'C#',
    csharp: 'C#',
    html: 'HTML',
    css: 'CSS',
    scss: 'SCSS',
    sass: 'Sass',
    json: 'JSON',
    xml: 'XML',
    yaml: 'YAML',
    yml: 'YAML',
    md: 'Markdown',
    markdown: 'Markdown',
    sql: 'SQL',
    bash: 'Bash',
    shell: 'Shell',
    sh: 'Shell',
    vue: 'Vue',
    react: 'React',
    jsx: 'JSX',
    tsx: 'TSX',
    go: 'Go',
    rust: 'Rust',
    php: 'PHP',
    ruby: 'Ruby',
    rb: 'Ruby',
    swift: 'Swift',
    kotlin: 'Kotlin',
    dart: 'Dart',
    r: 'R',
    plaintext: 'Plain Text'
  }

  return languageMap[props.language.toLowerCase()] || props.language.toUpperCase()
})

const highlightedCode = computed(() => {
  try {
    if (props.language && hljs.getLanguage(props.language)) {
      return hljs.highlight(props.code, { language: props.language }).value
    }
    return hljs.highlightAuto(props.code).value
  } catch (error) {
    console.error('Highlight error:', error)
    return props.code
  }
})

const lineCount = computed(() => {
  return props.code.split('\n').length
})

const copyButtonText = computed(() => {
  return isCopied.value ? 'Copied!' : 'Copy'
})

const copyButtonTitle = computed(() => {
  return isCopied.value ? 'Code copied to clipboard' : 'Copy code to clipboard'
})

// Methods
async function copyCode() {
  try {
    await navigator.clipboard.writeText(props.code)
    isCopied.value = true

    // Reset after 2 seconds
    setTimeout(() => {
      isCopied.value = false
    }, 2000)
  } catch (error) {
    console.error('Failed to copy code:', error)
    // Fallback for older browsers
    const textArea = document.createElement('textarea')
    textArea.value = props.code
    textArea.style.position = 'fixed'
    textArea.style.opacity = '0'
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()

    try {
      document.execCommand('copy')
      isCopied.value = true
      setTimeout(() => {
        isCopied.value = false
      }, 2000)
    } catch (err) {
      console.error('Fallback copy failed:', err)
    }

    document.body.removeChild(textArea)
  }
}

// Add syntax highlighting classes on mount
onMounted(() => {
  if (codeContainer.value) {
    const codeElement = codeContainer.value.querySelector('code')
    if (codeElement && !codeElement.classList.contains('hljs')) {
      codeElement.classList.add('hljs')
    }
  }
})
</script>

<style scoped>
.code-block-wrapper {
  margin: var(--spacing-md) 0;
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: var(--color-sidebar);
  border: 1px solid var(--color-border);
}

.code-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--color-background);
  border-bottom: 1px solid var(--color-border);
}

.language-label {
  font-size: var(--font-size-xs);
  font-weight: 600;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.copy-button {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-sm);
  background: transparent;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);

  &:hover {
    background: var(--color-surface);
    color: var(--color-text-primary);
    border-color: var(--color-primary);
  }

  &.copied {
    background: var(--color-primary);
    color: white;
    border-color: var(--color-primary);
  }

  svg {
    width: 14px;
    height: 14px;
  }
}

.code-container {
  position: relative;
  overflow: auto;
  max-height: v-bind(maxHeight);
}

pre {
  margin: 0;
  padding: var(--spacing-md);
  overflow-x: auto;

  code {
    display: block;
    font-family: var(--font-family-mono);
    font-size: var(--font-size-sm);
    line-height: 1.6;
    color: var(--color-text-primary);
    white-space: pre;

    &.hljs {
      background: transparent;
      padding: 0;
    }
  }
}

.line-numbers {
  position: absolute;
  top: 0;
  left: 0;
  padding: var(--spacing-md);
  background: var(--color-background);
  border-right: 1px solid var(--color-border);
  user-select: none;

  span {
    display: block;
    font-family: var(--font-family-mono);
    font-size: var(--font-size-sm);
    line-height: 1.6;
    color: var(--color-text-tertiary);
    text-align: right;
    min-width: 2ch;
  }
}

.code-container:has(.line-numbers) pre {
  padding-left: calc(3ch + var(--spacing-md) * 2);
}

.code-footer {
  padding: var(--spacing-xs) var(--spacing-md);
  background: var(--color-background);
  border-top: 1px solid var(--color-border);
}

.filename {
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
  font-family: var(--font-family-mono);
}

/* Scrollbar styling for code blocks */
.code-container::-webkit-scrollbar {
  height: 8px;
  width: 8px;
}

.code-container::-webkit-scrollbar-track {
  background: var(--color-background);
}

.code-container::-webkit-scrollbar-thumb {
  background: var(--color-border);
  border-radius: var(--radius-sm);
}

.code-container::-webkit-scrollbar-thumb:hover {
  background: var(--color-text-tertiary);
}

/* Dark mode adjustments */
.dark {
  .code-block-wrapper {
    background: var(--color-dark-surface);
  }

  .code-header,
  .code-footer {
    background: var(--color-dark-sidebar);
  }

  .line-numbers {
    background: var(--color-dark-sidebar);
  }

  pre code {
    color: var(--color-dark-text-primary);
  }
}

/* Mobile adjustments */
@media (max-width: 768px) {
  .code-header {
    padding: var(--spacing-xs) var(--spacing-sm);
  }

  pre {
    padding: var(--spacing-sm);
    font-size: var(--font-size-xs);
  }

  .code-container {
    max-height: 300px;
  }
}
</style>