# Многоэтапная сборка для оптимизации размера образа

# Этап 1: Сборка фронтенда
FROM node:18-alpine AS frontend-builder

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем корневой package.json
COPY package*.json ./
RUN npm install --legacy-peer-deps --only=production

# Копируем файлы веб-приложения
COPY mystik-web/package*.json ./mystik-web/
COPY mystik-web/tsconfig*.json ./mystik-web/
COPY mystik-web/vite.config.ts ./mystik-web/
COPY mystik-web/index.html ./mystik-web/
COPY mystik-web/src ./mystik-web/src/

# Устанавливаем зависимости и собираем фронтенд
WORKDIR /app/mystik-web
RUN npm install --legacy-peer-deps
RUN npm run build

# Этап 2: Подготовка сервера
FROM node:18-alpine AS server-builder

WORKDIR /app/mystik-web/server

# Копируем серверные файлы
COPY mystik-web/server/package*.json ./
RUN npm install --legacy-peer-deps --only=production

# Этап 3: Финальный образ
FROM node:18-alpine AS production

# Устанавливаем curl для healthcheck
RUN apk add --no-cache curl

WORKDIR /app/mystik-web

# Копируем собранный фронтенд
COPY --from=frontend-builder /app/mystik-web/dist ./dist

# Копируем серверные файлы и зависимости
COPY --from=server-builder /app/mystik-web/server ./server
COPY mystik-web/server/*.js ./server/
COPY mystik-web/server/data ./server/data

# Копируем package.json для команды запуска
COPY mystik-web/package.json ./

# Создаем пользователя для безопасности
RUN addgroup -g 1001 -S nodejs
RUN adduser -S mystik -u 1001

# Устанавливаем права на файлы
RUN chown -R mystik:nodejs /app/mystik-web
USER mystik

# Выполняем миграцию базы данных
WORKDIR /app/mystik-web/server
RUN npm run migrate

# Возвращаемся в основную директорию
WORKDIR /app/mystik-web

# Открываем порт
EXPOSE 8000

# Устанавливаем переменные окружения
ENV NODE_ENV=production
ENV PORT=8000

# Запускаем сервер
CMD ["npm", "start"]