# Оптимизированный Dockerfile для продакшена с исправленным сервером

FROM node:24-slim AS base

# Устанавливаем системные зависимости
RUN DEBIAN_FRONTEND=noninteractive apt-get update && \
    apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Создаем пользователя для безопасности
RUN groupadd --gid 2000 app && \
    useradd --uid 2000 --gid 2000 -m -s /bin/bash app

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем все файлы проекта
COPY --chown=app:app . .

# Переходим в директорию веб-приложения
WORKDIR /app/mystik-web

# Устанавливаем зависимости и собираем проект
RUN npm install --legacy-peer-deps && \
    npx tsc -b && \
    npx vite build && \
    cd server && \
    npm install --legacy-peer-deps && \
    npm run migrate

# Переключаемся на непривилегированного пользователя
USER app

# Открываем порт
EXPOSE 8000

# Устанавливаем переменные окружения
ENV NODE_ENV=production
ENV PORT=8000

# Health check для проверки состояния
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/api/health || exit 1

# Запускаем production сервер
CMD ["npm", "start"]