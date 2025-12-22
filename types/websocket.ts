/**
 * WebSocket Message Types
 */

export type WSMessageType =
  | 'join_room'
  | 'leave_room'
  | 'translate'
  | 'transcription'
  | 'tts'
  | 'error'
  | 'user_joined'
  | 'user_left';

export interface WSMessage<T = unknown> {
  type: WSMessageType;
  payload: T;
  timestamp?: string;
}

// Payloads
export interface JoinRoomPayload {
  roomId: string;
  language?: string;
}

export interface TranslatePayload {
  text: string;
  from: string;
  to: string;
}

export interface TranscriptionPayload {
  text: string;
  language: string;
  userId: string;
}

export interface ErrorPayload {
  message: string;
  code?: string;
}

export interface UserEventPayload {
  userId: string;
  roomId: string;
}
