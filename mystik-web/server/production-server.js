import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

console.log('🚀 Starting PRODUCTION server...');
console.log('📁 Working directory:', process.cwd());
console.log('🌍 NODE_ENV:', process.env.NODE_ENV);
console.log('🔌 PORT:', PORT);

// CORS - MUST BE FIRST
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://linadugau-mystik-39d3.twc1.net',
  /^https:\/\/.*\.exp\.direct$/,
  /^https:\/\/.*\.ngrok\.io$/,
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const isAllowed = allowedOrigins.some(allowed => 
      typeof allowed === 'string' ? origin === allowed : allowed.test(origin)
    );
    callback(isAllowed ? null : new Error('Not allowed by CORS'), isAllowed);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// ============================================
// API ROUTES - MUST BE BEFORE STATIC FILES!
// ============================================

// Health check
app.get('/api/health', (req, res) => {
  console.log('✅ API: Health check');
  res.json({ 
    ok: true, 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    port: PORT
  });
});

// Import and use main server routes - REMOVED to avoid conflicts
// The API routes are defined directly in this file to ensure proper order

// Quizzes endpoint
app.get('/api/quizzes', async (req, res) => {
  try {
    console.log('✅ API: Get quizzes');
    const { getDatabase } = await import('./db.js');
    const db = getDatabase();
    const quizzes = db.prepare('SELECT id, title, description, is_premium FROM quizzes').all();
    
    const formattedQuizzes = quizzes.reduce((acc, quiz) => {
      acc[quiz.id] = {
        id: quiz.id,
        title: quiz.title,
        description: quiz.description,
        isPremium: quiz.is_premium === 1
      };
      return acc;
    }, {});
    
    res.json({ ok: true, quizzes: formattedQuizzes });
  } catch (err) {
    console.error('❌ Error getting quizzes:', err);
    res.status(500).json({ ok: false, error: 'Server error' });
  }
});

// Tarot spreads endpoint
app.get('/api/tarot/spreads', async (req, res) => {
  try {
    console.log('✅ API: Get tarot spreads');
    const { getDatabase } = await import('./db.js');
    const db = getDatabase();
    const spreads = db.prepare('SELECT * FROM tarot_spreads ORDER BY card_count ASC').all();
    
    const formattedSpreads = spreads.map(spread => ({
      id: spread.id,
      name: spread.name,
      description: spread.description,
      cardCount: spread.card_count,
      positions: JSON.parse(spread.positions),
      isPremium: spread.is_premium === 1
    }));
    
    res.json({ ok: true, spreads: formattedSpreads });
  } catch (err) {
    console.error('❌ Error getting tarot spreads:', err);
    res.status(500).json({ ok: false, error: 'Server error' });
  }
});

// Tarot cards endpoint
app.get('/api/tarot/cards', async (req, res) => {
  try {
    console.log('✅ API: Get tarot cards');
    const { getDatabase } = await import('./db.js');
    const db = getDatabase();
    const cards = db.prepare('SELECT * FROM tarot_cards ORDER BY id ASC').all();
    res.json({ ok: true, cards });
  } catch (err) {
    console.error('❌ Error getting tarot cards:', err);
    res.status(500).json({ ok: false, error: 'Server error' });
  }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
  try {
    console.log('✅ API: Login attempt');
    const { login, password } = req.body || {};
    
    if (!login || !password) {
      return res.status(400).json({ ok: false, error: 'Missing credentials' });
    }

    const bcrypt = await import('bcryptjs');
    const { getDatabase } = await import('./db.js');
    const db = getDatabase();
    
    const trimmedLogin = login.trim().toLowerCase();
    const row = db.prepare(
      'SELECT id, email, username, name, birth_date, password_hash FROM users WHERE (email = ? OR username = ?) AND is_guest = 0'
    ).get(trimmedLogin, trimmedLogin);

    if (!row) {
      return res.status(401).json({ ok: false, error: 'Invalid credentials' });
    }

    const match = bcrypt.compareSync(password, row.password_hash);
    if (!match) {
      return res.status(401).json({ ok: false, error: 'Invalid credentials' });
    }

    const now = new Date().toISOString();
    db.prepare('UPDATE users SET last_login = ? WHERE id = ?').run(now, row.id);

    res.json({ 
      ok: true, 
      user: { 
        id: row.id, 
        email: row.email, 
        username: row.username,
        name: row.name,
        birthDate: row.birth_date
      } 
    });
  } catch (err) {
    console.error('❌ Login error:', err);
    res.status(500).json({ ok: false, error: 'Server error' });
  }
});

