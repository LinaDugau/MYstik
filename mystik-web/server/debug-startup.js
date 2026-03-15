#!/usr/bin/env node

/**
 * Скрипт диагностики запуска сервера
 */

import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Диагностика запуска сервера...\n');

// 1. Проверка окружения
console.log('1️⃣ Проверка окружения:');
console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'не установлена'}`);
console.log(`   PORT: ${process.env.PORT || '3001 (по умолчанию)'}`);
console.log(`   Рабочая директория: ${process.cwd()}`);
console.log(`   __dirname: ${__dirname}`);
console.log('');

// 2. Проверка файлов
console.log('2️⃣ Проверка файлов:');
const requiredFiles = [
  'index.js',
  'production-server.js',
  'package.json',
  'db.js',
  'data/mystic.db'
];

for (const file of requiredFiles) {
  const filePath = path.join(__dirname, file);
  const exists = fs.existsSync(filePath);
  console.log(`   ${exists ? '✅' : '❌'} ${file}`);
  
  if (exists && file.endsWith('.db')) {
    const stats = fs.statSync(filePath);
    console.log(`      Размер: ${Math.round(stats.size / 1024)} KB`);
  }
}
console.log('');

// 3. Проверка package.json
console.log('3️⃣ Проверка package.json:');
try {
  const packagePath = path.join(__dirname, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
  console.log(`   Название: ${packageJson.name}`);
  console.log(`   Версия: ${packageJson.version}`);
  console.log(`   Start script: ${packageJson.scripts?.start || 'не найден'}`);
  
  // Проверяем зависимости
  const deps = Object.keys(packageJson.dependencies || {});
  console.log(`   Зависимости: ${deps.length} (${deps.slice(0, 3).join(', ')}...)`);
} catch (error) {
  console.log(`   ❌ Ошибка чтения package.json: ${error.message}`);
}
console.log('');

// 4. Проверка базы данных
console.log('4️⃣ Проверка базы данных:');
try {
  const { initDatabase, getDatabase } = await import('./db.js');
  initDatabase();
  const db = getDatabase();
  
  // Проверяем таблицы
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
  console.log(`   Таблицы: ${tables.map(t => t.name).join(', ')}`);
  
  // Проверяем данные
  const quizzes = db.prepare('SELECT COUNT(*) as count FROM quizzes').get();
  const spreads = db.prepare('SELECT COUNT(*) as count FROM tarot_spreads').get();
  const cards = db.prepare('SELECT COUNT(*) as count FROM tarot_cards').get();
  
  console.log(`   Тесты: ${quizzes.count}`);
  console.log(`   Расклады таро: ${spreads.count}`);
  console.log(`   Карты таро: ${cards.count}`);
} catch (error) {
  console.log(`   ❌ Ошибка базы данных: ${error.message}`);
}
console.log('');

// 5. Проверка портов
console.log('5️⃣ Проверка портов:');
const port = process.env.PORT || 3001;
console.log(`   Порт для запуска: ${port}`);

// Проверяем доступность порта
import { createServer } from 'http';

// Тестируем привязку к 0.0.0.0
const testServer = createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Test server OK');
});

console.log('   Тестируем привязку к 0.0.0.0...');
testServer.listen(port, '0.0.0.0', (error) => {
  if (error) {
    console.log(`   ❌ Не удается привязаться к 0.0.0.0:${port}: ${error.message}`);
  } else {
    console.log(`   ✅ Порт ${port} доступен на 0.0.0.0`);
    
    // Тестируем HTTP запрос
    import('http').then(({ default: http }) => {
      const req = http.request({
        hostname: 'localhost',
        port: port,
        path: '/',
        method: 'GET'
      }, (res) => {
        console.log(`   ✅ HTTP запрос успешен: ${res.statusCode}`);
        testServer.close();
        
        console.log('\n' + '='.repeat(50));
        console.log('📊 Диагностика завершена');
        console.log('💡 Для запуска сервера используйте: npm start');
        console.log('🔍 Сервер должен слушать на 0.0.0.0:' + port);
      });
      
      req.on('error', (err) => {
        console.log(`   ❌ HTTP запрос неудачен: ${err.message}`);
        testServer.close();
      });
      
      req.end();
    });
  }
});

// Обработка ошибок
process.on('uncaughtException', (error) => {
  console.error('❌ Критическая ошибка:', error.message);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('❌ Необработанное отклонение:', reason);
  process.exit(1);
});