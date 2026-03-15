# 🐳 Docker Deployment Guide

## Быстрый запуск

### Вариант 1: Docker Compose (рекомендуется)

```bash
# Сборка и запуск
docker-compose up --build -d

# Просмотр логов
docker-compose logs -f

# Остановка
docker-compose down
```

### Вариант 2: Скрипты автоматизации

**Linux/macOS:**
```bash
chmod +x docker-build.sh
./docker-build.sh
```

**Windows:**
```powershell
.\docker-build.ps1
```

### Вариант 3: Ручная сборка

```bash
# Сборка образа
docker build -t mystik-web .

# Запуск контейнера
docker run -d \
  --name mystik-web \
  -p 8000:8000 \
  -v $(pwd)/server/data:/app/mystik-web/server/data \
  mystik-web
```

## Доступ к приложению

После запуска приложение будет доступно по адресам:
- **Веб-приложение:** http://localhost:8000
- **API:** http://localhost:8000/api/health
- **Документация API:** http://localhost:8000/api/*

## Управление контейнером

```bash
# Просмотр статуса
docker-compose ps

# Просмотр логов
docker-compose logs -f

# Перезапуск
docker-compose restart

# Остановка
docker-compose stop

# Запуск остановленного контейнера
docker-compose start

# Полное удаление
docker-compose down --volumes --rmi all
```

## Конфигурация

### Переменные окружения

Можно настроить через `docker-compose.yml`:

```yaml
environment:
  - NODE_ENV=production
  - PORT=8000
  - VITE_API_URL=http://localhost:8000
```

### Персистентность данных

База данных SQLite сохраняется в volume:
```yaml
volumes:
  - ./server/data:/app/mystik-web/server/data
```

## Особенности Docker образа

### Многоэтапная сборка
- **Этап 1:** Сборка фронтенда с Vite
- **Этап 2:** Подготовка серверных зависимостей
- **Этап 3:** Финальный оптимизированный образ

### Безопасность
- Запуск от непривилегированного пользователя `mystik`
- Минимальный Alpine Linux образ
- Только production зависимости

### Оптимизация
- Кеширование слоев Docker
- Исключение dev файлов через `.dockerignore`
- Сжатый финальный образ

## Troubleshooting

### Проблемы с портами
```bash
# Проверить занятые порты
netstat -tulpn | grep :8000

# Использовать другой порт
docker-compose up -d --scale mystik-web=1 -p 8001:8000
```

### Проблемы с базой данных
```bash
# Пересоздать базу данных
docker-compose down --volumes
docker-compose up --build -d
```

### Просмотр логов
```bash
# Все логи
docker-compose logs

# Последние 100 строк
docker-compose logs --tail=100

# Следить за логами в реальном времени
docker-compose logs -f
```

## Production Deployment

Для продакшена рекомендуется:

1. **Использовать внешнюю базу данных**
2. **Настроить reverse proxy (nginx)**
3. **Добавить SSL сертификаты**
4. **Настроить мониторинг и логирование**
5. **Использовать Docker Swarm или Kubernetes**

### Пример nginx конфигурации

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```