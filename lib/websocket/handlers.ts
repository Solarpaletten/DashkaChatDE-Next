/**
 * WebSocket Message Handlers
 * Handles room management and real-time translation
 */

import { WebSocket, RawData } from 'ws';

const logger = require('./logger');
const clientManager = require('./clientManager');

// Room management
interface RoomMember {
  ws: WebSocket;
  username: string;
  clientId: string;
}

const rooms = new Map<string, RoomMember[]>();

// Extend WebSocket type for our properties
interface ExtendedWebSocket extends WebSocket {
  room?: string;
  username?: string;
  clientId?: string;
}

function handleJoinRoom(ws: ExtendedWebSocket, data: any, clientId: string): void {
  const { room, username } = data;

  if (!room || !username) {
    ws.send(JSON.stringify({
      type: 'error',
      message: 'Room and username are required'
    }));
    return;
  }

  // Create room if doesn't exist
  if (!rooms.has(room)) {
    rooms.set(room, []);
  }

  // Store room info on websocket
  ws.room = room;
  ws.username = username;
  ws.clientId = clientId;

  // Add to room
  rooms.get(room)!.push({ ws, username, clientId });

  // Update client manager
  clientManager.setClientRoom(clientId, room, username);

  logger.info(`User ${username} joined room ${room}`);

  // Notify others in room
  broadcastToRoom(room, {
    type: 'user_joined',
    username: username,
    participants: rooms.get(room)!.length
  }, ws);

  // Confirm to user
  ws.send(JSON.stringify({
    type: 'room_joined',
    room: room,
    participants: rooms.get(room)!.length
  }));
}

function broadcastToRoom(roomCode: string, message: object, excludeWs: WebSocket | null = null): void {
  const room = rooms.get(roomCode);
  if (!room) return;

  const payload = JSON.stringify(message);

  room.forEach(({ ws }) => {
    if (ws !== excludeWs && ws.readyState === WebSocket.OPEN) {
      try {
        ws.send(payload);
      } catch (error) {
        logger.error('Failed to broadcast to room member');
      }
    }
  });
}

function handleLeaveRoom(ws: ExtendedWebSocket, clientId: string): void {
  const room = ws.room;
  const username = ws.username;

  if (room && rooms.has(room)) {
    const roomMembers = rooms.get(room)!;
    const index = roomMembers.findIndex(m => m.clientId === clientId);
    
    if (index !== -1) {
      roomMembers.splice(index, 1);
      
      // Notify others
      broadcastToRoom(room, {
        type: 'user_left',
        username: username,
        participants: roomMembers.length
      });

      // Remove empty rooms
      if (roomMembers.length === 0) {
        rooms.delete(room);
      }

      logger.info(`User ${username} left room ${room}`);
    }
  }
}

function handleSetRole(clientId: string, data: any, ws: WebSocket): void {
  const { role } = data;

  if (clientManager.setClientRole(clientId, role)) {
    ws.send(JSON.stringify({
      type: 'role_confirmed',
      role,
      timestamp: new Date().toISOString()
    }));
  }
}

function handleTranslation(ws: ExtendedWebSocket, clientId: string, data: any): void {
  logger.info(`Translation from ${clientId}`);

  const message = {
    type: 'translation',
    username: ws.username || 'Anonymous',
    original: data.original,
    translation: data.translation,
    from: data.from,
    to: data.to,
    timestamp: new Date().toISOString()
  };

  // Broadcast to room if in one
  if (ws.room) {
    broadcastToRoom(ws.room, message, ws);
  } else {
    // Fallback: broadcast to all others
    clientManager.broadcastToOthers(clientId, message);
  }
}

function handleMessage(ws: ExtendedWebSocket, clientId: string, rawData: RawData): void {
  try {
    const data = JSON.parse(rawData.toString());
    data.sender_id = clientId;

    logger.debug(`WS message from ${clientId}: ${data.type}`);

    switch (data.type) {
      case 'join_room':
        handleJoinRoom(ws, data, clientId);
        break;

      case 'leave_room':
        handleLeaveRoom(ws, clientId);
        break;

      case 'set_role':
        handleSetRole(clientId, data, ws);
        break;

      case 'translation':
        handleTranslation(ws, clientId, data);
        break;

      default:
        // Unknown message type - broadcast to others
        clientManager.broadcastToOthers(clientId, {
          ...data,
          sender_id: clientId,
          timestamp: new Date().toISOString()
        });
    }
  } catch (error: any) {
    logger.error(`Failed to parse message from ${clientId}: ${error.message}`);
    ws.send(JSON.stringify({
      type: 'error',
      message: 'Invalid message format'
    }));
  }
}

function handleDisconnect(clientId: string, ws?: ExtendedWebSocket): void {
  if (ws) {
    handleLeaveRoom(ws, clientId);
  }
  clientManager.removeClient(clientId);
}

module.exports = {
  handleMessage,
  handleDisconnect,
  handleJoinRoom,
  handleLeaveRoom,
  handleSetRole,
  handleTranslation,
  broadcastToRoom
};

export {
  handleMessage,
  handleDisconnect,
  handleJoinRoom,
  handleLeaveRoom,
  handleSetRole,
  handleTranslation,
  broadcastToRoom
};
