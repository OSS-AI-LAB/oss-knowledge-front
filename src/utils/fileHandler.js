// 파일 크기 포맷팅
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 파일 타입 검증
export const validateFileType = (file) => {
  const allowedTypes = {
    'text/plain': 'txt',
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'application/pdf': 'pdf'
  }

  return allowedTypes[file.type] || null
}

// 파일 크기 검증 (10MB 제한)
export const validateFileSize = (file) => {
  const maxSize = 10 * 1024 * 1024 // 10MB
  return file.size <= maxSize
}

// 파일 읽기
export const readFileAsDataURL = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// 파일 아이콘 가져오기
export const getFileIcon = (fileType) => {
  const icons = {
    'txt': '📄',
    'png': '🖼️',
    'jpg': '🖼️',
    'jpeg': '🖼️',
    'pdf': '📑'
  }

  return icons[fileType] || '📎'
}