#!/usr/bin/env node

/**
 * Startup Verification Script
 * Проверяет правильность конфигурации сервера перед запуском
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Проверка конфигурации сервера...\n');

let hasErrors = false;

// 1. Проверка существования index.js
console.log('1️⃣ Проверка файла index.js...');
const indexPath = path.join(__dirname, 'index.js');
if (fs.existsSync(indexPath)) {
  console.log('   ✅ index.js найден');
  
  // Проверяем содержимое файла
  const content = fs.readFileSync(indexPath, 'utf-8');
  
  // Проверяем порядок middleware
  const staticFilesIndex = content.indexOf('express.static(distPath');
  const apiRoutesIndex = content.lastIndexOf('app.get(\'/api/');
  
  if (staticFilesIndex > 0 && apiRoutesIndex > 0) {
    if (staticFilesIndex > apiRoutesIndex) {
      console.log('   ✅ Статические файлы ПОСЛЕ API роутов (правильно)');
    } else {
      console.log('   ❌ ОШИБКА: Статические файлы ДО API роутов!');
      console.log('   📝 Это приведет к возврату HTML вместо JSON');
      hasErrors = true;
    }
  }
  
  // Проверяем наличие CORS
  if (content.includes('app.use(cors(')) {
    console.log('   ✅ CORS настроен');
  } else {
    console.log('   ⚠️  CORS не найден');
  }
  
} else {
  console.log('   ❌ index.js НЕ найден!');
  hasErrors = true;
}

// 2. Проверка базы данных
console.log('\n2️⃣ Проверка базы данных...');
const dbPath = path.join(__dirname, 'data', 'mystic.db');
if (fs.existsSync(dbPath)) {
  const stats = fs.statSync(dbPath);
  console.log(`   ✅ База данных найдена (${Math.round(stats.size / 1024)} KB)`);
} else {
  console.log('   ⚠️  База данных не найдена (будет создана при миграции)');
}

// 3. Проверка dist директории
console.log('\n3️⃣ Проверка собранного фронтенда...');
const distPath = path.join(__dirname, '..', 'dist');
if (fs.existsSync(distPath)) {
  const indexHtmlPath = path.join(distPath, 'index.html');
  if (fs.existsSync(indexHtmlPath)) {
    console.log('   ✅ Фронтенд собран (dist/index.html найден)');
  } else {
    console.log('   ❌ dist/index.html НЕ найден!');
    hasErrors = true;
  }
} else {
  console.log('   ❌ Директория dist НЕ найдена!');
  console.log('   📝 Запустите: npm run build');
  hasErrors = true;
}

// 4. Проверка зависимостей
console.log('\n4️⃣ Проверка зависимостей...');
const nodeModulesPath = path.join(__dirname, 'node_modules');
if (fs.existsSync(nodeModulesPath)) {
  console.log('   ✅ node_modules найден');
  
  // Проверяем ключевые зависимости
  const requiredDeps = ['express', 'cors', 'better-sqlite3', 'bcryptjs', 'cheerio'];
  for (const dep of requiredDeps) {
    const depPath = path.join(nodeModulesPath, dep);
    if (fs.existsSync(depPath)) {
      console.log(`   ✅ ${dep} установлен`);
    } else {
      console.log(`   ❌ ${dep} НЕ установлен!`);
      hasErrors = true;
    }
  }
} else {
  console.log('   ❌ node_modules НЕ найден!');
  console.log('   📝 Запустите: npm install');
  hasErrors = true;
}

// 5. Проверка переменных окружения
console.log('\n5️⃣ Проверка переменных окружения...');
console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'не установлена'}`);
console.log(`   PORT: ${process.env.PORT || '3001 (по умолчанию)'}`);

// Итоговый результат
console.log('\n' + '='.repeat(50));
if (hasErrors) {
  console.log('❌ ОБНАРУЖЕНЫ ОШИБКИ! Исправьте их перед запуском.');
  process.exit(1);
} else {
  console.log('✅ Все проверки пройдены! Сервер готов к запуску.');
  console.log('\n📝 Для запуска используйте: npm start');
  process.exit(0);
}
