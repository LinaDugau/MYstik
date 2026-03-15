# Исправленный Dockerfile с улучшенным health check и оптимизацией

FROM node:24-slim

# Устанавливаем curl для health check
RUN DEBIAN_FRONTEND=noninteractive apt-get update && \
    apt-get install -y --no-install-recommends curl && \
    rm -rf /var/lib/apt/lists/*

# Рабочая директория
WORKDIR /app

# Копируем package.json для кеширования зависимостей
COPY package*.json ./
RUN npm install --legacy-peer-deps && \
    npm audit fix --force || true

# Копируем остальные файлы
COPY . .

# Собираем проект
RUN npm run build

# Настраиваем сервер
RUN cd server && \
    npm install --legacy-peer-deps && \
    npm audit fix --force || true && \
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

# Улучшенный health check с большим таймаутом
HEALTHCHECK --interval=30s --timeout=15s --start-period=60s --retries=5 \
    CMD curl -f http://localhost:8000/api/health || exit 1

# Запуск приложения с логированием
CMD ["sh", "-c", "echo 'Starting Mystik Web Server...' && npm start"]