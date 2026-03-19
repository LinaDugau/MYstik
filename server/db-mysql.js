import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Конфигурация MySQL - вы можете изменить эти параметры
const MYSQL_CONFIG = {
  host: process.env.MYSQL_HOST || 'localhost',
  port: process.env.MYSQL_PORT || 3306,
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'mystik',
  charset: 'utf8mb4'
};

let pool = null;

function normalizeDateTimeForMySQL(value) {
  if (typeof value !== 'string') return value;

  // 2026-03-19T20:21:02.658Z -> 2026-03-19 20:21:02
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/.test(value)) {
    return value.replace('T', ' ').replace(/\.\d+Z$/, '').replace('Z', '');
  }

  return value;
}

function normalizeParams(params = []) {
  return params.map(normalizeDateTimeForMySQL);
}

async function initSchema(connection) {
  const schema = `
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(255) PRIMARY KEY,
      email VARCHAR(255) NOT NULL UNIQUE,
      username VARCHAR(255) NOT NULL UNIQUE,
      name VARCHAR(255) NOT NULL,
      birth_date DATE,
      password_hash VARCHAR(255) NOT NULL,
      is_guest TINYINT(1) NOT NULL DEFAULT 0,
      is_premium TINYINT(1) NOT NULL DEFAULT 0,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      last_login TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE INDEX idx_users_email ON users(email);
    CREATE INDEX idx_users_username ON users(username);

    CREATE TABLE IF NOT EXISTS quizzes (
      id VARCHAR(255) PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      is_premium TINYINT(1) NOT NULL DEFAULT 0,
      questions JSON NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS quiz_results (
      id VARCHAR(255) PRIMARY KEY,
      user_id VARCHAR(255) NOT NULL,
      quiz_id VARCHAR(255) NOT NULL,
      answers JSON NOT NULL,
      result JSON NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE,
      UNIQUE KEY unique_user_quiz (user_id, quiz_id)
    );
    
    CREATE INDEX idx_quiz_results_user ON quiz_results(user_id);
    CREATE INDEX idx_quiz_results_quiz ON quiz_results(quiz_id);

    CREATE TABLE IF NOT EXISTS tarot_spreads (
      id VARCHAR(255) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      card_count INT NOT NULL,
      positions JSON NOT NULL,
      is_premium TINYINT(1) NOT NULL DEFAULT 0,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS tarot_cards (
      id VARCHAR(255) PRIMARY KEY,
      number VARCHAR(50) NOT NULL,
      name VARCHAR(255) NOT NULL,
      symbol VARCHAR(255) NOT NULL,
      meaning TEXT NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS tarot_interpretations (
      id VARCHAR(255) PRIMARY KEY,
      card_id VARCHAR(255) NOT NULL,
      spread_id VARCHAR(255) NOT NULL,
      position_index INT NOT NULL,
      interpretation TEXT NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (card_id) REFERENCES tarot_cards(id) ON DELETE CASCADE,
      FOREIGN KEY (spread_id) REFERENCES tarot_spreads(id) ON DELETE CASCADE,
      UNIQUE KEY unique_interpretation (card_id, spread_id, position_index)
    );
    
    CREATE INDEX idx_tarot_interpretations_card ON tarot_interpretations(card_id);
    CREATE INDEX idx_tarot_interpretations_spread ON tarot_interpretations(spread_id);

    CREATE TABLE IF NOT EXISTS tarot_readings (
      id VARCHAR(255) PRIMARY KEY,
      user_id VARCHAR(255) NOT NULL,
      spread_id VARCHAR(255) NOT NULL,
      cards JSON NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (spread_id) REFERENCES tarot_spreads(id) ON DELETE CASCADE
    );
    
    CREATE INDEX idx_tarot_readings_user ON tarot_readings(user_id);
    CREATE INDEX idx_tarot_readings_spread ON tarot_readings(spread_id);
  `;

  // Разделяем schema на отдельные запросы и выполняем их
  const statements = schema.split(';').filter(stmt => stmt.trim().length > 0);
  
  for (const statement of statements) {
    try {
      const cleanStatement = statement.trim();
      if (cleanStatement.startsWith('CREATE INDEX') || cleanStatement.startsWith('CREATE UNIQUE INDEX')) {
        // Для индексов используем безопасный подход - сначала проверяем существование
        const indexName = cleanStatement.match(/CREATE\s+(?:UNIQUE\s+)?INDEX\s+(\w+)/i)?.[1];
        if (indexName) {
          try {
            await connection.execute(`SHOW INDEX FROM ${cleanStatement.match(/ON\s+(\w+)/i)?.[1]} WHERE Key_name = ?`, [indexName]);
            // Индекс уже существует, пропускаем
            continue;
          } catch (showError) {
            // Индекс не существует, создаем его
            await connection.execute(cleanStatement);
          }
        }
      } else if (cleanStatement.length > 0) {
        await connection.execute(cleanStatement);
      }
    } catch (error) {
      // Игнорируем ошибки если таблица или индекс уже существует
      if (!error.message.includes('already exists') && !error.message.includes('Duplicate key name') && !error.message.includes('Table') && !error.message.includes('Key name')) {
        console.error('Schema error:', error.message);
        throw error;
      }
    }
  }
}

async function initDatabase() {
  if (pool) return pool;

  try {
    // Создаем пул соединений
    pool = mysql.createPool({
      ...MYSQL_CONFIG,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    // Проверяем соединение и инициализируем схему
    const connection = await pool.getConnection();
    await initSchema(connection);
    connection.release();

    console.log('MySQL database initialized successfully');
    return pool;
  } catch (error) {
    console.error('Failed to initialize MySQL database:', error);
    throw error;
  }
}

function getDatabase() {
  if (!pool) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  // Совместимость с текущим API-кодом (db.prepare(...).get/all/run).
  return {
    execute: (sql, params = []) => pool.execute(sql, normalizeParams(params)),
    end: () => pool.end(),
    prepare: (sql) => ({
      get: async (...params) => {
        const [rows] = await pool.execute(sql, normalizeParams(params));
        return rows[0];
      },
      all: async (...params) => {
        const [rows] = await pool.execute(sql, normalizeParams(params));
        return rows;
      },
      run: async (...params) => {
        await pool.execute(sql, normalizeParams(params));
      }
    })
  };
}

export { initDatabase, getDatabase, MYSQL_CONFIG };
