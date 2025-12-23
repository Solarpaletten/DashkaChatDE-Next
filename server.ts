/**
 * Custom Server для DashkaChat
 * Next.js + WebSocket на одном порту
 */

import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';

// WebSocket setup
const { setupWebSocket } = require('./lib/websocket');

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOSTNAME || 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url!, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error handling request:', err);
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  });

  // Initialize WebSocket Server
  const wss = setupWebSocket(server);

  server.listen(port, () => {
    console.log(`
    ╔════════════════════════════════════════════╗
    ║       🚀 DashkaChat Server Started         ║
    ╠════════════════════════════════════════════╣
    ║  HTTP:  http://${hostname}:${port}              ║
    ║  WS:    ws://${hostname}:${port}/ws              ║
    ║  Mode:  ${dev ? 'development' : 'production'}                      ║
    ╚════════════════════════════════════════════╝
    `);
  });
});
