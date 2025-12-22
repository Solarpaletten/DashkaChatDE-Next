/**
 * Application Constants
 */

export const APP_NAME = 'DashkaChat';
export const APP_VERSION = '1.0.0';

export const WS_EVENTS = {
  JOIN_ROOM: 'join_room',
  LEAVE_ROOM: 'leave_room',
  TRANSLATE: 'translate',
  TRANSCRIPTION: 'transcription',
  TTS: 'tts',
  ERROR: 'error',
  USER_JOINED: 'user_joined',
  USER_LEFT: 'user_left',
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  INTERNAL_ERROR: 500,
} as const;

export const SUPPORTED_AUDIO_FORMATS = [
  'audio/webm',
  'audio/wav',
  'audio/mp3',
  'audio/mpeg',
  'audio/ogg',
] as const;
