// Простой сервер на CommonJS (гарантированно работает)
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 8000;
const HOST = '0.0.0.0';

console.log('🚀 Starting SIMPLE CJS server...');
console.log('🔌 PORT:', PORT);
console.log('🌐 HOST:', HOST);
console.log('📁 Working directory:', process.cwd());
console.log('🌍 Environment:', process.env.NODE_ENV);

const server = http.createServer((req, res) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  // Ping endpoint
  if (req.url === '/ping') {
    console.log('🏓 Ping request');
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      ok: true, 
      message: 'Simple CJS server is running',
      timestamp: new Date().toISOString(),
      port: PORT,
      host: HOST
    }));
    return;
  }
  
  // Health check
  if (req.url === '/api/health') {
    console.log('✅ Health check request');
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      ok: true, 
      status: 'healthy',
      timestamp: new Date().toISOString(),
      port: PORT
    }));
    return;
  }
  
  // Test page
  if (req.url === '/test') {
    console.log('🧪 Test page request');
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`
      <!DOCTYPE html>
      <html lang="ru">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Simple CJS Server Test</title>
          <style>
              body { 
                  font-family: Arial, sans-serif; 
                  max-width: 800px; 
                  margin: 50px auto; 
                  padding: 20px; 
                  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                  color: white;
              }
              .success { color: #4CAF50; font-size: 28px; text-align: center; }
              .info { 
                  background: rgba(255,255,255,0.1); 
                  padding: 20px; 
                  border-radius: 10px; 
                  margin: 20px 0; 
              }
              a { color: #4CAF50; }
          </style>
      </head>
      <body>
          <h1 class="success">✅ Simple CJS Server Working!</h1>
          
          <div class="info">
              <h2>📊 Server Information</h2>
              <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
              <p><strong>Port:</strong> ${PORT}</p>
              <p><strong>Host:</strong> ${HOST}</p>
              <p><strong>Domain:</strong> linadugau-mystik-c815.twc1.net</p>
          </div>

          <div class="info">
              <h2>🔗 Test Links</h2>
              <ul>
                  <li><a href="/ping">Ping Test (JSON)</a></li>
                  <li><a href="/api/health">Health Check (JSON)</a></li>
                  <li><a href="/test">This Test Page</a></li>
                  <li><a href="/">Main App (React)</a></li>
              </ul>
          </div>

          <script>
              fetch('/ping')
                  .then(r => r.json())
                  .then(data => console.log('Ping successful:', data))
                  .catch(e => console.error('Ping failed:', e));
          </script>
      </body>
      </html>
    `);
    return;
  }
  
  // Serve static files
  const distPath = path.join(__dirname, '..', 'dist');
  
  if (req.url === '/') {
    const indexPath = path.join(distPath, 'index.html');
    console.log('📄 Attempting to serve index.html from:', indexPath);
    
    if (fs.existsSync(indexPath)) {
      console.log('✅ index.html found, serving...');
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      fs.createReadStream(indexPath).pipe(res);
      return;
    } else {
      console.log('❌ index.html not found');
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`
        <h1>❌ React App Not Found</h1>
        <p>index.html not found at: ${indexPath}</p>
        <p><a href="/test">Go to test page</a></p>
      `);
      return;
    }
  }
  
  // Handle static assets
  if (req.url.startsWith('/assets/') || req.url.endsWith('.js') || req.url.endsWith('.css') || req.url.endsWith('.svg')) {
    const filePath = path.join(distPath, req.url);
    
    if (fs.existsSync(filePath)) {
      const ext = path.extname(filePath);
      const contentTypes = {
        '.js': 'application/javascript',
        '.css': 'text/css',
        '.svg': 'image/svg+xml',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.ico': 'image/x-icon'
      };
      
      res.writeHead(200, { 'Content-Type': contentTypes[ext] || 'application/octet-stream' });
      fs.createReadStream(filePath).pipe(res);
      return;
    }
  }
  
  // Default 404
  res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(`
    <h1>404 - Not Found</h1>
    <p>Path: ${req.url}</p>
    <p><a href="/test">Test Page</a> | <a href="/ping">Ping</a></p>
  `);
});

// Start server
server.listen(PORT, HOST, () => {
  console.log(`✅ Simple CJS server running at http://${HOST}:${PORT}`);
  console.log(`🌐 External access: https://linadugau-mystik-c815.twc1.net`);
  console.log(`🧪 Test: https://linadugau-mystik-c815.twc1.net/test`);
  console.log(`🏓 Ping: https://linadugau-mystik-c815.twc1.net/ping`);
  console.log('🎯 Server ready!');
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