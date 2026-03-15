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

// Import and use main server routes
import('./index.js').then(module => {
  console.log('✅ Main server module loaded');
}).catch(err => {
  console.error('❌ Failed to load main server module:', err);
});

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
