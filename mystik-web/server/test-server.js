#!/usr/bin/env node

// Simple server test script
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

console.log('🚀 Starting test server...');
console.log('📁 Current directory:', process.cwd());
console.log('📁 __dirname:', __dirname);
console.log('🌍 NODE_ENV:', process.env.NODE_ENV);
console.log('🔌 PORT:', PORT);

// Basic CORS
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());

// Test endpoint
app.get('/api/health', (req, res) => {
  console.log('✅ Health check requested');
  res.json({ 
    ok: true, 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    port: PORT,
    cwd: process.cwd(),
    dirname: __dirname
  });
});

// Test quizzes endpoint
app.get('/api/quizzes', (req, res) => {
  console.log('✅ Quizzes requested');
  res.json({ 
    ok: true, 
    quizzes: {
      test: {
        id: 'test',
        title: 'Test Quiz',
        description: 'This is a test quiz',
        isPremium: false
      }
    }
  });
});

// Serve static files from dist
const distPath = path.join(__dirname, '..', 'dist');
console.log('📁 Static files path:', distPath);

app.use(express.static(distPath, {
  index: false
}));

// SPA fallback
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    try {
      const indexPath = path.join(distPath, 'index.html');
      console.log('📄 Serving index.html from:', indexPath);
      res.sendFile(indexPath);
    } catch (error) {
      console.error('❌ Error serving index.html:', error);
      res.status(404).json({ ok: false, error: 'Page not found' });
    }
  } else {
    res.status(404).json({ ok: false, error: 'API endpoint not found' });
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err);
  res.status(500).json({ ok: false, error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🎉 Test server running at http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🧪 Test quizzes: http://localhost:${PORT}/api/quizzes`);
});