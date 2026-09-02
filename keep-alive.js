import http from 'http';
import https from 'https';

/**
 * Standalone Keep-Alive Pinger Script for Render / Railway / Uptime Pingers
 * Usage: node keep-alive.js https://your-app.onrender.com/health
 */
const targetUrl = process.argv[2] || process.env.RENDER_EXTERNAL_URL || process.env.CLIENT_URL || 'http://localhost:4000/health';
const fullHealthUrl = targetUrl.endsWith('/health') ? targetUrl : `${targetUrl.replace(/\/$/, '')}/health`;

console.log(`[Keep-Alive Monitor] Starting ping loop for: ${fullHealthUrl}`);

function ping() {
  const client = fullHealthUrl.startsWith('https') ? https : http;
  const req = client.get(fullHealthUrl, (res) => {
    console.log(`[${new Date().toISOString()}] Pinged ${fullHealthUrl} - Status: ${res.statusCode}`);
  });

  req.on('error', (err) => {
    console.error(`[${new Date().toISOString()}] Ping failed: ${err.message}`);
  });

  req.setTimeout(10000, () => req.destroy());
}

ping();
setInterval(ping, 10 * 60 * 1000);
