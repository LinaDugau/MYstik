# PowerShell скрипт автоматического развертывания Mystik Web с Docker

Write-Host "🐳 Начинаем развертывание Mystik Web с Docker..." -ForegroundColor Green

# Проверяем наличие Docker
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Docker не установлен. Установите Docker Desktop и повторите попытку." -ForegroundColor Red
    exit 1
}

# Проверяем наличие Docker Compose
if (-not (Get-Command docker-compose -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Docker Compose не установлен. Установите Docker Compose и повторите попытку." -ForegroundColor Red
    exit 1
}

# Переходим в директорию скрипта
Set-Location $PSScriptRoot
Write-Host "📁 Рабочая директория: $(Get-Location)" -ForegroundColor Blue

# Останавливаем существующие контейнеры
Write-Host "🛑 Останавливаем существующие контейнеры..." -ForegroundColor Yellow
docker-compose down 2>$null

# Очищаем старые образы (опционально)
$cleanup = Read-Host "🗑️  Очистить старые Docker образы? (y/N)"
if ($cleanup -eq "y" -or $cleanup -eq "Y") {
    Write-Host "🧹 Очищаем старые образы..." -ForegroundColor Yellow
    docker system prune -f
}

# Собираем и запускаем контейнеры
Write-Host "🔨 Собираем и запускаем контейнеры..." -ForegroundColor Blue
docker-compose up -d --build

# Ждем запуска
Write-Host "⏳ Ждем запуска приложения..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

# Проверяем статус
Write-Host "📊 Проверяем статус контейнеров..." -ForegroundColor Blue
docker-compose ps
# Проверяем health check
Write-Host "🏥 Проверяем health check..." -ForegroundColor Blue
$healthCheckPassed = $false
for ($i = 1; $i -le 10; $i++) {
    try {
        $result = docker exec mystik-web-app curl -f http://localhost:8000/api/health 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Health check прошел успешно!" -ForegroundColor Green
            $healthCheckPassed = $true
            break
        }
    }
    catch {
        # Игнорируем ошибки
    }
    
    Write-Host "⏳ Попытка $i/10: Health check не прошел, ждем..." -ForegroundColor Yellow
    Start-Sleep -Seconds 10
}

if (-not $healthCheckPassed) {
    Write-Host "❌ Health check не прошел после 10 попыток" -ForegroundColor Red
    Write-Host "📋 Логи контейнера:" -ForegroundColor Yellow
    docker-compose logs --tail=50 mystik-web
    exit 1
}

# Проверяем API
Write-Host "🧪 Тестируем API endpoints..." -ForegroundColor Blue
try {
    $healthResponse = docker exec mystik-web-app curl -s http://localhost:8000/api/health
    if ($healthResponse -like '*"ok":true*') {
        Write-Host "✅ API health endpoint работает" -ForegroundColor Green
    } else {
        Write-Host "❌ API health endpoint не работает" -ForegroundColor Red
    }
}
catch {
    Write-Host "❌ Ошибка при проверке API health endpoint" -ForegroundColor Red
}

# Показываем информацию о развертывании
Write-Host ""
Write-Host "🎉 Развертывание завершено!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Информация о развертывании:" -ForegroundColor Cyan
Write-Host "   🌐 Веб-интерфейс: http://localhost:8000" -ForegroundColor White
Write-Host "   🔗 API Health: http://localhost:8000/api/health" -ForegroundColor White
Write-Host "   🐳 Контейнер: mystik-web-app" -ForegroundColor White
Write-Host "   🌍 IP адрес: 192.168.0.4" -ForegroundColor White
Write-Host "   📁 Сеть: mystik-web_mystik-network" -ForegroundColor White
Write-Host ""
Write-Host "📋 Полезные команды:" -ForegroundColor Cyan
Write-Host "   docker-compose logs -f mystik-web    # Просмотр логов" -ForegroundColor Gray
Write-Host "   docker-compose ps                    # Статус контейнеров" -ForegroundColor Gray
Write-Host "   docker-compose down                  # Остановка" -ForegroundColor Gray
Write-Host "   docker exec -it mystik-web-app bash  # Подключение к контейнеру" -ForegroundColor Gray
Write-Host ""
Write-Host "📖 Подробная документация: DOCKER-DEPLOYMENT-CONFIG.md" -ForegroundColor Blue