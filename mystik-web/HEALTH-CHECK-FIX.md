# 🏥 КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Health Check

## 🚨 Проблема: Сервер слушает только localhost

**Основная причина:** Сервер привязан к `localhost` вместо `0.0.0.0`

В Docker контейнере health check не может достучаться до сервера!

## ✅ ИСПРАВЛЕНО

### 1. Сервер теперь слушает на 0.0.0.0:

**production-server.js:**
```javascript
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Production server running at http://0.0.0.0:${PORT}`);
});
```

**index.js:**
```javascript
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${PORT}`);
});
```

### 2. Увеличены таймауты health check:

```dockerfile
HEALTHCHECK --interval=30s --timeout=20s --start-period=120s --retries=5 \
    CMD curl -f http://localhost:8000/api/health || exit 1
```

- `start-period: 120s` - больше времени на запуск
- `timeout: 20s` - больше времени на ответ
- `retries: 5` - больше попыток

### 3. Добавлено подробное логирование:

Теперь в логах контейнера будет видно:
- 🚀 Starting Mystik Web Server on 0.0.0.0:8000...
- Environment: production
- Working directory и файлы
- Процесс запуска сервера

## 🔍 Диагностика

### Проверьте логи контейнера:
```bash
docker logs -f mystik-web-app
```

**Должно быть:**
```
🚀 Starting Mystik Web Server on 0.0.0.0:8000...
✅ Production server running at http://0.0.0.0:8000
📊 Health check: http://localhost:8000/api/health
```

### Проверьте внутри контейнера:
```bash
docker exec -it mystik-web-app bash
cd server && npm run debug
curl -v http://localhost:8000/api/health
```

## 🚀 Альтернативы если проблемы остаются:

### 1. Используйте Dockerfile.simple (БЕЗ health check):
```bash
mv Dockerfile Dockerfile.backup
mv Dockerfile.simple Dockerfile
docker-compose up --build -d
```

### 2. Отключите health check в docker-compose.yml:
```yaml
# healthcheck:
#   test: ["CMD", "curl", "-f", "http://localhost:8000/api/health"]
```

## 📊 Ожидаемый результат:

- ✅ Контейнер запускается успешно
- ✅ Health check проходит через 2 минуты
- ✅ Сервер доступен на порту 8000
- ✅ API возвращает JSON (не HTML)