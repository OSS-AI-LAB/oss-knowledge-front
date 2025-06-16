import { marked } from 'marked'
import hljs from 'highlight.js'
import DOMPurify from 'isomorphic-dompurify'

// Configure marked options
const markedOptions = {
  gfm: true,
  breaks: true,
  headerIds: false,
  mangle: false,
  sanitize: false,
  highlight: function(code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(code, { language: lang }).value
      } catch (err) {
        console.error('Highlight error:', err)
      }
    }
    return hljs.highlightAuto(code).value
  }
}

// Configure DOMPurify
const purifyConfig = {
  ALLOWED_TAGS: [
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'p', 'br', 'hr',
    'strong', 'em', 'u', 's', 'code', 'pre',
    'blockquote', 'q', 'cite',
    'ul', 'ol', 'li',
    'a', 'img',
    'table', 'thead', 'tbody', 'tr', 'th', 'td',
    'div', 'span'
  ],
  ALLOWED_ATTR: [
    'href', 'src', 'alt', 'title', 'class',
    'id', 'target', 'rel', 'width', 'height'
  ],
  ALLOW_DATA_ATTR: false
}

// Custom renderer
const renderer = new marked.Renderer()

// Override link rendering to add security attributes
renderer.link = function(href, title, text) {
  const titleAttr = title ? ` title="${title}"` : ''
  return `<a href="${href}"${titleAttr} target="_blank" rel="noopener noreferrer">${text}</a>`
}

// Override code block rendering to add copy button
renderer.code = function(code, language) {
  const validLanguage = language && hljs.getLanguage(language) ? language : 'plaintext'
  const highlighted = hljs.highlight(code, { language: validLanguage }).value

  return `
    <div class="code-block">
      <div class="code-header">
        <span class="code-language">${validLanguage}</span>
        <button class="copy-code-button" onclick="copyCode(this)" title="Copy code">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </button>
      </div>
      <pre><code class="hljs language-${validLanguage}">${highlighted}</code></pre>
    </div>
  `
}

// Set custom renderer
marked.setOptions({
  ...markedOptions,
  renderer
})

// Main markdown parsing function
export function parseMarkdown(content) {
  if (!content) return ''

  try {
    // Parse markdown
    const html = marked.parse(content)

    // Sanitize HTML
    const clean = DOMPurify.sanitize(html, purifyConfig)

    return clean
  } catch (error) {
    console.error('Markdown parsing error:', error)
    return DOMPurify.sanitize(content)
  }
}

// Extract code blocks from markdown
export function extractCodeBlocks(content) {
  const codeBlocks = []
  const regex = /```(\w+)?\n([\s\S]*?)```/g
  let match

  while ((match = regex.exec(content)) !== null) {
    codeBlocks.push({
      language: match[1] || 'plaintext',
      code: match[2].trim()
    })
  }

  return codeBlocks
}

// Strip markdown formatting
export function stripMarkdown(content) {
  if (!content) return ''

  return content
    // Remove headers
    .replace(/^#{1,6}\s+/gm, '')
    // Remove bold/italic
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(\*|_)(.*?)\1/g, '$2')
    // Remove links
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Remove images
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '')
    // Remove code blocks
    .replace(/```[\s\S]*?```/g, '')
    // Remove inline code
    .replace(/`([^`]+)`/g, '$1')
    // Remove blockquotes
    .replace(/^>\s+/gm, '')
    // Remove lists
    .replace(/^[\s]*[-*+]\s+/gm, '')
    .replace(/^[\s]*\d+\.\s+/gm, '')
    // Clean up extra whitespace
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

// Get preview text from markdown
export function getPreviewText(content, maxLength = 100) {
  const stripped = stripMarkdown(content)
  if (stripped.length <= maxLength) {
    return stripped
  }
  return stripped.substring(0, maxLength).trim() + '...'
}

// Global function for copying code (attached to window)
if (typeof window !== 'undefined') {
  window.copyCode = function(button) {
    const codeBlock = button.closest('.code-block')
    const code = codeBlock.querySelector('code').textContent

    navigator.clipboard.writeText(code).then(() => {
      // Show success feedback
      const originalHTML = button.innerHTML
      button.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
      `
      button.classList.add('copied')

      setTimeout(() => {
        button.innerHTML = originalHTML
        button.classList.remove('copied')
      }, 2000)
    }).catch(err => {
      console.error('Failed to copy code:', err)
    })
  }
}

// Export marked instance for custom configuration
export { marked, hljs }