FROM nginx:1.23.3-alpine-slim
RUN mkdir /app
COPY ./dist/ /app/comercial/
COPY ./deploy/nginx/nginx.conf /etc/nginx/nginx.conf