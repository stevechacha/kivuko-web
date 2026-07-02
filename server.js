const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = Number(process.env.PORT) || 3000;
const DIST = path.join(__dirname, 'dist');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json',
  '.css': 'text/css',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

function sendFile(res, filePath) {
  const ext = path.extname(filePath);
  const type = MIME[ext] || 'application/octet-stream';
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not found');
      return;
    }
    res.writeHead(200, { 'Content-Type': type });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
  let filePath = path.join(DIST, urlPath === '/' ? 'index.html' : urlPath);

  if (!filePath.startsWith(DIST)) {
    res.writeHead(400).end('Bad request');
    return;
  }

  fs.stat(filePath, (err, stat) => {
    if (!err && stat.isFile()) {
      sendFile(res, filePath);
      return;
    }
    sendFile(res, path.join(DIST, 'index.html'));
  });
});

if (!fs.existsSync(path.join(DIST, 'index.html'))) {
  console.error('ERROR: dist/index.html not found. Run: npm run build');
  process.exit(1);
}

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Kivuko web listening on 0.0.0.0:${PORT}`);
});
