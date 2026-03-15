# 🐳 Альтернативные варианты Dockerfile

## 🎯 Если основной Dockerfile не работает

### Вариант 1: Упрощенный (Dockerfile.simple)

```dockerfile
FROM node:24-slim

RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY . .

RUN npm install --legacy-peer-deps && \
    npm run build && \
    cd server && \
    npm install --legacy-peer-deps && \
    npm run migrate

EXPOSE 8000
ENV NODE_ENV=production PORT=8000

CMD ["npm", "start"]
```

### Вариант 2: Без TypeScript проверки

```dockerfile
FROM node:24-slim

RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .
RUN npm run build:no-check && \
    cd server && \
    npm install --legacy-peer-deps && \
    npm run migrate

EXPOSE 8000
CMD ["npm", "start"]
```

### Вариант 3: Многоэтапная сборка

```dockerfile
FROM node:24-slim AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build

FROM node:24-slim AS production
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server
COPY --from=builder /app/package.json ./
RUN cd server && npm install --legacy-peer-deps --only=production && npm run migrate
EXPOSE 8000
CMD ["npm", "start"]
```

## 🚀 Как использовать альтернативы

### Переименовать файл:
```bash
mv Dockerfile Dockerfile.backup
mv Dockerfile.simple Dockerfile
```

### Или указать конкретный файл:
```bash
docker build -f Dockerfile.simple -t mystik-web .
```