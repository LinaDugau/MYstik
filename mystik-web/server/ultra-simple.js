// Ультра-простой сервер для диагностики
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 8000;
const HOST = '0.0.0.0'; // Слушаем на всех интерфейсах

console.log('🚀 Starting ULTRA SIMPLE server...');
console.log('🔌 PORT:', PORT);
console.log('🌐 HOST:', HOST);
console.log('📁 Working directory:', process.cwd());
console.log('🌍 Environment:', process.env.NODE_ENV);
console.log('📊 Server info:');
console.log('   - Domain: linadugau-mystik-c815.twc1.net');
console.log('   - Public IP: 5.129.193.50');
console.log('   - Private IP: 192.168.0.4');

const server = http.createServer((req, res) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url} - ${req.headers['user-agent'] || 'Unknown'}`);
  
  // CORS headers для всех запросов
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('X-Powered-By', 'Mystik-Ultra-Simple-Server');
  
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
      message: 'Ultra simple server is running',
      timestamp: new Date().toISOString(),
      port: PORT,
      host: HOST,
      domain: 'linadugau-mystik-c815.twc1.net',
      publicIP: '5.129.193.50',
      privateIP: '192.168.0.4'
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
      port: PORT,
      host: HOST,
      environment: process.env.NODE_ENV || 'development'
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
          <title>Mystik Server Test</title>
          <style>
              body { 
                  font-family: Arial, sans-serif; 
                  max-width: 800px; 
                  margin: 50px auto; 
                  padding: 20px; 
                  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                  color: white;
                  min-height: 100vh;
              }
              .success { color: #4CAF50; font-size: 28px; text-align: center; }
              .info { 
                  background: rgba(255,255,255,0.1); 
                  padding: 20px; 
                  border-radius: 10px; 
                  margin: 20px 0; 
                  backdrop-filter: blur(10px);
              }
              .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
              a { color: #4CAF50; text-decoration: none; }
              a:hover { text-decoration: underline; }
              .status { display: inline-block; margin: 5px 0; }
              .loading { color: #FFC107; }
              .success-test { color: #4CAF50; }
              .error-test { color: #f44336; }
          </style>
      </head>
      <body>
          <h1 class="success">✅ Mystik Server Working!</h1>
          
          <div class="info">
              <h2>📊 Server Information</h2>
              <div class="grid">
                  <div>
                      <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
                      <p><strong>Port:</strong> ${PORT}</p>
                      <p><strong>Host:</strong> ${HOST}</p>
                      <p><strong>Environment:</strong> ${process.env.NODE_ENV || 'development'}</p>
                  </div>
                  <div>
                      <p><strong>Domain:</strong> linadugau-mystik-c815.twc1.net</p>
                      <p><strong>Public IP:</strong> 5.129.193.50</p>
                      <p><strong>Private IP:</strong> 192.168.0.4</p>
                      <p><strong>Request URL:</strong> ${req.url}</p>
                  </div>
              </div>
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

          <div class="info">
              <h2>🧪 Automatic Tests</h2>
              <div id="test-results">
                  <div class="status loading">🔄 Running tests...</div>
              </div>
          </div>

          <script>
              console.log('🚀 Mystik test page loaded');
              
              const testResults = document.getElementById('test-results');
              
              async function runTests() {
                  const tests = [
                      { url: '/ping', name: 'Ping Test' },
                      { url: '/api/health', name: 'Health Check' }
                  ];
                  
                  testResults.innerHTML = '';
                  
                  for (const test of tests) {
                      try {
                          console.log(\`Testing \${test.name}...\`);
                          const response = await fetch(test.url);
                          const data = await response.json();
                          
                          if (data.ok) {
                              testResults.innerHTML += \`<div class="status success-test">✅ \${test.name}: Success</div>\`;
                              console.log(\`✅ \${test.name} successful:, data\`);
                          } else {
                              testResults.innerHTML += \`<div class="status error-test">❌ \${test.name}: Failed</div>\`;
                              console.error(\`❌ \${test.name} failed:, data\`);
                          }
                      } catch (error) {
                          testResults.innerHTML += \`<div class="status error-test">❌ \${test.name}: Error - \${error.message}</div>\`;
                          console.error(\`❌ \${test.name} error:, error\`);
                      }
                  }
                  
                  testResults.innerHTML += '<div class="status">🏁 Tests completed!</div>';
              }
              
              // Запускаем тесты через секунду
              setTimeout(runTests, 1000);
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
        <p><strong>Available options:</strong></p>
        <ul>
          <li><a href="/test">Test Page</a></li>
          <li><a href="/ping">Ping Test</a></li>
          <li><a href="/api/health">Health Check</a></li>
        </ul>
      `);
      return;
    }
  }
  
  // Handle other static files
  if (req.url.startsWith('/assets/') || req.url.endsWith('.js') || req.url.endsWith('.css') || req.url.endsWith('.svg')) {
    const filePath = path.join(distPath, req.url);
    console.log('📦 Attempting to serve static file:', filePath);
    
    if (fs.existsSync(filePath)) {
      console.log('✅ Static file found');
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
  console.log('❌ 404 - Path not found:', req.url);
  res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(`
    <h1>404 - Not Found</h1>
    <p><strong>Path:</strong> ${req.url}</p>
    <p><strong>Available options:</strong></p>
    <ul>
      <li><a href="/test">Test Page</a></li>
      <li><a href="/ping">Ping Test</a></li>
      <li><a href="/api/health">Health Check</a></li>
    </ul>
  `);
});

// Обработка ошибок сервера
server.on('error', (err) => {
  console.error('❌ Server error:', err);
});

server.on('clientError', (err, socket) => {
  console.error('❌ Client error:', err);
  socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
});

// Запуск сервера
server.listen(PORT, HOST, () => {
  console.log(`✅ Ultra simple server running at http://${HOST}:${PORT}`);
  console.log(`🌐 External access:`);
  console.log(`   - https://linadugau-mystik-c815.twc1.net`);
  console.log(`   - http://5.129.193.50:${PORT}`);
  console.log(`   - http://192.168.0.4:${PORT}`);
  console.log(`🧪 Test endpoints:`);
  console.log(`   - https://linadugau-mystik-c815.twc1.net/test`);
  console.log(`   - https://linadugau-mystik-c815.twc1.net/ping`);
  console.log(`   - https://linadugau-mystik-c815.twc1.net/api/health`);
  console.log('🎯 Server ready for connections!');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});