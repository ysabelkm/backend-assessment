FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY packages/proto/package.json ./packages/proto/
COPY packages/prisma/package.json ./packages/prisma/
COPY apps/wallet-service/package.json ./apps/wallet-service/

RUN npm install

COPY . .

RUN npm run db:generate
RUN npm run build:wallet

EXPOSE 5002

CMD ["node", "dist/wallet-service/main"]
