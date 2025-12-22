/**
 * WebSocket Message Handlers
 * TODO: Перенести из backend/src/websocket/handlers.js
 */

import type { WebSocket, RawData } from 'ws';
import { clientManager } from './clientManager';
// TODO: import { translationService } from '@/services';

interface WSMessage {
  type: string;
  payload: unknown;
}

export function handleMessage(ws: WebSocket, clientId: string, data: RawData): void {
  try {
    const message: WSMessage = JSON.parse(data.toString());
    
    switch (message.type) {
      case 'join_room':
        handleJoinRoom(clientId, message.payload as { roomId: string });
        break;
      case 'leave_room':
        handleLeaveRoom(clientId);
        break;
      case 'translate':
        handleTranslate(clientId, message.payload);
        break;
      default:
        console.warn(`[WS] Unknown message type: ${message.type}`);
    }
  } catch (error) {
    console.error('[WS] Failed to parse message:', error);
  }
}

export function handleDisconnect(clientId: string): void {
  // TODO: Уведомить других участников комнаты
  console.log(`[WS] Handling disconnect for: ${clientId}`);
}

function handleJoinRoom(clientId: string, payload: { roomId: string }): void {
  clientManager.joinRoom(clientId, payload.roomId);
  // TODO: Broadcast join event
}

function handleLeaveRoom(clientId: string): void {
  const client = clientManager.getClient(clientId);
  if (client?.roomId) {
    clientManager.leaveRoom(clientId, client.roomId);
    // TODO: Broadcast leave event
  }
}

function handleTranslate(clientId: string, payload: unknown): void {
  // TODO: Интеграция с translationService
  // TODO: Broadcast переведённого текста в комнату
}
