#!/bin/bash
# setup.sh - Claude Chat Clone 프로젝트 설정 스크립트

echo "Claude Chat Clone 프로젝트 설정을 시작합니다..."

# Node.js 버전 확인
node_version=$(node -v 2>/dev/null)
if [ $? -ne 0 ]; then
    echo "❌ Node.js가 설치되어 있지 않습니다."
    echo "https://nodejs.org 에서 Node.js를 설치해주세요."
    exit 1
fi

echo "✅ Node.js 버전: $node_version"

# 프로젝트 디렉토리 구조 생성
echo "📁 디렉토리 구조 생성 중..."
mkdir -p src/{components/{chat,sidebar,common},views,stores,services,router,assets}
mkdir -p public

# package.json이 없으면 npm init
if [ ! -f "package.json" ]; then
    echo "📦 package.json 생성 중..."
    npm init -y
fi

# 의존성 설치
echo "📦 의존성 설치 중..."
npm install vue@latest vue-router@latest pinia@latest axios marked highlight.js @vueuse/core vue-markdown-render

echo "📦 개발 의존성 설치 중..."
npm install -D @vitejs/plugin-vue vite sass autoprefixer postcss tailwindcss

# 환경 변수 파일 생성
if [ ! -f ".env" ]; then
    echo "🔧 환경 변수 파일 생성 중..."
    cp .env.example .env 2>/dev/null || echo "# 환경 변수
VITE_API_BASE_URL=http://localhost:3000/api
VITE_API_KEY=your_api_key_here
VITE_MOCK_API=true" > .env
fi

# Vite 설정 파일 확인
if [ ! -f "vite.config.js" ]; then
    echo "⚡ Vite 설정 파일이 없습니다. vite.config.js를 생성해주세요."
fi

# 기본 아이콘 생성 (placeholder)
if [ ! -f "public/favicon.svg" ]; then
    echo '<?xml version="1.0" encoding="UTF-8"?>
<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect width="32" height="32" rx="8" fill="#0066ff"/>
<path d="M16 8C11.58 8 8 11.58 8 16s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z" fill="white"/>
<path d="M16 10v6l3 3" stroke="white" stroke-width="2" stroke-linecap="round"/>
</svg>' > public/favicon.svg
fi

echo "
✅ 프로젝트 설정이 완료되었습니다!

다음 명령어로 개발 서버를 시작할 수 있습니다:
  npm run dev

빌드하려면:
  npm run build

행운을 빕니다! 🚀
"