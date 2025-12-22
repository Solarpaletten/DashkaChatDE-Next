/**
 * WebSocket Server Setup
 * TODO: Перенести из backend/src/websocket/index.js
 */

import type { WebSocketServer, WebSocket } from 'ws';
import type { IncomingMessage } from 'http';
import { clientManager } from './clientManager';
import { handleMessage, handleDisconnect } from './handlers';

export function setupWebSocket(wss: WebSocketServer): void {
  wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
    const clientId = clientManager.addClient(ws);
    console.log(`[WS] Client connected: ${clientId}`);

    ws.on('message', (data) => {
      handleMessage(ws, clientId, data);
    });

    ws.on('close', () => {
      handleDisconnect(clientId);
      clientManager.removeClient(clientId);
      console.log(`[WS] Client disconnected: ${clientId}`);
    });

    ws.on('error', (error) => {
      console.error(`[WS] Error for ${clientId}:`, error);
    });
  });
}
