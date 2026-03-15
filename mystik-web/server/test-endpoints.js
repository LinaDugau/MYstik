import { initDatabase, getDatabase } from './db.js';

console.log('Testing database and endpoints...');

try {
  // Инициализируем базу данных
  initDatabase();
  const db = getDatabase();
  
  console.log('✅ Database initialized');
  
  // Тестируем запросы к базе данных
  console.log('\n--- Testing database queries ---');
  
  try {
    const quizzes = db.prepare('SELECT id, title, description, is_premium FROM quizzes').all();
    console.log('✅ Quizzes query successful:', quizzes.length, 'records');
    console.log('First quiz:', quizzes[0]);
  } catch (err) {
    console.error('❌ Quizzes query failed:', err.message);
  }
  
  try {
    const spreads = db.prepare('SELECT * FROM tarot_spreads ORDER BY card_count ASC').all();
    console.log('✅ Tarot spreads query successful:', spreads.length, 'records');
    console.log('First spread:', spreads[0]);
  } catch (err) {
    console.error('❌ Tarot spreads query failed:', err.message);
  }
  
  try {
    const cards = db.prepare('SELECT * FROM tarot_cards ORDER BY id ASC').all();
    console.log('✅ Tarot cards query successful:', cards.length, 'records');
    console.log('First card:', cards[0]);
  } catch (err) {
    console.error('❌ Tarot cards query failed:', err.message);
  }
  
  console.log('\n--- Database test completed ---');
  
} catch (error) {
  console.error('❌ Database test failed:', error);
}