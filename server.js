const http = require('http');
const fs = require('fs');
const path = require('path');

const DIST = path.join(__dirname, 'dist');
const PWA = path.join(__dirname, 'pwa');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json',
  '.css': 'text/css',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webmanifest': 'application/manifest+json',
};

const PWA_ROUTES = {
  '/manifest.json': 'manifest.json',
  '/sw.js': 'sw.js',
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

  if (PWA_ROUTES[urlPath]) {
    return sendFile(res, path.join(PWA, PWA_ROUTES[urlPath]));
  }

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
  console.error('ERROR: dist/index.html not found.');
  console.error('CWD:', process.cwd());
  console.error('DIST:', DIST);
  try {
    console.error('dist contents:', fs.readdirSync(DIST));
  } catch (e) {
    console.error('dist folder missing');
  }
  process.exit(1);
}

const port = Number(process.env.PORT) || 3000;

server.listen(port, '0.0.0.0', () => {
  console.log(`Kivuko web listening on 0.0.0.0:${port}`);
  console.log(`Health check: http://0.0.0.0:${port}/`);
  if (process.env.RAILWAY_PUBLIC_DOMAIN) {
    console.log(`Public URL: https://${process.env.RAILWAY_PUBLIC_DOMAIN}`);
    console.log(
      'IMPORTANT: Railway Networking port must match PORT above (Settings → Networking).',
    );
  }
});
