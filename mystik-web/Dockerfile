# Простой и надежный Dockerfile для продакшена

FROM node:24-slim

# Устанавливаем curl для health check
RUN DEBIAN_FRONTEND=noninteractive apt-get update && \
    apt-get install -y --no-install-recommends curl && \
    rm -rf /var/lib/apt/lists/*

# Рабочая директория
WORKDIR /app

# Копируем все файлы проекта
COPY . .

# Устанавливаем зависимости и собираем проект
RUN npm install --legacy-peer-deps && \
    npm run build && \
    cd server && \
    npm install --legacy-peer-deps && \
    npm run migrate

# Создаем пользователя для безопасности
RUN groupadd --gid 2000 app && \
    useradd --uid 2000 --gid 2000 -m -s /bin/bash app && \
    chown -R app:app /app

# Переключаемся на непривилегированного пользователя
USER app

# Открываем порт
EXPOSE 8000

# Переменные окружения
ENV NODE_ENV=production
ENV PORT=8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8000/api/health || exit 1

# Запуск приложения
CMD ["npm", "start"]