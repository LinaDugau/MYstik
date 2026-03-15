# Максимально надежный Dockerfile с проверкой сборки

FROM node:24-slim

# Устанавливаем необходимые системные пакеты
RUN DEBIAN_FRONTEND=noninteractive apt-get update && \
    apt-get install -y --no-install-recommends \
    curl \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Рабочая директория
WORKDIR /app

# Копируем файлы проекта
COPY . .

# Устанавливаем зависимости основного проекта
RUN echo "🔧 Installing main project dependencies..." && \
    npm cache clean --force && \
    rm -rf node_modules package-lock.json && \
    npm install --legacy-peer-deps --verbose && \
    echo "✅ Main dependencies installed"

# Собираем фронтенд с проверкой
RUN echo "🏗️ Building frontend..." && \
    npm run build && \
    echo "📁 Checking build output..." && \
    ls -la dist/ && \
    echo "� Checking index.html..." && \
    ls -la dist/index.html && \
    echo "📦 Checking assets..." && \
    ls -la dist/assets/ && \
    echo "✅ Frontend built successfully"

# Настраиваем сервер с максимальной надежностью
RUN echo "🖥️ Setting up server..." && \
    cd server && \
    echo "Cleaning server cache and files..." && \
    npm cache clean --force && \
    rm -rf node_modules && \
    rm -f package-lock.json && \
    rm -f bun.lock && \
    rm -f yarn.lock && \
    echo "Installing server dependencies..." && \
    npm install --legacy-peer-deps --verbose --no-optional && \
    echo "Running database migration..." && \
    npm run migrate && \
    echo "✅ Server setup completed"

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
ENV HOST=0.0.0.0

# Health check с расширенными параметрами
HEALTHCHECK --interval=30s --timeout=30s --start-period=180s --retries=3 \
    CMD curl -f http://localhost:8000/api/health || exit 1

# Запуск с детальным логированием и проверкой файлов
CMD ["sh", "-c", "echo '🚀 Starting Mystik Web Server...' && echo 'Node version:' && node --version && echo 'NPM version:' && npm --version && echo 'Working directory:' && pwd && echo 'Checking dist directory:' && ls -la dist/ && echo 'Files in server:' && ls -la server/ && echo 'Starting simple server...' && cd server && node simple-server.js"]