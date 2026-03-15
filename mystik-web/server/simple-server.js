import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8000;

console.log('🚀 Starting SIMPLE server...');
console.log('📁 Working directory:', process.cwd());
console.log('🌍 NODE_ENV:', process.env.NODE_ENV);
console.log('🔌 PORT:', PORT);

// CORS
app.use(cors({
  origin: true,
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

// Simple endpoints
app.get('/ping', (req, res) => {
  console.log('🏓 Ping');
  res.json({ ok: true, message: 'Simple server is running', timestamp: new Date().toISOString() });
});

app.get('/api/health', (req, res) => {
  console.log('✅ Health check');
  res.json({ ok: true, status: 'healthy', timestamp: new Date().toISOString() });
});

// Test page
app.get('/test', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>Simple Server Test</title>
        <style>
            body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
            .success { color: green; }
            .info { background: #f0f0f0; padding: 15px; border-radius: 5px; margin: 10px 0; }
        </style>
    </head>
    <body>
        <h1 class="success">✅ Simple Server Working!</h1>
        <div class="info">
            <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
            <p><strong>Port:</strong> ${PORT}</p>
            <p><strong>Environment:</strong> ${process.env.NODE_ENV || 'development'}</p>
        </div>
        <h2>Test Links:</h2>
        <ul>
            <li><a href="/ping">Ping Test</a></li>
            <li><a href="/api/health">Health Check</a></li>
        </ul>
        <script>
            fetch('/ping')
                .then(r => r.json())
                .then(data => console.log('Ping test:', data))
                .catch(e => console.error('Ping failed:', e));
        </script>
    </body>
    </html>
  `);
});

// Static files
const distPath = path.join(__dirname, '..', 'dist');
console.log('📁 Looking for dist at:', distPath);

if (existsSync(distPath)) {
  console.log('✅ dist directory found, serving static files');
  app.use(express.static(distPath));
  
  // SPA fallback
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api/') || req.path.startsWith('/ping') || req.path.startsWith('/test')) {
      return res.status(404).json({ error: 'Not found' });
    }
    
    const indexPath = path.join(distPath, 'index.html');
    if (existsSync(indexPath)) {
      console.log('📄 Serving index.html for:', req.path);
      res.sendFile(indexPath);
    } else {
      res.status(404).send('index.html not found');
    }
  });
} else {
  console.log('❌ dist directory not found');
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api/') || req.path.startsWith('/ping') || req.path.startsWith('/test')) {
      return res.status(404).json({ error: 'Not found' });
    }
    res.send('<h1>Static files not found</h1><p>dist directory is missing</p>');
  });
}

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Simple server running at http://0.0.0.0:${PORT}`);
  console.log(`🧪 Test page: http://localhost:${PORT}/test`);
  console.log(`🏓 Ping: http://localhost:${PORT}/ping`);
  console.log(`📊 Health: http://localhost:${PORT}/api/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received');
  server.close(() => process.exit(0));
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received');
  server.close(() => process.exit(0));
});