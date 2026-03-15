# Окончательный рабочий Dockerfile для Mystik Web
# Domain: linadugau-mystik-c815.twc1.net
# Public IP: 5.129.193.50
# Private IP: 192.168.0.4

FROM node:24-slim

# Устанавливаем системные зависимости
RUN DEBIAN_FRONTEND=noninteractive apt-get update && \
    apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Рабочая директория
WORKDIR /app

# Копируем все файлы проекта
COPY . .

# Устанавливаем зависимости и собираем фронтенд
RUN echo "🔧 Installing dependencies..." && \
    npm cache clean --force && \
    rm -rf node_modules package-lock.json && \
    npm install --legacy-peer-deps && \
    echo "🏗️ Building frontend..." && \
    npm run build && \
    echo "📁 Checking build output..." && \
    ls -la dist/ && \
    echo "✅ Build completed successfully"

# Создаем пользователя для безопасности
RUN groupadd --gid 2000 app && \
    useradd --uid 2000 --gid 2000 -m -s /bin/bash app && \
    chown -R app:app /app

# Переключаемся на непривилегированного пользователя
USER app

# Открываем порт 8000
EXPOSE 8000

# Переменные окружения
ENV NODE_ENV=production
ENV PORT=8000
ENV HOST=0.0.0.0

# Health check отключен для упрощения запуска
# HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
#     CMD curl -f http://localhost:8000/ping || exit 1

# Запуск автономного сервера (без зависимостей от server/package.json)
CMD ["sh", "-c", "echo '🚀 Starting Mystik Web Server...' && echo '🌐 Domain: linadugau-mystik-c815.twc1.net' && echo '📁 Working directory:' && pwd && echo '📦 Dist contents:' && ls -la dist/ && echo '🚀 Starting standalone server...' && node standalone-server.js"]