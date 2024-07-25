# 빌드 단계
FROM node:18-alpine as build
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install
COPY . .
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL
RUN yarn build

# 실행 단계
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
