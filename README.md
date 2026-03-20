# Mystik Web

Актуальная web-версия Mystik с backend на MySQL и запуском через Docker Compose.

## Запуск (рекомендуется)

```bash
cd mystik-web
cp .env.docker.example .env
docker compose up -d --build
```

Открыть:
- Frontend: `http://localhost:8081`
- Backend API: `http://localhost:3001`

## Что поднимается

- `frontend` — React/Vite сборка через Nginx
- `backend` — Bun + Express API (`server/index-mysql.js`)
- `mysql` — MySQL 8.4

## База данных

- При первом старте MySQL (когда volume пустой) автоматически импортируется дамп:
  - `server/mystik.sql`
- Повторно применить дамп:

```bash
docker compose down -v
docker compose up -d --build
```

## Остановка

```bash
docker compose down
```

## Очистка (вместе с БД)

```bash
docker compose down -v
```

## Полезные команды

```bash
# статус контейнеров
docker compose ps

# логи backend
docker logs mystik-backend

# логи frontend
docker logs mystik-frontend

# логи mysql
docker logs mystik-mysql
```

## Структура (ключевое)

```text
mystik-web/
├── docker-compose.yml
├── .env.docker.example
├── DOCKER.md
├── server/
│   ├── index-mysql.js
│   ├── db-mysql.js
│   ├── mystik.sql
│   └── Dockerfile
└── src/
```

