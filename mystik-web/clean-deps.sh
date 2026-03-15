#!/bin/bash

# Скрипт очистки зависимостей для исправления проблем сборки

echo "🧹 Очистка зависимостей Mystik Web..."

# Корневая директория
echo "📁 Очистка корневой директории..."
rm -rf node_modules
rm -f package-lock.json
rm -f bun.lock
rm -f yarn.lock

# Серверная директория
echo "🖥️  Очистка серверной директории..."
cd server
rm -rf node_modules
rm -f package-lock.json
rm -f bun.lock
rm -f yarn.lock
cd ..

# Очистка npm кеша
echo "🗑️  Очистка npm кеша..."
npm cache clean --force

echo "✅ Очистка завершена!"
echo ""
echo "🚀 Для установки зависимостей выполните:"
echo "   npm install --legacy-peer-deps"
echo "   cd server && npm install --legacy-peer-deps"
echo ""
echo "🐳 Для Docker сборки выполните:"
echo "   docker-compose build --no-cache"