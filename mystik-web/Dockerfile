# Исправленный Dockerfile с правильным health check

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

# Исправленный health check с увеличенными таймаутами
HEALTHCHECK --interval=30s --timeout=20s --start-period=120s --retries=5 \
    CMD curl -f http://localhost:8000/api/health || exit 1

# Запуск приложения с подробным логированием
CMD ["sh", "-c", "echo '🚀 Starting Mystik Web Server on 0.0.0.0:8000...' && echo 'Environment: production' && echo 'Working directory:' && pwd && echo 'Files:' && ls -la && cd server && echo 'Server files:' && ls -la && echo 'Starting server...' && npm start"]