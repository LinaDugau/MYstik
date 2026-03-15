import { initDatabase, getDatabase } from './db.js';

console.log('Checking database content...');

try {
  initDatabase();
  const db = getDatabase();
  
  // Проверяем таблицы
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
  console.log('Tables:', tables.map(t => t.name));
  
  // Проверяем данные в таблицах
  try {
    const quizzes = db.prepare('SELECT COUNT(*) as count FROM quizzes').get();
    console.log('Quizzes count:', quizzes.count);
  } catch (e) {
    console.log('Quizzes table error:', e.message);
  }
  
  try {
    const spreads = db.prepare('SELECT COUNT(*) as count FROM tarot_spreads').get();
    console.log('Tarot spreads count:', spreads.count);
  } catch (e) {
    console.log('Tarot spreads table error:', e.message);
  }
  
  try {
    const cards = db.prepare('SELECT COUNT(*) as count FROM tarot_cards').get();
    console.log('Tarot cards count:', cards.count);
  } catch (e) {
    console.log('Tarot cards table error:', e.message);
  }
  
} catch (error) {
  console.error('Database check failed:', error);
}