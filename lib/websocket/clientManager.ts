/**
 * WebSocket Client Manager
 * TODO: Перенести из backend/src/websocket/clientManager.js
 */

import type { WebSocket } from 'ws';
import { randomUUID } from 'crypto';

interface Client {
  id: string;
  ws: WebSocket;
  roomId?: string;
  language?: string;
}

class ClientManager {
  private clients = new Map<string, Client>();
  private rooms = new Map<string, Set<string>>();

  addClient(ws: WebSocket): string {
    const id = randomUUID();
    this.clients.set(id, { id, ws });
    return id;
  }

  removeClient(id: string): void {
    const client = this.clients.get(id);
    if (client?.roomId) {
      this.leaveRoom(id, client.roomId);
    }
    this.clients.delete(id);
  }

  getClient(id: string): Client | undefined {
    return this.clients.get(id);
  }

  joinRoom(clientId: string, roomId: string): void {
    const client = this.clients.get(clientId);
    if (!client) return;

    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, new Set());
    }
    this.rooms.get(roomId)!.add(clientId);
    client.roomId = roomId;
  }

  leaveRoom(clientId: string, roomId: string): void {
    this.rooms.get(roomId)?.delete(clientId);
    const client = this.clients.get(clientId);
    if (client) client.roomId = undefined;
  }

  getRoomClients(roomId: string): Client[] {
    const clientIds = this.rooms.get(roomId);
    if (!clientIds) return [];
    return Array.from(clientIds)
      .map((id) => this.clients.get(id))
      .filter((c): c is Client => !!c);
  }

  broadcast(roomId: string, message: string, excludeId?: string): void {
    const clients = this.getRoomClients(roomId);
    for (const client of clients) {
      if (client.id !== excludeId && client.ws.readyState === 1) {
        client.ws.send(message);
      }
    }
  }
}

export const clientManager = new ClientManager();
