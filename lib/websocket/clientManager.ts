/**
 * WebSocket Client Manager
 * Manages connected clients and their state
 */

import { WebSocket } from 'ws';
import type { IncomingMessage } from 'http';

const logger = require('./logger');

interface ClientData {
  ws: WebSocket;
  role: string;
  room?: string;
  username?: string;
  connected_at: Date;
  ip?: string;
}

class ClientManager {
  private clients: Map<string, ClientData>;

  constructor() {
    this.clients = new Map();
  }

  addClient(ws: WebSocket, request?: IncomingMessage): string {
    const clientId = `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    this.clients.set(clientId, {
      ws,
      role: 'unknown',
      connected_at: new Date(),
      ip: request?.socket?.remoteAddress
    });

    logger.info(`WebSocket connected: ${clientId} (total: ${this.clients.size})`);
    return clientId;
  }

  removeClient(clientId: string): void {
    if (this.clients.has(clientId)) {
      this.clients.delete(clientId);
      logger.info(`WebSocket disconnected: ${clientId} (remaining: ${this.clients.size})`);
    }
  }

  getClient(clientId: string): ClientData | undefined {
    return this.clients.get(clientId);
  }

  setClientRole(clientId: string, role: string): boolean {
    const client = this.clients.get(clientId);
    if (client) {
      client.role = role;
      logger.info(`Client ${clientId} role set to: ${role}`);
      return true;
    }
    return false;
  }

  setClientRoom(clientId: string, room: string, username: string): void {
    const client = this.clients.get(clientId);
    if (client) {
      client.room = room;
      client.username = username;
    }
  }

  broadcastToOthers(senderId: string, data: object): number {
    let sentCount = 0;
    
    this.clients.forEach((client, clientId) => {
      if (clientId !== senderId && client.ws.readyState === WebSocket.OPEN) {
        try {
          client.ws.send(JSON.stringify(data));
          sentCount++;
        } catch (error: any) {
          logger.error(`Failed to send to ${clientId}: ${error.message}`);
        }
      }
    });

    if (sentCount > 0) {
      logger.debug(`Broadcast sent to ${sentCount} clients`);
    }
    
    return sentCount;
  }

  getClientCount(): number {
    return this.clients.size;
  }

  getAllClients(): Array<{ id: string; role: string; room?: string; connected_at: Date }> {
    return Array.from(this.clients.entries()).map(([id, data]) => ({
      id,
      role: data.role,
      room: data.room,
      connected_at: data.connected_at
    }));
  }
}

const clientManager = new ClientManager();

module.exports = clientManager;
export { clientManager, ClientManager };
