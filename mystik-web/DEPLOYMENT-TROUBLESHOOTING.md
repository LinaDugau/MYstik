# 🚨 УСТРАНЕНИЕ ПРОБЛЕМ РАЗВЕРТЫВАНИЯ

## 🔧 ТЕКУЩИЕ ПРОБЛЕМЫ И РЕШЕНИЯ

### 1. ❌ ОШИБКА: npm install в server директории
**Симптомы:**
- `cd server && npm install --legacy-peer-deps` завершается с ошибкой
- Конфликты зависимостей
- Проблемы с npm кешем

**РЕШЕНИЕ:**
```bash
# Локально очистите все конфликтующие файлы:
cd mystik-web/server
rm -rf node_modules package-lock.json bun.lock yarn.lock
npm cache clean --force
npm install --legacy-peer-deps --no-optional
```

### 2. ❌ ОШИБКА: Health check не проходит
**Симптомы:**
- Контейнер в состоянии "starting"
- Health check timeout
- Сервер не отвечает на порту 8000

**РЕШЕНИЕ:**
1. **Используйте Dockerfile.minimal** (без health check):
```bash
mv Dockerfile Dockerfile.backup
mv Dockerfile.minimal Dockerfile
```

2. **Или увеличьте таймауты в основном Dockerfile:**
```dockerfile
HEALTHCHECK --interval=30s --timeout=30s --start-period=180s --retries=3
```

### 3. ❌ ОШИБКА: API возвращает HTML вместо JSON
**Симптомы:**
- `Expected JSON but got: <!DOCTYPE html>`
- 405 Method Not Allowed
- API endpoints не работают

**РЕШЕНИЕ:** ✅ УЖЕ ИСПРАВЛЕНО в `production-server.js`
- API routes определены ПЕРЕД static files
- Правильная обработка CORS
- Все endpoints возвращают JSON

## 🚀 РЕКОМЕНДУЕМАЯ СТРАТЕГИЯ РАЗВЕРТЫВАНИЯ

### Вариант 1: Минимальный Dockerfile (РЕКОМЕНДУЕТСЯ)
```bash
# Используйте упрощенный Dockerfile
mv Dockerfile.minimal Dockerfile
```

**Преимущества:**
- Нет сложной логики установки
- Отключен health check (избегаем проблем)
- Простой и надежный

### Вариант 2: Основной Dockerfile с исправлениями
Если хотите использовать основной Dockerfile:

1. **Очистите зависимости локально:**
```bash
cd mystik-web
rm -rf node_modules package-lock.json
cd server
rm -rf node_modules package-lock.json bun.lock
cd ..
```

2. **Проверьте сборку локально:**
```bash
docker build -t mystik-test .
docker run -p 8000:8000 mystik-test
```

3. **Проверьте API:**
```bash
curl http://localhost:8000/api/health
```

## 🔍 ДИАГНОСТИКА ПРОБЛЕМ

### Проверка логов контейнера:
```bash
# На платформе смотрите логи развертывания
# Ищите строки с ошибками npm install
```

### Проверка API endpoints:
```bash
# После развертывания проверьте:
curl https://linadugau-mystik-39d3.twc1.net/api/health
curl https://linadugau-mystik-39d3.twc1.net/api/quizzes
curl https://linadugau-mystik-39d3.twc1.net/api/tarot/spreads
```

### Проверка мобильного приложения:
```bash
# Запустите тест API из корневой директории:
node test-mobile-api.js
```

## 📋 НАСТРОЙКИ ПЛАТФОРМЫ

### Обязательные настройки:
- **Путь до директории проекта:** `mystik-web`
- **Dockerfile:** `Dockerfile` (или `Dockerfile.minimal`)
- **Порт:** `8000`
- **Путь проверки состояния:** `/api/health` (только если используете health check)

### Переменные окружения:
```
NODE_ENV=production
PORT=8000
VITE_API_URL=https://linadugau-mystik-39d3.twc1.net
```

### Сетевые настройки:
- **Приватная сеть:** Да
- **IP диапазон:** `192.168.0.0/24`
- **Приватный IP:** `192.168.0.4`

## 🎯 ПЛАН ДЕЙСТВИЙ

### Шаг 1: Подготовка
```bash
cd mystik-web
# Удалите все lock файлы
find . -name "package-lock.json" -delete
find . -name "bun.lock" -delete
find . -name "yarn.lock" -delete
```

### Шаг 2: Выбор Dockerfile
```bash
# Для максимальной надежности:
mv Dockerfile.minimal Dockerfile
```

### Шаг 3: Локальная проверка
```bash
docker build -t mystik-test .
docker run -p 8000:8000 mystik-test
# В другом терминале:
curl http://localhost:8000/api/health
```

### Шаг 4: Развертывание
- Загрузите код в Git
- Настройте переменные окружения
- Запустите сборку на платформе

### Шаг 5: Проверка
```bash
# Проверьте API после развертывания:
curl https://linadugau-mystik-39d3.twc1.net/api/health
# Должен вернуть JSON с "ok": true
```

## ⚠️ ВАЖНЫЕ ЗАМЕЧАНИЯ

1. **НЕ используйте** одновременно `package-lock.json` и `bun.lock`
2. **ВСЕГДА очищайте** npm кеш перед установкой
3. **ИСПОЛЬЗУЙТЕ** `--legacy-peer-deps` для избежания конфликтов
4. **ПРОВЕРЯЙТЕ** что API возвращает JSON, а не HTML
5. **УВЕЛИЧИВАЙТЕ** таймауты health check если нужно

## 🆘 ЕСЛИ ВСЕ ЕЩЕ НЕ РАБОТАЕТ

1. Используйте `Dockerfile.minimal` без health check
2. Проверьте доступность npm registry
3. Убедитесь что нет проблем с сетью
4. Проверьте логи контейнера на платформе
5. Протестируйте локально перед развертыванием