#!/bin/bash

echo "🐳 Сборка Docker образа Mystik Web..."

# Останавливаем и удаляем существующие контейнеры
echo "🛑 Остановка существующих контейнеров..."
docker-compose down

# Удаляем старый образ
echo "🗑️ Удаление старого образа..."
docker rmi mystik-web-mystik-web 2>/dev/null || true

# Собираем новый образ
echo "🔨 Сборка нового образа..."
docker-compose build --no-cache

# Запускаем контейнер
echo "🚀 Запуск контейнера..."
docker-compose up -d

# Показываем логи
echo "📋 Логи запуска:"
docker-compose logs -f --tail=50

echo ""
echo "✅ Готово!"
echo "🌐 Веб-приложение: http://localhost:8000"
echo "🔧 API: http://localhost:8000/api/health"
echo ""
echo "Команды для управления:"
echo "  docker-compose logs -f    # Просмотр логов"
echo "  docker-compose stop       # Остановка"
echo "  docker-compose start      # Запуск"
echo "  docker-compose down       # Полная остановка и удаление"