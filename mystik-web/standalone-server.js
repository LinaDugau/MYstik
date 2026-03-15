// Автономный сервер без зависимостей от server/package.json
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 8000;
const HOST = '0.0.0.0';

console.log('🚀 Starting STANDALONE server...');
console.log('🔌 PORT:', PORT);
console.log('🌐 HOST:', HOST);
console.log('📁 Working directory:', process.cwd());

const server = http.createServer((req, res) => {
  console.log(`${req.method} ${req.url}`);
  
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  // Simple endpoints
  if (req.url === '/ping') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      ok: true, 
      message: 'Standalone server running',
      timestamp: new Date().toISOString(),
      port: PORT
    }));
    return;
  }
  
  if (req.url === '/api/health') {
    console.log('✅ Health check request received');
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      ok: true, 
      status: 'healthy',
      timestamp: new Date().toISOString(),
      port: PORT,
      host: HOST
    }));
    return;
  }
  
  if (req.url === '/test') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
      <html>
      <head><title>Standalone Test</title></head>
      <body style="font-family: Arial; max-width: 600px; margin: 50px auto; padding: 20px;">
          <h1 style="color: green;">✅ Standalone Server Working!</h1>
          <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
          <p><strong>Port:</strong> ${PORT}</p>
          <p><strong>Domain:</strong> linadugau-mystik-c815.twc1.net</p>
          <h2>Links:</h2>
          <ul>
              <li><a href="/ping">Ping Test</a></li>
              <li><a href="/api/health">Health Check</a></li>
              <li><a href="/">Main App</a></li>
          </ul>
      </body>
      </html>
    `);
    return;
  }
  
  // Static files
  const distPath = path.join(__dirname, 'dist');
  
  if (req.url === '/') {
    const indexPath = path.join(distPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      fs.createReadStream(indexPath).pipe(res);
      return;
    } else {
      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.end('<h1>React App Not Found</h1><p><a href="/test">Test Page</a></p>');
      return;
    }
  }
  
  // Assets
  if (req.url.startsWith('/assets/')) {
    const filePath = path.join(distPath, req.url);
    if (fs.existsSync(filePath)) {
      const ext = path.extname(filePath);
      const types = {
        '.js': 'application/javascript',
        '.css': 'text/css',
        '.svg': 'image/svg+xml'
      };
      res.writeHead(200, { 'Content-Type': types[ext] || 'application/octet-stream' });
      fs.createReadStream(filePath).pipe(res);
      return;
    }
  }
  
  // 404
  res.writeHead(404, { 'Content-Type': 'text/html' });
  res.end('<h1>404</h1><p><a href="/test">Test</a></p>');
});

server.listen(PORT, HOST, () => {
  console.log(`✅ Standalone server at http://${HOST}:${PORT}`);
  console.log(`🌐 https://linadugau-mystik-c815.twc1.net`);
  console.log(`🧪 https://linadugau-mystik-c815.twc1.net/test`);
});

process.on('SIGTERM', () => server.close(() => process.exit(0)));
process.on('SIGINT', () => server.close(() => process.exit(0)));