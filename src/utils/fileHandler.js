// File size limits (in bytes)
const FILE_SIZE_LIMITS = {
  image: 10 * 1024 * 1024, // 10MB
  document: 25 * 1024 * 1024, // 25MB
  default: 10 * 1024 * 1024 // 10MB
}

// Allowed file types
const ALLOWED_FILE_TYPES = {
  image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
  document: [
    'application/pdf',
    'text/plain',
    'text/markdown',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]
}

// File type categories
export const FILE_CATEGORIES = {
  IMAGE: 'image',
  DOCUMENT: 'document',
  OTHER: 'other'
}

// Get file category
export function getFileCategory(file) {
  if (!file || !file.type) return FILE_CATEGORIES.OTHER

  if (ALLOWED_FILE_TYPES.image.includes(file.type)) {
    return FILE_CATEGORIES.IMAGE
  }

  if (ALLOWED_FILE_TYPES.document.includes(file.type)) {
    return FILE_CATEGORIES.DOCUMENT
  }

  return FILE_CATEGORIES.OTHER
}

// Validate file
export function validateFile(file) {
  const errors = []

  if (!file) {
    errors.push('No file provided')
    return { valid: false, errors }
  }

  // Check file type
  const category = getFileCategory(file)
  const allowedTypes = [...ALLOWED_FILE_TYPES.image, ...ALLOWED_FILE_TYPES.document]

  if (!allowedTypes.includes(file.type)) {
    errors.push(`File type ${file.type} is not allowed`)
  }

  // Check file size
  const sizeLimit = FILE_SIZE_LIMITS[category] || FILE_SIZE_LIMITS.default
  if (file.size > sizeLimit) {
    errors.push(`File size exceeds limit of ${formatFileSize(sizeLimit)}`)
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

// Format file size
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Read file as data URL
export function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      resolve(e.target.result)
    }

    reader.onerror = (error) => {
      reject(error)
    }

    reader.readAsDataURL(file)
  })
}

// Read file as text
export function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      resolve(e.target.result)
    }

    reader.onerror = (error) => {
      reject(error)
    }

    reader.readAsText(file)
  })
}

// Read file as array buffer
export function readFileAsArrayBuffer(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      resolve(e.target.result)
    }

    reader.onerror = (error) => {
      reject(error)
    }

    reader.readAsArrayBuffer(file)
  })
}

// Create image preview
export async function createImagePreview(file, maxWidth = 200, maxHeight = 200) {
  if (getFileCategory(file) !== FILE_CATEGORIES.IMAGE) {
    throw new Error('File is not an image')
  }

  const dataUrl = await readFileAsDataURL(file)

  return new Promise((resolve, reject) => {
    const img = new Image()

    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      // Calculate new dimensions
      let width = img.width
      let height = img.height

      if (width > height) {
        if (width > maxWidth) {
          height *= maxWidth / width
          width = maxWidth
        }
      } else {
        if (height > maxHeight) {
          width *= maxHeight / height
          height = maxHeight
        }
      }

      // Set canvas dimensions
      canvas.width = width
      canvas.height = height

      // Draw resized image
      ctx.drawImage(img, 0, 0, width, height)

      // Get preview URL
      canvas.toBlob((blob) => {
        const previewUrl = URL.createObjectURL(blob)
        resolve({
          url: previewUrl,
          width,
          height,
          originalWidth: img.width,
          originalHeight: img.height
        })
      }, file.type)
    }

    img.onerror = reject
    img.src = dataUrl
  })
}

// Extract file extension
export function getFileExtension(filename) {
  const parts = filename.split('.')
  return parts.length > 1 ? parts.pop().toLowerCase() : ''
}

// Get file icon based on type
export function getFileIcon(file) {
  const category = getFileCategory(file)
  const extension = getFileExtension(file.name)

  const icons = {
    // Images
    jpg: '🖼️',
    jpeg: '🖼️',
    png: '🖼️',
    gif: '🖼️',
    webp: '🖼️',
    svg: '🖼️',

    // Documents
    pdf: '📄',
    doc: '📝',
    docx: '📝',
    txt: '📃',
    md: '📋',
    xls: '📊',
    xlsx: '📊',

    // Default
    default: '📎'
  }

  return icons[extension] || icons.default
}

// Compress image
export async function compressImage(file, maxWidth = 1920, quality = 0.8) {
  if (getFileCategory(file) !== FILE_CATEGORIES.IMAGE) {
    return file
  }

  const dataUrl = await readFileAsDataURL(file)

  return new Promise((resolve) => {
    const img = new Image()

    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      // Calculate new dimensions
      let width = img.width
      let height = img.height

      if (width > maxWidth) {
        height = (maxWidth / width) * height
        width = maxWidth
      }

      // Set canvas dimensions
      canvas.width = width
      canvas.height = height

      // Draw image
      ctx.drawImage(img, 0, 0, width, height)

      // Convert to blob
      canvas.toBlob(
        (blob) => {
          const compressedFile = new File([blob], file.name, {
            type: file.type,
            lastModified: Date.now()
          })

          // Return compressed file if smaller, otherwise original
          resolve(compressedFile.size < file.size ? compressedFile : file)
        },
        file.type,
        quality
      )
    }

    img.src = dataUrl
  })
}

// Handle file drop
export function handleFileDrop(event, callback) {
  event.preventDefault()
  event.stopPropagation()

  const files = Array.from(event.dataTransfer.files)

  if (callback && typeof callback === 'function') {
    callback(files)
  }

  return files
}

// Create file from URL
export async function createFileFromUrl(url, filename) {
  try {
    const response = await fetch(url)
    const blob = await response.blob()
    return new File([blob], filename, { type: blob.type })
  } catch (error) {
    console.error('Error creating file from URL:', error)
    throw error
  }
}

// Export all file types for reference
export const FILE_TYPES = ALLOWED_FILE_TYPES
export const SIZE_LIMITS = FILE_SIZE_LIMITS