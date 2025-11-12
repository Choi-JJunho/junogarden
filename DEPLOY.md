# 배포 가이드

## Docker Hub에 이미지 푸시하기

### 1. Docker Hub 로그인
```bash
docker login
```

### 2. 멀티 플랫폼 빌드 및 푸시 (권장)
```bash
# buildx 사용 (AMD64 + ARM64)
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t junho5336/homepage:latest \
  --push \
  .
```

또는 Makefile 사용:
```bash
make build-push
```

### 3. 단일 플랫폼 빌드 및 푸시
```bash
# 빌드
docker build -t junho5336/homepage:latest .

# 푸시
docker push junho5336/homepage:latest
```

또는 Makefile 사용:
```bash
make build
make push
```

## 로컬 개발

### 개발 서버 실행 (포트 18888)
```bash
npm run dev
# 또는
make dev
```

### Docker Compose로 실행
```bash
# 시작
docker-compose up -d
# 또는
make up

# 로그 확인
docker-compose logs -f
# 또는
make logs

# 중지
docker-compose down
# 또는
make down
```

## 서버 배포

### Docker Hub 이미지 사용
서버에서 이미지를 pull 받아 실행:

```bash
# 이미지 pull
docker pull junho5336/homepage:latest

# 컨테이너 실행
docker run -d \
  --name junogarden-web \
  -p 18888:18888 \
  --restart unless-stopped \
  junho5336/homepage:latest
```

또는 docker-compose 사용:
```bash
# docker-compose.yml이 있는 디렉토리에서
docker-compose pull
docker-compose up -d
```

### 업데이트
```bash
# 새 이미지 pull
docker-compose pull

# 재시작
docker-compose up -d
```

## Makefile 명령어

프로젝트 루트에 Makefile이 있어 편리하게 명령을 실행할 수 있습니다:

```bash
make help           # 사용 가능한 명령어 보기
make build          # 로컬용 Docker 이미지 빌드
make push           # Docker Hub에 이미지 푸시
make build-push     # 멀티 플랫폼 빌드 및 푸시 (권장)
make build-local    # 로컬 플랫폼만 빌드
make dev            # 개발 서버 실행
make up             # Docker Compose 시작
make down           # Docker Compose 중지
make logs           # 컨테이너 로그 보기
make clean          # 컨테이너 및 이미지 제거
```

## 포트 설정

기본 포트: **18888**

변경하려면:
- `package.json`의 `dev`, `start` 스크립트
- `docker-compose.yml`의 `ports` 섹션
- `Dockerfile`의 `EXPOSE`와 `PORT` 환경 변수

## 주의사항

- **멀티 플랫폼 빌드**: `docker buildx`를 사용하면 AMD64와 ARM64 아키텍처 모두 지원
- **빌드 시간**: 멀티 플랫폼 빌드는 시간이 오래 걸릴 수 있습니다 (5-10분)
- **Docker Hub 권한**: `junho5336/homepage` 저장소에 push 권한이 있어야 합니다
- **buildx 설정**: 첫 사용시 buildx builder 생성 필요:
  ```bash
  docker buildx create --use
  ```

## 헬스체크

컨테이너가 정상 동작하는지 확인:
```bash
# 컨테이너 상태 확인
docker ps

# 헬스체크 상태
docker inspect junogarden-web | grep -A 5 Health

# 직접 접속 테스트
curl http://localhost:18888
```
