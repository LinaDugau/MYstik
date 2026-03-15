# 🏥 Исправление Health Check проблем

## 🚨 Проблема: Контейнер в состоянии "starting"

Health check не проходит, приложение не отвечает на запросы.

## ✅ Быстрое решение

### 1. Обновите Dockerfile:
Используйте исправленный Dockerfile с увеличенными таймаутами:
- `start-period: 60s` (было 40s)
- `timeout: 15s` (было 10s)  
- `retries: 5` (было 3)

### 2. Проверьте логи контейнера:
```bash
# Логи в реальном времени
docker logs -f mystik-web-app

# Последние 50 строк
docker logs --tail=50 mystik-web-app
```

### 3. Диагностика внутри контейнера:
```bash
# Подключитесь к контейнеру
docker exec -it mystik-web-app bash

# Запустите диагностику
cd server && npm run debug

# Проверьте процессы
ps aux | grep node

# Проверьте порты
netstat -tlnp | grep 8000

# Проверьте API вручную
curl -v http://localhost:8000/api/health
```

### 4. Если проблемы остаются:

**Используйте debug версию:**
```bash
# Переименуйте файлы
mv Dockerfile Dockerfile.backup
mv Dockerfile.debug Dockerfile

# Пересоберите
docker-compose up --build -d
```

**Или упрощенную версию:**
```bash
mv Dockerfile.simple Dockerfile
docker-compose up --build -d
```

## 🔍 Частые причины проблем:

1. **Медленный запуск** - увеличьте `start-period`
2. **Ошибка миграции БД** - проверьте логи миграции
3. **Неправильный порт** - убедитесь что используется 8000
4. **Ошибка в коде сервера** - проверьте `production-server.js`
5. **Недостаток памяти** - увеличьте лимиты контейнера

## 📊 Ожидаемые результаты после исправления:

- ✅ Health check проходит успешно
- ✅ Контейнер в состоянии "healthy"
- ✅ API возвращает JSON (не HTML)
- ✅ Размер бандла уменьшен до ~400-500 KB
- ✅ Уязвимости npm исправлены

## 🆘 Если ничего не помогает:

1. Очистите Docker кеш: `docker system prune -a`
2. Пересоберите без кеша: `docker-compose build --no-cache`
3. Проверьте ресурсы системы: `docker stats`
4. Используйте `Dockerfile.simple` для минимальной конфигурации