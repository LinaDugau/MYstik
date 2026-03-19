FROM oven/bun:1.1.22

WORKDIR /app

# Копируем package.json в отдельный слой, чтобы кэшировать установку зависимостей
COPY package.json ./

COPY . .

RUN bun install --production

ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

# Миграция БД при старте + запуск API
CMD ["sh", "-c", "bun migrate.js && bun index.js"]

