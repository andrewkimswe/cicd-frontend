# 빌드 단계
FROM node:18-alpine AS build

# 작업 디렉토리 설정
WORKDIR /app

# 의존성 파일 복사 및 설치
COPY package.json yarn.lock ./
RUN yarn install

# 모든 파일 복사 및 빌드 환경 변수 설정
COPY . .
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=${REACT_APP_API_URL}

# 프로젝트 빌드
RUN yarn build

# 실행 단계
FROM nginx:alpine

# 빌드된 파일을 nginx 디렉토리로 복사
COPY --from=build /app/build /usr/share/nginx/html

# nginx 포트 노출
EXPOSE 80

# nginx 실행 명령어
CMD ["nginx", "-g", "daemon off;"]
