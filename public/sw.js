const CACHE_NAME = 'claude-chat-v1'
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg'
]

// 설치 이벤트
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('캐시 열기')
        return cache.addAll(urlsToCache)
      })
  )
})

// 활성화 이벤트
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('이전 캐시 삭제:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
})

// 페치 이벤트
self.addEventListener('fetch', event => {
  // API 요청은 캐시하지 않음
  if (event.request.url.includes('/api/')) {
    return
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // 캐시에서 찾으면 반환
        if (response) {
          return response
        }

        // 네트워크 요청
        return fetch(event.request).then(response => {
          // 유효한 응답이 아니면 반환
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response
          }

          // 응답 복제
          const responseToCache = response.clone()

          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache)
            })

          return response
        })
      })
      .catch(() => {
        // 오프라인 페이지 반환 (필요시)
        return caches.match('/offline.html')
      })
  )
})