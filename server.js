// Local Development Server
// Serves static files and routes /api/analyze to api/analyze.js
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const analyzeHandler = require('./api/analyze.js');

const PORT = process.env.PORT || 3000;

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.js': 'text/javascript; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.pdf': 'application/pdf',
  '.md': 'text/markdown; charset=UTF-8'
};

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  let pathname = parsedUrl.pathname;

  // Handle /api/analyze endpoint
  if (pathname === '/api/analyze') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        req.body = body ? JSON.parse(body) : {};
      } catch (err) {
        req.body = {};
      }

      // Adapter for Express/Vercel-like res object
      const customRes = {
        statusCode: 200,
        headers: {},
        setHeader(name, value) {
          this.headers[name] = value;
          return this;
        },
        status(code) {
          this.statusCode = code;
          return this;
        },
        json(data) {
          res.writeHead(this.statusCode, {
            'Content-Type': 'application/json',
            ...this.headers
          });
          res.end(JSON.stringify(data));
        },
        end(data) {
          res.writeHead(this.statusCode, this.headers);
          res.end(data || '');
        }
      };

      try {
        await analyzeHandler(req, customRes);
      } catch (handlerErr) {
        console.error('API Error:', handlerErr);
        customRes.status(500).json({ error: handlerErr.message });
      }
    });
    return;
  }

  // Handle Static Files
  if (pathname === '/') {
    pathname = '/index.html';
  }

  const filePath = path.join(__dirname, pathname);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found: ' + pathname);
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 CareerPilot.ai Local Server is running!`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`⚡ Autonomous Engine: Active (Zero API Key needed)`);
  console.log(`🤖 Gemini AI Engine: Active (/api/analyze proxy ready)`);
  console.log(`======================================================\n`);
});
