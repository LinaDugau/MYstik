#!/bin/bash

# Скрипт автоматического развертывания Mystik Web с Docker

set -e  # Остановить выполнение при ошибке

echo "🐳 Начинаем развертывание Mystik Web с Docker..."

# Проверяем наличие Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker не установлен. Установите Docker и повторите попытку."
    exit 1
fi

# Проверяем наличие Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose не установлен. Установите Docker Compose и повторите попытку."
    exit 1
fi

# Переходим в директорию проекта
cd "$(dirname "$0")"

echo "📁 Рабочая директория: $(pwd)"

# Останавливаем существующие контейнеры
echo "🛑 Останавливаем существующие контейнеры..."
docker-compose down || true

# Очищаем старые образы (опционально)
read -p "🗑️  Очистить старые Docker образы? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🧹 Очищаем старые образы..."
    docker system prune -f
fi

# Собираем и запускаем контейнеры
echo "🔨 Собираем и запускаем контейнеры..."
docker-compose up -d --build

# Ждем запуска
echo "⏳ Ждем запуска приложения..."
sleep 30

# Проверяем статус
echo "📊 Проверяем статус контейнеров..."
docker-compose ps

# Проверяем health check
echo "🏥 Проверяем health check..."
for i in {1..10}; do
    if docker exec mystik-web-app curl -f http://localhost:8000/api/health > /dev/null 2>&1; then
        echo "✅ Health check прошел успешно!"
        break
    else
        echo "⏳ Попытка $i/10: Health check не прошел, ждем..."
        sleep 10
    fi
    
    if [ $i -eq 10 ]; then
        echo "❌ Health check не прошел после 10 попыток"
        echo "📋 Логи контейнера:"
        docker-compose logs --tail=50 mystik-web
        exit 1
    fi
done

# Проверяем API
echo "🧪 Тестируем API endpoints..."
if docker exec mystik-web-app curl -s http://localhost:8000/api/health | grep -q '"ok":true'; then
    echo "✅ API health endpoint работает"
else
    echo "❌ API health endpoint не работает"
    docker-compose logs --tail=20 mystik-web
fi

if docker exec mystik-web-app curl -s http://localhost:8000/api/quizzes | grep -q '"ok":true'; then
    echo "✅ API quizzes endpoint работает"
else
    echo "⚠️  API quizzes endpoint может не работать (проверьте базу данных)"
fi

# Показываем информацию о развертывании
echo ""
echo "🎉 Развертывание завершено!"
echo ""
echo "📊 Информация о развертывании:"
echo "   🌐 Веб-интерфейс: http://localhost:8000"
echo "   🔗 API Health: http://localhost:8000/api/health"
echo "   🐳 Контейнер: mystik-web-app"
echo "   🌍 IP адрес: 192.168.0.4"
echo "   📁 Сеть: mystik-web_mystik-network"
echo ""
echo "📋 Полезные команды:"
echo "   docker-compose logs -f mystik-web    # Просмотр логов"
echo "   docker-compose ps                    # Статус контейнеров"
echo "   docker-compose down                  # Остановка"
echo "   docker exec -it mystik-web-app bash  # Подключение к контейнеру"
echo ""
echo "📖 Подробная документация: DOCKER-DEPLOYMENT-CONFIG.md"