// Register endpoint
app.post('/api/register', async (req, res) => {
  try {
    console.log('✅ API: Register attempt');
    const { email, username, password, name, birthDate } = req.body || {};
    
    if (!email || !username || !password || !name) {
      return res.status(400).json({ ok: false, error: 'Missing required fields' });
    }

    const bcrypt = await import('bcryptjs');
    const { getDatabase } = await import('./db.js');
    const db = getDatabase();
    
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedUsername = username.trim();
    const trimmedName = name.trim();

    const existingEmail = db.prepare('SELECT id FROM users WHERE email = ? AND is_guest = 0').get(trimmedEmail);
    if (existingEmail) {
      return res.status(409).json({ ok: false, error: 'Email already registered' });
    }

    const existingUsername = db.prepare('SELECT id FROM users WHERE username = ? AND is_guest = 0').get(trimmedUsername);
    if (existingUsername) {
      return res.status(409).json({ ok: false, error: 'Username already taken' });
    }

    const passwordHash = bcrypt.hashSync(password, 10);
    const id = `user_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
    const now = new Date().toISOString();

    db.prepare(
      `INSERT INTO users (id, email, username, name, birth_date, password_hash, is_guest, created_at, last_login)
       VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?)`
    ).run(id, trimmedEmail, trimmedUsername, trimmedName, birthDate || null, passwordHash, now, now);

    res.json({ 
      ok: true, 
      user: { 
        id, 
        email: trimmedEmail, 
        username: trimmedUsername,
        name: trimmedName,
        birthDate: birthDate || null
      } 
    });
  } catch (err) {
    console.error('❌ Register error:', err);
    res.status(500).json({ ok: false, error: 'Server error' });
  }
});

// User profile endpoints
app.get('/api/user/:id', async (req, res) => {
  try {
    console.log('✅ API: Get user profile');
    const { id } = req.params;
    if (!id) return res.status(400).json({ ok: false, error: 'Missing user ID' });

    const { getDatabase } = await import('./db.js');
    const db = getDatabase();
    const row = db.prepare('SELECT id, email, username, name, birth_date FROM users WHERE id = ? AND is_guest = 0').get(id);
    
    if (!row) {
      return res.status(404).json({ ok: false, error: 'User not found' });
    }
    
    res.json({ 
      ok: true, 
      user: { 
        id: row.id, 
        email: row.email, 
        username: row.username,
        name: row.name,
        birthDate: row.birth_date
      } 
    });
  } catch (err) {
    console.error('❌ Get user error:', err);
    res.status(500).json({ ok: false, error: 'Server error' });
  }
});

app.put('/api/user/:id', async (req, res) => {
  try {
    console.log('✅ API: Update user profile');
    const { id } = req.params;
    const { name, birthDate } = req.body || {};

    if (!id) return res.status(400).json({ ok: false, error: 'Missing user ID' });

    const { getDatabase } = await import('./db.js');
    const db = getDatabase();
    const user = db.prepare('SELECT id FROM users WHERE id = ? AND is_guest = 0').get(id);
    
    if (!user) {
      return res.status(404).json({ ok: false, error: 'User not found' });
    }

    if (name !== undefined) {
      db.prepare('UPDATE users SET name = ? WHERE id = ?').run(name.trim(), id);
    }

    if (birthDate !== undefined) {
      db.prepare('UPDATE users SET birth_date = ? WHERE id = ?').run(birthDate || null, id);
    }

    const updated = db.prepare('SELECT id, email, username, name, birth_date FROM users WHERE id = ?').get(id);
    res.json({ 
      ok: true, 
      user: { 
        id: updated.id, 
        email: updated.email, 
        username: updated.username,
        name: updated.name,
        birthDate: updated.birth_date
      } 
    });
  } catch (err) {
    console.error('❌ Update user error:', err);
    res.status(500).json({ ok: false, error: 'Server error' });
  }
});

app.post('/api/user/:id/change-password', async (req, res) => {
  try {
    console.log('✅ API: Change password');
    const { id } = req.params;
    const { oldPassword, newPassword, confirmPassword } = req.body || {};

    if (!id) return res.status(400).json({ ok: false, error: 'Missing user ID' });

    if (!oldPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ ok: false, error: 'All fields required' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ ok: false, error: 'New passwords do not match' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ ok: false, error: 'Password must be at least 6 characters' });
    }

    const bcrypt = await import('bcryptjs');
    const { getDatabase } = await import('./db.js');
    const db = getDatabase();
    const user = db.prepare('SELECT id, password_hash FROM users WHERE id = ? AND is_guest = 0').get(id);
    
    if (!user) {
      return res.status(404).json({ ok: false, error: 'User not found' });
    }

    const match = bcrypt.compareSync(oldPassword, user.password_hash);
    if (!match) {
      return res.status(401).json({ ok: false, error: 'Invalid old password' });
    }

    const newPasswordHash = bcrypt.hashSync(newPassword, 10);
    db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(newPasswordHash, id);

    res.json({ ok: true, message: 'Password changed successfully' });
  } catch (err) {
    console.error('❌ Change password error:', err);
    res.status(500).json({ ok: false, error: 'Server error' });
  }
});

// Quiz endpoints
app.get('/api/quiz/:id', async (req, res) => {
  try {
    console.log('✅ API: Get quiz');
    const { id } = req.params;
    if (!id) return res.status(400).json({ ok: false, error: 'Missing quiz ID' });

    const { getDatabase } = await import('./db.js');
    const db = getDatabase();
    const quiz = db.prepare('SELECT * FROM quizzes WHERE id = ?').get(id);
    
    if (!quiz) {
      return res.status(404).json({ ok: false, error: 'Quiz not found' });
    }

    res.json({ 
      ok: true, 
      quiz: {
        id: quiz.id,
        title: quiz.title,
        description: quiz.description,
        isPremium: quiz.is_premium === 1,
        questions: JSON.parse(quiz.questions)
      }
    });
  } catch (err) {
    console.error('❌ Get quiz error:', err);
    res.status(500).json({ ok: false, error: 'Server error' });
  }
});

app.get('/api/user/:userId/quiz/:quizId/result', async (req, res) => {
  try {
    console.log('✅ API: Get quiz result');
    const { userId, quizId } = req.params;
    if (!userId || !quizId) {
      return res.status(400).json({ ok: false, error: 'Missing userId or quizId' });
    }

    const { getDatabase } = await import('./db.js');
    const db = getDatabase();
    const result = db.prepare('SELECT * FROM quiz_results WHERE user_id = ? AND quiz_id = ?').get(userId, quizId);
    
    if (!result) {
      return res.status(404).json({ ok: false, error: 'Result not found' });
    }

    res.json({ 
      ok: true, 
      result: {
        id: result.id,
        userId: result.user_id,
        quizId: result.quiz_id,
        answers: JSON.parse(result.answers),
        result: JSON.parse(result.result),
        createdAt: result.created_at,
        updatedAt: result.updated_at
      }
    });
  } catch (err) {
    console.error('❌ Get quiz result error:', err);
    res.status(500).json({ ok: false, error: 'Server error' });
  }
});

app.post('/api/user/:userId/quiz/:quizId/result', async (req, res) => {
  try {
    console.log('✅ API: Save quiz result');
    const { userId, quizId } = req.params;
    const { answers, result } = req.body || {};

    if (!userId || !quizId) {
      return res.status(400).json({ ok: false, error: 'Missing userId or quizId' });
    }

    if (!answers || !result) {
      return res.status(400).json({ ok: false, error: 'Missing answers or result data' });
    }

    const { getDatabase } = await import('./db.js');
    const db = getDatabase();
    
    const user = db.prepare('SELECT id FROM users WHERE id = ?').get(userId);
    if (!user) {
      return res.status(404).json({ ok: false, error: 'User not found' });
    }

    const quiz = db.prepare('SELECT id FROM quizzes WHERE id = ?').get(quizId);
    if (!quiz) {
      return res.status(404).json({ ok: false, error: 'Quiz not found' });
    }

    const now = new Date().toISOString();
    const resultId = `result_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;

    db.prepare(`
      INSERT OR REPLACE INTO quiz_results (id, user_id, quiz_id, answers, result, created_at, updated_at)
      VALUES (
        COALESCE((SELECT id FROM quiz_results WHERE user_id = ? AND quiz_id = ?), ?),
        ?, ?, ?, ?, 
        COALESCE((SELECT created_at FROM quiz_results WHERE user_id = ? AND quiz_id = ?), ?),
        ?
      )
    `).run(userId, quizId, resultId, userId, quizId, JSON.stringify(answers), JSON.stringify(result), userId, quizId, now, now);

    res.json({ 
      ok: true, 
      message: 'Result saved',
      result: {
        userId,
        quizId,
        answers,
        result,
        updatedAt: now
      }
    });
  } catch (err) {
    console.error('❌ Save quiz result error:', err);
    res.status(500).json({ ok: false, error: 'Server error' });
  }
});

