FROM node:24-alpine

WORKDIR /app

COPY ./ .

WORKDIR /app/server

RUN npm install

RUN npm run build

CMD ["node", "dist/server/index.js"]
