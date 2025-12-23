FROM node:24-alpine AS builder

WORKDIR /app

COPY ./ .

WORKDIR /app/client

RUN npm install

RUN npm run build

FROM nginx:alpine AS runner

WORKDIR /app

COPY --from=builder /app/client/build/ .

COPY ./docker/client/nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]