#!/usr/bin/env node

/**
 * Тест подключения мобильного приложения к API
 */

const API_BASE_URL = 'https://linadugau-mystik-39d3.twc1.net';

console.log('🧪 Тестирование API для мобильного приложения...');
console.log('🌐 API URL:', API_BASE_URL);
console.log('');

async function testEndpoint(endpoint, description) {
  try {
    console.log(`📡 Тестирую ${description}...`);
    const url = `${API_BASE_URL}${endpoint}`;
    console.log(`   URL: ${url}`);
    
    const response = await fetch(url);
    const contentType = response.headers.get('content-type');
    
    console.log(`   Статус: ${response.status}`);
    console.log(`   Content-Type: ${contentType}`);
    
    if (contentType && contentType.includes('application/json')) {
      const data = await response.text();
      const preview = data.length > 100 ? data.substring(0, 100) + '...' : data;
      console.log(`   Ответ: ${preview}`);
      
      try {
        const json = JSON.parse(data);
        if (json.ok) {
          console.log('   ✅ Успешно!');
        } else {
          console.log(`   ⚠️  Ошибка API: ${json.error}`);
        }
      } catch (e) {
        console.log('   ❌ Не удалось распарсить JSON');
      }
    } else {
      const text = await response.text();
      const preview = text.length > 100 ? text.substring(0, 100) + '...' : text;
      console.log(`   ❌ Получен HTML вместо JSON: ${preview}`);
    }
    
    console.log('');
    return response.ok && contentType && contentType.includes('application/json');
  } catch (error) {
    console.log(`   ❌ Ошибка: ${error.message}`);
    console.log('');
    return false;
  }
}

async function runTests() {
  const tests = [
    ['/api/health', 'Health Check'],
    ['/api/quizzes', 'Список тестов'],
    ['/api/tarot/spreads', 'Расклады таро'],
    ['/api/tarot/cards', 'Карты таро'],
  ];
  
  let passed = 0;
  let total = tests.length;
  
  for (const [endpoint, description] of tests) {
    const success = await testEndpoint(endpoint, description);
    if (success) passed++;
  }
  
  console.log('='.repeat(50));
  console.log(`📊 Результат: ${passed}/${total} тестов прошли успешно`);
  
  if (passed === total) {
    console.log('🎉 Все тесты прошли! Мобильное приложение готово к работе.');
  } else {
    console.log('⚠️  Некоторые тесты не прошли. Проверьте деплой сервера.');
    console.log('');
    console.log('💡 Возможные проблемы:');
    console.log('   - Сервер не запущен или недоступен');
    console.log('   - API endpoints возвращают HTML вместо JSON');
    console.log('   - CORS не настроен для мобильного приложения');
    console.log('');
    console.log('📖 См. DEPLOYMENT.md для решения проблем');
  }
}

runTests().catch(console.error);