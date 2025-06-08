<template>
  <div class="markdown-content" v-html="renderedContent"></div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { marked } from 'marked'
import hljs from 'highlight.js'

const props = defineProps({
  content: {
    type: String,
    default: ''
  }
})

// 마크다운 렌더러 설정
marked.setOptions({
  highlight: function(code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(code, { language: lang }).value
      } catch (err) {
        console.error('Highlight error:', err)
      }
    }
    return hljs.highlightAuto(code).value
  },
  breaks: true,
  gfm: true
})

// 렌더링된 콘텐츠
const renderedContent = computed(() => {
  if (!props.content) return ''

  try {
    // 마크다운 렌더링
    let html = marked(props.content)

    // 코드 블록에 복사 버튼 추가
    html = html.replace(/<pre><code/g, '<div class="code-block"><button class="copy-code" onclick="copyCode(this)">복사</button><pre><code')
    html = html.replace(/<\/code><\/pre>/g, '</code></pre></div>')

    // 링크를 새 탭에서 열도록 설정
    html = html.replace(/<a /g, '<a target="_blank" rel="noopener noreferrer" ')

    return html
  } catch (err) {
    console.error('Markdown rendering error:', err)
    return props.content
  }
})

// 코드 복사 함수를 전역에 등록
onMounted(() => {
  window.copyCode = function(button) {
    const codeBlock = button.nextElementSibling.querySelector('code')
    const code = codeBlock.textContent

    navigator.clipboard.writeText(code).then(() => {
      const originalText = button.textContent
      button.textContent = '복사됨!'
      setTimeout(() => {
        button.textContent = originalText
      }, 2000)
    }).catch(err => {
      console.error('복사 실패:', err)
    })
  }
})
</script>

<style lang="scss">
.markdown-content {
  font-size: 16px;
  line-height: 1.6;
  color: var(--text-primary);

  // 제목
  h1, h2, h3, h4, h5, h6 {
    margin-top: 24px;
    margin-bottom: 16px;
    font-weight: 600;
    line-height: 1.25;
  }

  h1 { font-size: 2em; }
  h2 { font-size: 1.5em; }
  h3 { font-size: 1.25em; }
  h4 { font-size: 1em; }
  h5 { font-size: 0.875em; }
  h6 { font-size: 0.85em; }

  // 단락
  p {
    margin-bottom: 16px;
  }

  // 목록
  ul, ol {
    margin-bottom: 16px;
    padding-left: 2em;
  }

  li {
    margin-bottom: 4px;
  }

  // 인용
  blockquote {
    margin: 16px 0;
    padding-left: 16px;
    border-left: 4px solid var(--border-color);
    color: var(--text-secondary);
  }

  // 인라인 코드
  code:not(.hljs) {
    padding: 2px 4px;
    background-color: var(--code-bg);
    border-radius: 4px;
    font-family: 'Consolas', 'Monaco', 'Andale Mono', 'Ubuntu Mono', monospace;
    font-size: 0.875em;
  }

  // 코드 블록
  .code-block {
    position: relative;
    margin: 16px 0;

    .copy-code {
      position: absolute;
      top: 8px;
      right: 8px;
      padding: 4px 8px;
      background-color: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: 4px;
      font-size: 12px;
      color: var(--text-secondary);
      cursor: pointer;
      transition: all 0.2s;
      z-index: 10;

      &:hover {
        background-color: var(--hover-bg);
        color: var(--text-primary);
      }
    }
  }

  pre {
    margin: 0;
    padding: 16px;
    background-color: var(--code-bg);
    border-radius: 8px;
    overflow-x: auto;

    code {
      background: none;
      padding: 0;
      border-radius: 0;
      font-size: 14px;
      line-height: 1.5;
    }
  }

  // 테이블
  table {
    width: 100%;
    margin: 16px 0;
    border-collapse: collapse;

    th, td {
      padding: 8px 12px;
      border: 1px solid var(--border-color);
      text-align: left;
    }

    th {
      background-color: var(--bg-secondary);
      font-weight: 600;
    }

    tr:nth-child(even) {
      background-color: var(--bg-secondary);
    }
  }

  // 구분선
  hr {
    margin: 24px 0;
    border: none;
    border-top: 1px solid var(--border-color);
  }

  // 링크
  a {
    color: var(--accent-color);
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }

  // 이미지
  img {
    max-width: 100%;
    height: auto;
    border-radius: 8px;
    margin: 16px 0;
  }

  // 작업 목록
  input[type="checkbox"] {
    margin-right: 8px;
  }
}

// Highlight.js 테마
.hljs {
  color: var(--text-primary);
  background: var(--code-bg);
}

.hljs-keyword,
.hljs-selector-tag,
.hljs-literal,
.hljs-section,
.hljs-link {
  color: #0066ff;
}

.hljs-string,
.hljs-title,
.hljs-name,
.hljs-type,
.hljs-attribute,
.hljs-symbol,
.hljs-bullet,
.hljs-addition,
.hljs-variable,
.hljs-template-tag,
.hljs-template-variable {
  color: #22c55e;
}

.hljs-comment,
.hljs-quote,
.hljs-deletion,
.hljs-meta {
  color: var(--text-tertiary);
}

.hljs-keyword,
.hljs-selector-tag,
.hljs-literal,
.hljs-title,
.hljs-section,
.hljs-doctag,
.hljs-type,
.hljs-name,
.hljs-strong {
  font-weight: 600;
}

.hljs-emphasis {
  font-style: italic;
}
</style>