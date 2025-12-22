/**
 * Custom Server для DashkaChat
 * Обеспечивает работу Next.js + WebSocket на одном порту
 */

import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { WebSocketServer } from 'ws';

// TODO: Импорт WebSocket handlers из lib/websocket
// import { setupWebSocket } from './lib/websocket/server';

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

  // WebSocket Server
  const wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (ws, req) => {
    console.log('[WS] Client connected');
    
    // TODO: Интеграция с lib/websocket/handlers
    // handleConnection(ws, req);

    ws.on('message', (message) => {
      console.log('[WS] Message received:', message.toString());
      // TODO: handleMessage(ws, message);
    });

    ws.on('close', () => {
      console.log('[WS] Client disconnected');
      // TODO: handleDisconnect(ws);
    });

    ws.on('error', (error) => {
      console.error('[WS] Error:', error);
    });
  });

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
