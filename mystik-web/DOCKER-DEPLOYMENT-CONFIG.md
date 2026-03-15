# 🐳 Конфигурация Docker развертывания

## � ИСПРАВЛЕНИЕ СТРУКТУРЫ ПРОЕКТА

**Проблема:** Платформа ищет `/workspace/app/mystik-web`, но Dockerfile находится в `mystik-web/`

**Решение:** Обновить конфигурацию платформы

---

## 📋 ПРАВИЛЬНЫЕ данные для развертывания

### 📁 Настройка приложения

**Путь до директории проекта:** `mystik-web` (НЕ `app/mystik-web`!)  
**Dockerfile путь:** `mystik-web/Dockerfile`  
**Путь проверки состояния:** `/api/health`  
**Порт приложения:** `8000`  
**Контейнер:** `mystik-web-app`

### 🔧 Команды для платформы

**Команда сборки Docker:**
```bash
docker build -t mystik-web .
```

**Команда запуска:**
```bash
docker run -p 8000:8000 mystik-web
```

### 🌐 Сетевые настройки

**Приватная сеть:** ✅ Да, требуется  
**Диапазон адресов:** `192.168.0.0/24`  
**Приватный IP адрес:** `192.168.0.4`  
**Шлюз:** `192.168.0.1`  
**Сетевой драйвер:** `bridge`

### 🔧 Переменные окружения

```env
NODE_ENV=production
PORT=8000
VITE_API_URL=https://linadugau-mystik-39d3.twc1.net
```

### 🗄️ Тома (Volumes)

- **База данных:** `mystik-db:/app/mystik-web/server/data`
- **Логи:** `mystik-logs:/app/mystik-web/logs`

### 🏥 Health Check

- **URL:** `http://localhost:8000/api/health`
- **Интервал:** 30 секунд
- **Таймаут:** 10 секунд
- **Повторы:** 3
- **Время запуска:** 40 секунд

---

## 🚀 Команды для развертывания

### Быстрый запуск
```bash
cd mystik-web
docker-compose up -d --build
```

### Проверка статуса
```bash
docker-compose ps
docker-compose logs -f mystik-web
```

### Остановка
```bash
docker-compose down
```

### Полная очистка (с удалением данных)
```bash
docker-compose down -v
docker system prune -a
```

---

## 📊 Мониторинг

### Проверка здоровья контейнера
```bash
docker inspect mystik-web-app | grep -A 10 "Health"
```

### Логи в реальном времени
```bash
docker logs -f mystik-web-app
```

### Статистика ресурсов
```bash
docker stats mystik-web-app
```

---

## 🔍 Диагностика

### Подключение к контейнеру
```bash
docker exec -it mystik-web-app /bin/bash
```

### Проверка API внутри контейнера
```bash
docker exec mystik-web-app curl -f http://localhost:8000/api/health
```

### Проверка базы данных
```bash
docker exec mystik-web-app ls -la /app/mystik-web/server/data/
```

---

## 🌍 Внешний доступ

### Локальный доступ
- **Веб-интерфейс:** http://localhost:8000
- **API:** http://localhost:8000/api/health

### Продакшен доступ
- **Веб-интерфейс:** https://linadugau-mystik-39d3.twc1.net
- **API:** https://linadugau-mystik-39d3.twc1.net/api/health

---

## 🔒 Безопасность

### Пользователь контейнера
- **UID:** 2000
- **GID:** 2000
- **Пользователь:** `app`
- **Группа:** `app`

### Сетевая изоляция
- Контейнер работает в изолированной сети `mystik-network`
- Доступ только через порт 8000
- Внутренний IP: 192.168.0.4

---

## 📦 Структура образа

### Базовый образ
```dockerfile
FROM node:24-slim
```

### Установленные пакеты
- Node.js 24
- npm
- curl (для health check)

### Рабочие директории
- `/app` - корневая директория проекта
- `/app/mystik-web` - директория веб-приложения
- `/app/mystik-web/server` - серверная часть
- `/app/mystik-web/dist` - собранный фронтенд

---

## 🔄 Обновление

### Пересборка с новым кодом
```bash
git pull origin main
docker-compose down
docker-compose up -d --build
```

### Обновление только образа
```bash
docker-compose pull
docker-compose up -d
```

---

## 🆘 Устранение неполадок

### Контейнер не запускается
```bash
# Проверить логи
docker-compose logs mystik-web

# Проверить конфигурацию
docker-compose config

# Пересобрать образ
docker-compose build --no-cache
```

### API не отвечает
```bash
# Проверить health check
docker inspect mystik-web-app | grep -A 5 "Health"

# Проверить порты
docker port mystik-web-app

# Проверить сеть
docker network inspect mystik-web_mystik-network
```

### База данных пуста
```bash
# Проверить том
docker volume inspect mystik-web_mystik-db

# Запустить миграцию вручную
docker exec mystik-web-app npm run migrate --prefix server
```

---

## 📋 Чеклист развертывания

- [ ] Docker и Docker Compose установлены
- [ ] Код загружен из репозитория
- [ ] Переменные окружения настроены
- [ ] Порт 8000 свободен
- [ ] Запущен `docker-compose up -d --build`
- [ ] Health check проходит успешно
- [ ] API возвращает JSON (не HTML)
- [ ] Веб-интерфейс доступен
- [ ] База данных содержит данные
- [ ] Логи не содержат ошибок