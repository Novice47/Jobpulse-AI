import http from 'http';
import https from 'https';

/**
 * Self-Pinging Keep-Alive Service to prevent server from going to sleep on free hosting (Render, Railway, etc.)
 */
export function startKeepAliveService() {
  const targetUrl =
    process.env.RENDER_EXTERNAL_URL ||
    process.env.SERVER_URL ||
    process.env.CLIENT_URL ||
    `http://localhost:${process.env.PORT || 4000}`;

  const healthUrl = targetUrl.endsWith('/') ? `${targetUrl}health` : `${targetUrl}/health`;

  // Ping interval: 10 minutes (600,000 ms)
  const PING_INTERVAL_MS = 10 * 60 * 1000;

  console.log(`[Keep-Alive Service] Initialized. Target health URL: ${healthUrl} (Ping interval: 10m)`);

  const pingServer = () => {
    try {
      const client = healthUrl.startsWith('https') ? https : http;
      const req = client.get(healthUrl, (res) => {
        console.log(`[Keep-Alive Ping] ${new Date().toISOString()} -> ${healthUrl} [Status: ${res.statusCode}]`);
      });

      req.on('error', (err) => {
        console.warn(`[Keep-Alive Ping Warning] Could not reach ${healthUrl}: ${err.message}`);
      });

      req.setTimeout(10000, () => {
        req.destroy();
      });
    } catch (err: any) {
      console.warn(`[Keep-Alive Ping Exception] ${err.message}`);
    }
  };

  // Run initial ping after 1 minute, then repeat every 10 minutes
  setTimeout(pingServer, 60 * 1000);
  const timer = setInterval(pingServer, PING_INTERVAL_MS);

  // Unref timer so it doesn't block process exit
  if (timer.unref) {
    timer.unref();
  }
}
