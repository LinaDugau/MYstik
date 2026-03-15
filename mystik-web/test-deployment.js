#!/usr/bin/env node

// Скрипт для проверки развертывания API

const API_BASE_URL = 'https://linadugau-mystik-39d3.twc1.net';

async function testEndpoint(endpoint, description) {
  try {
    console.log(`\n🔍 Testing ${description}...`);
    console.log(`URL: ${API_BASE_URL}${endpoint}`);
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`Status: ${response.status} ${response.statusText}`);
    console.log(`Content-Type: ${response.headers.get('content-type')}`);
    
    const text = await response.text();
    
    // Проверяем что получили JSON, а не HTML
    if (text.startsWith('<!DOCTYPE html>') || text.startsWith('<html')) {
      console.log('❌ ERROR: Received HTML instead of JSON');
      console.log('First 200 chars:', text.substring(0, 200));
      return false;
    }
    
    try {
      const data = JSON.parse(text);
      console.log('✅ SUCCESS: Valid JSON response');
      console.log('Response preview:', JSON.stringify(data, null, 2).substring(0, 300));
      return true;
    } catch (parseError) {
      console.log('❌ ERROR: Invalid JSON');
      console.log('Response text:', text.substring(0, 200));
      return false;
    }
    
  } catch (error) {
    console.log(`❌ ERROR: ${error.message}`);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Testing Mystik Web API Deployment');
  console.log('=====================================');
  
  const tests = [
    ['/api/health', 'Health Check'],
    ['/api/quizzes', 'Quizzes List'],
    ['/api/tarot/spreads', 'Tarot Spreads'],
    ['/api/tarot/cards', 'Tarot Cards']
  ];
  
  let passed = 0;
  let total = tests.length;
  
  for (const [endpoint, description] of tests) {
    const success = await testEndpoint(endpoint, description);
    if (success) passed++;
    
    // Небольшая пауза между запросами
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n📊 TEST RESULTS');
  console.log('================');
  console.log(`Passed: ${passed}/${total}`);
  console.log(`Success Rate: ${Math.round((passed/total) * 100)}%`);
  
  if (passed === total) {
    console.log('🎉 ALL TESTS PASSED! API is working correctly.');
  } else {
    console.log('⚠️  Some tests failed. Check the API deployment.');
  }
  
  console.log('\n📱 Mobile App Test:');
  console.log('Run: node test-mobile-api.js');
}

// Запуск тестов
runTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});