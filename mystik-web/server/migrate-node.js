import { initDatabase, getDatabase } from './db.js';

console.log('Starting database migration...');

try {
  // Инициализируем базу данных
  initDatabase();
  const db = getDatabase();
  
  console.log('Database initialized successfully');
  console.log('Migration completed!');
  
  process.exit(0);
} catch (error) {
  console.error('Migration failed:', error);
  process.exit(1);
}