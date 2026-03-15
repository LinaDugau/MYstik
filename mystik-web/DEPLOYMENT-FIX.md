# 🚀 ИСПРАВЛЕНИЕ РАЗВЕРТЫВАНИЯ - ПОЛНОЕ РЕШЕНИЕ

## 🚨 КРИТИЧЕСКИЕ ИСПРАВЛЕНИЯ

### 1. ✅ API ВОЗВРАЩАЕТ JSON (НЕ HTML)
**Проблема:** API endpoints возвращали HTML вместо JSON
**Решение:** Переписан `production-server.js` с правильным порядком middleware:
- API routes ПЕРЕД static files
- Все API endpoints определены напрямую (без импорта index.js)
- Правильная обработка CORS и JSON responses

### 2. ✅ СЕРВЕР СЛУШАЕТ НА 0.0.0.0:8000
**Проблема:** Health check не проходил из-за localhost binding
**Решение:** Сервер теперь слушает на `0.0.0.0:8000` для Docker совместимости

### 3. ✅ ИСПРАВЛЕНЫ ЗАВИСИМОСТИ
**Проблема:** Конфликты package-lock.json и bun.lock
**Решение:** 
- Очистка всех lock files перед установкой
- TypeScript в dependencies (не devDependencies)
- Упрощенный Dockerfile без лишних шагов

## 🐳 НОВАЯ КОНФИГУРАЦИЯ DOCKER

### Dockerfile (упрощенный и надежный):
```dockerfile
FROM node:24-slim
WORKDIR /app
COPY . .
RUN npm cache clean --force && \
    npm install --legacy-peer-deps && \
    npm run build && \
    cd server && \
    npm cache clean --force && \
    rm -rf node_modules package-lock.json bun.lock && \
    npm install --legacy-peer-deps && \
    npm run migrate
EXPOSE 8000
ENV NODE_ENV=production PORT=8000
HEALTHCHECK --interval=30s --timeout=20s --start-period=120s --retries=5 \
    CMD curl -f http://localhost:8000/api/health || exit 1
CMD ["sh", "-c", "cd server && npm start"]
```

### Настройки платформы:
- **Путь до директории проекта:** `mystik-web`
- **Путь проверки состояния:** `/api/health`
- **Порт:** `8000`
- **Приватная сеть:** Да
- **IP диапазон:** `192.168.0.0/24`
- **Приватный IP:** `192.168.0.4`

## 🔧 ПЕРЕМЕННЫЕ ОКРУЖЕНИЯ

```bash
NODE_ENV=production
PORT=8000
VITE_API_URL=https://linadugau-mystik-39d3.twc1.net
```

## 📊 ПРОВЕРКА РАБОТОСПОСОБНОСТИ

### 1. Health Check:
```bash
curl https://linadugau-mystik-39d3.twc1.net/api/health
```
**Ожидаемый ответ:**
```json
{
  "ok": true,
  "status": "healthy",
  "timestamp": "2026-03-15T...",
  "environment": "production",
  "port": 8000
}
```

### 2. API Endpoints:
```bash
# Quizzes
curl https://linadugau-mystik-39d3.twc1.net/api/quizzes

# Tarot spreads
curl https://linadugau-mystik-39d3.twc1.net/api/tarot/spreads

# Tarot cards
curl https://linadugau-mystik-39d3.twc1.net/api/tarot/cards
```

**Все должны возвращать JSON с `{"ok": true, ...}`**

## 🚀 ПРОЦЕСС РАЗВЕРТЫВАНИЯ

### 1. Подготовка:
```bash
cd mystik-web
./clean-deps.sh  # Очистка зависимостей
```

### 2. Локальная проверка:
```bash
docker build -t mystik-web .
docker run -p 8000:8000 mystik-web
```

### 3. Проверка API:
```bash
curl http://localhost:8000/api/health
curl http://localhost:8000/api/quizzes
```

### 4. Развертывание на платформе:
- Загрузить код в Git
- Настроить переменные окружения
- Запустить сборку

## 🔍 ДИАГНОСТИКА ПРОБЛЕМ

### Если API возвращает HTML:
1. Проверьте порядок middleware в `production-server.js`
2. API routes должны быть ПЕРЕД static files
3. Проверьте логи: `docker logs -f container_name`

### Если Health Check не проходит:
1. Сервер должен слушать на `0.0.0.0:8000`
2. Увеличьте `start-period` в HEALTHCHECK
3. Проверьте внутри контейнера: `curl http://localhost:8000/api/health`

### Если TypeScript ошибки:
1. TypeScript должен быть в `dependencies`
2. Используйте `npm run build` вместо `npx tsc -b`
3. Очистите кеш: `npm cache clean --force`

## ✅ ОЖИДАЕМЫЙ РЕЗУЛЬТАТ

После исправлений:
- ✅ API endpoints возвращают JSON
- ✅ Health check проходит успешно
- ✅ Мобильное приложение подключается к API
- ✅ Все функции работают корректно
- ✅ Нет ошибок 405 Method Not Allowed
- ✅ Нет ошибок "Expected JSON but got HTML"

## 📞 ПОДДЕРЖКА

Если проблемы остаются:
1. Проверьте логи контейнера
2. Убедитесь что используется правильный Dockerfile
3. Проверьте переменные окружения
4. Протестируйте API endpoints напрямую