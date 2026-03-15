# ⚡ БЫСТРЫЙ ДЕПЛОЙ - ИСПРАВЛЕНИЕ ПРОБЛЕМЫ HTML ВМЕСТО JSON

## 🎯 Проблема
API endpoints возвращают HTML вместо JSON, потому что статические файлы обрабатываются до API роутов.

## ✅ Решение
Создан новый `server/production-server.js` который ГАРАНТИРОВАННО обрабатывает API первыми!

## 🚀 ЧТО ДЕЛАТЬ ПРЯМО СЕЙЧАС:

### 1. Запушьте изменения
```bash
git add .
git commit -m "Fix: Use production-server.js to handle API routes before static files"
git push origin main
```

### 2. На платформе деплоя обновите конфигурацию:

**Команда сборки:**
```bash
npm install --legacy-peer-deps && npx tsc -b && npx vite build && cd server && npm install --legacy-peer-deps && npm run migrate
```

**Команда запуска:**
```bash
npm start
```
(Теперь `npm start` запускает `production-server.js` вместо `index.js`)

**Переменные окружения:**
```
NODE_ENV=production
PORT=8000
VITE_API_URL=https://linadugau-mystik-39d3.twc1.net
```
⚠️ БЕЗ trailing slash!

### 3. ОЧИСТИТЕ кеш сборки
На платформе деплоя найдите опцию "Clear build cache" или "Rebuild from scratch"

### 4. Пересоберите проект
Запустите новую сборку с обновленными командами

### 5. Проверьте результат
```bash
# Должен вернуть JSON, а не HTML!
curl https://linadugau-mystik-39d3.twc1.net/api/health

# Должен вернуть JSON с тестами
curl https://linadugau-mystik-39d3.twc1.net/api/quizzes

# Должен вернуть JSON с раскладами
curl https://linadugau-mystik-39d3.twc1.net/api/tarot/spreads
```

## 🔍 Что изменилось в коде:

### server/package.json
```json
"scripts": {
  "start": "node production-server.js",  // ← ИЗМЕНЕНО!
  "start:old": "node index.js"
}
```

### server/production-server.js (НОВЫЙ ФАЙЛ)
- Простая и понятная структура
- API роуты определены ПЕРВЫМИ
- Catch-all для /api/* возвращает 404 JSON
- Статические файлы ПОСЛЕ всех API роутов
- SPA fallback в конце

## ✅ Ожидаемый результат:

После деплоя в консоли браузера должно быть:
```
API_BASE_URL: https://linadugau-mystik-39d3.twc1.net
VITE_API_URL (clean): https://linadugau-mystik-39d3.twc1.net
DEV mode: false
```

И НЕ должно быть:
- ❌ "Expected JSON but got: <!DOCTYPE html>"
- ❌ "405 Method Not Allowed"
- ❌ CORS errors

## 🆘 Если все еще не работает:

1. Проверьте логи сервера - видите ли вы "🚀 Starting PRODUCTION server..."?
2. Проверьте, что файл `production-server.js` существует на сервере
3. Проверьте, что `npm start` действительно запускает `production-server.js`
4. Попробуйте альтернативную команду запуска: `cd server && node production-server.js`

## 📞 Дополнительная помощь:
- [DEPLOYMENT.md](./DEPLOYMENT.md) - полная документация
- [DEPLOYMENT-CHECKLIST.md](./DEPLOYMENT-CHECKLIST.md) - чеклист
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - решение проблем
