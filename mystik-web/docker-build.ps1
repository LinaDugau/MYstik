Write-Host "🐳 Сборка Docker образа Mystik Web..." -ForegroundColor Green

# Останавливаем и удаляем существующие контейнеры
Write-Host "🛑 Остановка существующих контейнеров..." -ForegroundColor Yellow
docker-compose down

# Удаляем старый образ
Write-Host "🗑️ Удаление старого образа..." -ForegroundColor Yellow
docker rmi mystik-web-mystik-web 2>$null

# Собираем новый образ
Write-Host "🔨 Сборка нового образа..." -ForegroundColor Yellow
docker-compose build --no-cache

# Запускаем контейнер
Write-Host "🚀 Запуск контейнера..." -ForegroundColor Yellow
docker-compose up -d

# Показываем логи
Write-Host "📋 Логи запуска:" -ForegroundColor Cyan
docker-compose logs -f --tail=50

Write-Host ""
Write-Host "✅ Готово!" -ForegroundColor Green
Write-Host "🌐 Веб-приложение: http://localhost:8000" -ForegroundColor Cyan
Write-Host "🔧 API: http://localhost:8000/api/health" -ForegroundColor Cyan
Write-Host ""
Write-Host "Команды для управления:" -ForegroundColor Magenta
Write-Host "  docker-compose logs -f    # Просмотр логов"
Write-Host "  docker-compose stop       # Остановка"
Write-Host "  docker-compose start      # Запуск"
Write-Host "  docker-compose down       # Полная остановка и удаление"