// Tarot reading endpoints
app.post('/api/tarot/reading', async (req, res) => {
  try {
    console.log('✅ API: Create tarot reading');
    const { userId, spreadId, cardIds } = req.body || {};
    
    if (!userId || !spreadId || !cardIds || !Array.isArray(cardIds)) {
      return res.status(400).json({ ok: false, error: 'Invalid parameters' });
    }
    
    const { getDatabase } = await import('./db.js');
    const db = getDatabase();
    
    const user = db.prepare('SELECT id FROM users WHERE id = ?').get(userId);
    if (!user) {
      return res.status(404).json({ ok: false, error: 'User not found' });
    }
    
    const spread = db.prepare('SELECT * FROM tarot_spreads WHERE id = ?').get(spreadId);
    if (!spread) {
      return res.status(404).json({ ok: false, error: 'Spread not found' });
    }
    
    const cards = [];
    const interpretations = [];
    
    for (let i = 0; i < cardIds.length; i++) {
      const cardId = cardIds[i];
      const card = db.prepare('SELECT * FROM tarot_cards WHERE id = ?').get(cardId);
      if (!card) {
        return res.status(404).json({ ok: false, error: `Card ${cardId} not found` });
      }
      
      const interpretation = db.prepare(`
        SELECT interpretation FROM tarot_interpretations 
        WHERE card_id = ? AND spread_id = ? AND position_index = ?
      `).get(cardId, spreadId, i);
      
      cards.push({
        ...card,
        position: JSON.parse(spread.positions)[i] || `Position ${i + 1}`
      });
      
      interpretations.push({
        position: JSON.parse(spread.positions)[i] || `Position ${i + 1}`,
        card: card,
        interpretation: interpretation ? interpretation.interpretation : 'Interpretation not found'
      });
    }
    
    const readingId = `reading_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
    const now = new Date().toISOString();
    
    db.prepare(`
      INSERT INTO tarot_readings (id, user_id, spread_id, cards, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(readingId, userId, spreadId, JSON.stringify(cardIds), now);
    
    res.json({
      ok: true,
      reading: {
        id: readingId,
        spread: {
          id: spread.id,
          name: spread.name,
          description: spread.description,
          cardCount: spread.card_count,
          positions: JSON.parse(spread.positions)
        },
        cards,
        interpretations,
        createdAt: now
      }
    });
    
  } catch (err) {
    console.error('❌ Create tarot reading error:', err);
    res.status(500).json({ ok: false, error: 'Server error' });
  }
});

app.get('/api/user/:userId/tarot/readings', async (req, res) => {
  try {
    console.log('✅ API: Get user tarot readings');
    const { userId } = req.params;
    const { date } = req.query;
    
    if (!userId) {
      return res.status(400).json({ ok: false, error: 'Missing userId' });
    }
    
    const { getDatabase } = await import('./db.js');
    const db = getDatabase();
    
    let query = `
      SELECT tr.*, ts.name as spread_name, ts.description as spread_description 
      FROM tarot_readings tr
      JOIN tarot_spreads ts ON tr.spread_id = ts.id
      WHERE tr.user_id = ?
    `;
    const params = [userId];
    
    if (date) {
      query += ` AND DATE(tr.created_at) = ?`;
      params.push(date);
    }
    
    query += ` ORDER BY tr.created_at DESC`;
    
    const readings = db.prepare(query).all(...params);
    
    res.json({ 
      ok: true, 
      readings: readings.map(reading => ({
        id: reading.id,
        spreadId: reading.spread_id,
        spreadName: reading.spread_name,
        spreadDescription: reading.spread_description,
        cards: JSON.parse(reading.cards),
        createdAt: reading.created_at
      }))
    });
    
  } catch (err) {
    console.error('❌ Get user tarot readings error:', err);
    res.status(500).json({ ok: false, error: 'Server error' });
  }
});

// Horoscope endpoints
app.get('/api/horoscope/:sign', async (req, res) => {
  try {
    console.log('✅ API: Get daily horoscope');
    const { sign } = req.params;
    const validSigns = ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'];
    
    if (!validSigns.includes(sign)) {
      return res.status(400).json({ ok: false, error: 'Invalid zodiac sign' });
    }

    // Simple fallback horoscope for now
    const fallbackTexts = {
      aries: 'Today the stars advise Aries to show activity and determination. A good day for new beginnings.',
      taurus: 'Taurus is recommended to focus on practical matters. Stability will bring success.',
      gemini: 'Gemini can count on interesting acquaintances and fruitful communication.',
      cancer: 'Cancer should pay attention to family and home affairs. Intuition will suggest the right solution.',
      leo: 'Leo will be in the spotlight. Use your charisma to achieve your goals.',
      virgo: 'Virgo is recommended to engage in planning and organization. Attention to detail will bring results.',
      libra: 'Libra will find harmony in relationships. The day is favorable for creativity and beauty.',
      scorpio: 'Scorpio should trust their intuition. Deep analysis will help find hidden opportunities.',
      sagittarius: 'Sagittarius can plan trips or study something new. Expanding horizons will bring joy.',
      capricorn: 'Capricorn is recommended to focus on career. Perseverance and discipline will lead to success.',
      aquarius: 'Aquarius can count on the support of friends. Original ideas will find implementation.',
      pisces: 'Pisces should listen to their feelings. A creative approach will help solve problems.'
    };

    const today = new Date();
    const localDate = new Date(today.getTime() - (today.getTimezoneOffset() * 60000));

    res.json({
      ok: true,
      horoscope: {
        sign,
        text: fallbackTexts[sign] || 'Today the stars are favorable to you. Follow your intuition.',
        date: localDate.toISOString().split('T')[0]
      }
    });

  } catch (error) {
    console.error('❌ Daily horoscope API error:', error);
    res.status(500).json({ ok: false, error: 'Internal server error' });
  }
});

app.get('/api/horoscope/:sign/weekly', async (req, res) => {
  try {
    console.log('✅ API: Get weekly horoscope');
    const { sign } = req.params;
    const validSigns = ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'];
    
    if (!validSigns.includes(sign)) {
      return res.status(400).json({ ok: false, error: 'Invalid zodiac sign' });
    }

    const fallbackTexts = {
      aries: 'This week Aries is recommended to take initiative in important matters. The stars favor new projects and active actions.',
      taurus: 'Taurus should focus on stability and practical issues. The week is favorable for financial decisions.',
      gemini: 'Gemini can count on interesting acquaintances and fruitful communication. Good time for learning.',
      cancer: 'Cancer is recommended to pay attention to family and home affairs. Intuition will be especially strong.',
      leo: 'Leo will be in the spotlight this week. Use charisma to achieve set goals.',
      virgo: 'Virgo should engage in planning and organization. Attention to detail will bring excellent results.',
      libra: 'Libra will find harmony in relationships. The week is favorable for creativity and aesthetic projects.',
      scorpio: 'Scorpio is recommended to trust intuition. Deep analysis will help find hidden opportunities.',
      sagittarius: 'Sagittarius can plan trips or study something new. Expanding horizons will bring joy.',
      capricorn: 'Capricorn should focus on career issues. Perseverance and discipline will lead to success.',
      aquarius: 'Aquarius can count on the support of friends. Original ideas will find practical implementation.',
      pisces: 'Pisces is recommended to listen to their feelings. A creative approach will help solve complex tasks.'
    };

    const today = new Date();
    const localDate = new Date(today.getTime() - (today.getTimezoneOffset() * 60000));

    res.json({
      ok: true,
      horoscope: {
        sign,
        text: fallbackTexts[sign] || 'This week the stars are favorable to you. Follow your intuition and act decisively.',
        period: 'week',
        date: localDate.toISOString().split('T')[0],
        weekRange: "March 15-21, 2026"
      }
    });

  } catch (error) {
    console.error('❌ Weekly horoscope API error:', error);
    res.status(500).json({ ok: false, error: 'Internal server error' });
  }
});

app.get('/api/horoscope/:sign/monthly', async (req, res) => {
  try {
    console.log('✅ API: Get monthly horoscope');
    const { sign } = req.params;
    const validSigns = ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'];
    
    if (!validSigns.includes(sign)) {
      return res.status(400).json({ ok: false, error: 'Invalid zodiac sign' });
    }

    const fallbackTexts = {
      aries: 'This month Aries is recommended to focus on long-term goals and plans. The stars favor new beginnings and active actions.',
      taurus: 'Taurus should pay attention to financial issues and stability. The month is favorable for practical decisions.',
      gemini: 'Gemini can count on active communication and new acquaintances. Good time for learning and development.',
      cancer: 'Cancer is recommended to focus on family affairs and home comfort. Intuition will be especially strong.',
      leo: 'Leo will be in the spotlight this month. Use charisma to achieve ambitious goals.',
      virgo: 'Virgo should engage in systematization and planning. Attention to detail will bring excellent results.',
      libra: 'Libra will find harmony in relationships and creativity. The month is favorable for aesthetic projects.',
      scorpio: 'Scorpio is recommended to trust intuition and engage in deep self-analysis.',
      sagittarius: 'Sagittarius can plan long trips and expand horizons. A month of discoveries and opportunities.',
      capricorn: 'Capricorn should focus on career achievements. Perseverance will lead to significant success.',
      aquarius: 'Aquarius can count on the support of friends and like-minded people. Time to implement original ideas.',
      pisces: 'Pisces is recommended to listen to their inner voice. A creative approach will help solve tasks.'
    };

    const today = new Date();
    const localDate = new Date(today.getTime() - (today.getTimezoneOffset() * 60000));

    res.json({
      ok: true,
      horoscope: {
        sign,
        text: fallbackTexts[sign] || 'This month the stars are favorable to you. Follow your intuition and act decisively.',
        period: 'month',
        date: localDate.toISOString().split('T')[0],
        monthRange: "March 2026"
      }
    });

  } catch (error) {
    console.error('❌ Monthly horoscope API error:', error);
    res.status(500).json({ ok: false, error: 'Internal server error' });
  }
});

// Catch-all for other API routes - return 404 JSON
app.all('/api/*', (req, res) => {
  console.log(`⚠️  API endpoint not found: ${req.method} ${req.path}`);
  res.status(404).json({ ok: false, error: 'API endpoint not found' });
});

// ============================================
// STATIC FILES - MUST BE AFTER API ROUTES!
// ============================================

const distPath = path.join(__dirname, '..', 'dist');
console.log('📁 Serving static files from:', distPath);

// Serve static files but NOT for /api routes
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    console.log('⚠️  Request to /api/* should have been handled by API routes!');
    return res.status(404).json({ ok: false, error: 'API endpoint not found' });
  }
  next();
}, express.static(distPath, { index: false }));

// SPA fallback - serve index.html for all non-API routes
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ ok: false, error: 'API endpoint not found' });
  }
  
  try {
    const indexPath = path.join(distPath, 'index.html');
    console.log('📄 Serving SPA index.html');
    res.sendFile(indexPath);
  } catch (error) {
    console.error('❌ Error serving index.html:', error);
    res.status(404).send('Page not found');
  }
});

// Error handler
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err);
  if (req.path.startsWith('/api/')) {
    res.status(500).json({ ok: false, error: 'Internal server error' });
  } else {
    res.status(500).send('Internal server error');
  }
});

// Initialize database and start server
import('./db.js').then(({ initDatabase }) => {
  console.log('🗄️  Initializing database...');
  initDatabase();
  
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Production server running at http://0.0.0.0:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🎯 API endpoints ready!`);
  });
}).catch(err => {
  console.error('❌ Failed to initialize database:', err);
  process.exit(1);
});
