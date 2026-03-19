FROM oven/bun:1.1.22

WORKDIR /app

# Копируем package.json в отдельный слой, чтобы кэшировать установку зависимостей
COPY package.json ./

COPY . .

RUN bun install --production

ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

# Инициализация/миграции БД при старте + наполнение базовых данных + запуск API
# Важно: без docker volumes Timeweb контейнер может пересоздаваться, поэтому заполняем квизы при каждом старте.
CMD ["sh", "-c", "bun migrate.js && bun migrate-full-quizzes.js && bun migrate-tarot-full.js && bun migrate-tarot-additional.js && bun index.js"]

