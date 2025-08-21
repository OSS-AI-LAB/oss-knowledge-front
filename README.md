# OSS Knowledge Front

Vue.js 기반의 OSS 지식 관리 프론트엔드 애플리케이션입니다.

## Docker 배포

### 방법 1: Docker Compose 사용 (권장)

```bash
# 애플리케이션 빌드 및 실행
docker-compose up -d

# 로그 확인
docker-compose logs -f

# 애플리케이션 중지
docker-compose down
```

### 방법 2: Docker 명령어 직접 사용

```bash
# 이미지 빌드
docker build -t oss-knowledge-front .

# 컨테이너 실행
docker run -d -p 3000:80 --name oss-knowledge-front oss-knowledge-front

# 컨테이너 중지 및 삭제
docker stop oss-knowledge-front
docker rm oss-knowledge-front
```

## 접속 방법

애플리케이션이 실행되면 다음 URL로 접속할 수 있습니다:
- http://localhost:3000

## 환경 변수

필요한 경우 환경 변수를 설정할 수 있습니다:

```bash
# Docker Compose 사용 시
docker-compose up -d -e API_URL=https://your-api-url.com

# Docker 명령어 사용 시
docker run -d -p 3000:80 -e API_URL=https://your-api-url.com oss-knowledge-front
```
