/**
 * WebSocket Server Setup
 * Main entry point for WebSocket functionality
 */

import { WebSocketServer, WebSocket } from 'ws';
import type { Server } from 'http';
import type { IncomingMessage } from 'http';

const logger = require('./logger');
const clientManager = require('./clientManager');
const handlers = require('./handlers');

interface ExtendedWebSocket extends WebSocket {
  room?: string;
  username?: string;
  clientId?: string;
}

function setupWebSocket(server: Server): WebSocketServer {
  const wss = new WebSocketServer({
    server,
    path: '/ws'
  });

  wss.on('connection', (ws: ExtendedWebSocket, request: IncomingMessage) => {
    const clientId = clientManager.addClient(ws, request);
    ws.clientId = clientId;

    // Send welcome message
    ws.send(JSON.stringify({
      type: 'welcome',
      client_id: clientId,
      message: '✅ Connected to DashkaChat!',
      timestamp: new Date().toISOString()
    }));

    // Handle incoming messages
    ws.on('message', (message) => {
      handlers.handleMessage(ws, clientId, message);
    });

    // Handle disconnect
    ws.on('close', () => {
      handlers.handleDisconnect(clientId, ws);
      logger.info(`Client disconnected: ${clientId}`);
    });

    // Handle errors
    ws.on('error', (error) => {
      logger.error(`WebSocket error for ${clientId}: ${error.message}`);
    });
  });

  logger.info('WebSocket server initialized on /ws');
  return wss;
}

module.exports = { setupWebSocket, clientManager };
export { setupWebSocket, clientManager };
