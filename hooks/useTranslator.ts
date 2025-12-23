'use client';

import { useState, useEffect, useRef } from 'react';

type TranslationMode = 'manual' | 'auto';

// Simple logger
const logger = {
  info: (...args: any[]) => console.log('[INFO]', ...args),
  error: (...args: any[]) => console.error('[ERROR]', ...args),
  debug: (...args: any[]) => console.log('[DEBUG]', ...args)
};

// Get config based on environment (SSR-safe)
const getConfig = () => {
  if (typeof window === 'undefined') {
    return { aiServer: '', wsServer: '' };
  }
  
  // For Next.js: use current origin or env variable
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || window.location.origin;
  const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const wsUrl = process.env.NEXT_PUBLIC_WS_URL || `${wsProtocol}//${window.location.host}/ws`;
  
  return {
    aiServer: baseUrl,
    wsServer: wsUrl
  };
};

export const useTranslator = () => {
  const [translationMode, setTranslationMode] = useState<TranslationMode>('auto');
  const [currentRole, setCurrentRole] = useState<'user' | 'steuerberater'>('user');
  const [currentMode, setCurrentMode] = useState<'text' | 'voice'>('text');
  const [inputText, setInputText] = useState('');
  const [originalText, setOriginalText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [status, setStatus] = useState('🟢 Ready');
  const [isTranslating, setIsTranslating] = useState(false);
  const [autoTranslate, setAutoTranslate] = useState(false);
  const [recognitionLang, setRecognitionLang] = useState<string>('ru-RU');

  const [connectionStatus, setConnectionStatus] = useState({
    ai: false,
    ws: false,
    speech: false
  });

  const recognitionRef = useRef<any>(null);
  const websocketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // Only run on client side
    if (typeof window !== 'undefined') {
      initSystem();
    }
    return () => cleanup();
  }, []);

  useEffect(() => {
    if (!isRecording && originalText.trim() && translationMode === 'auto') {
      performTranslation(originalText);
    }
  }, [isRecording]);

  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = recognitionLang;
    }
  }, [recognitionLang]);

  const initSystem = async () => {
    await checkAIServer();
    initWebSocket();
    initSpeechRecognition();
    setStatus('🟢 DualTranslator ready');
  };

  const cleanup = () => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
    }
    if (websocketRef.current) {
      try { websocketRef.current.close(); } catch {}
    }
  };

  const checkAIServer = async () => {
    const config = getConfig();
    try {
      // Next.js API route: /api/health
      const response = await fetch(`${config.aiServer}/api/health`);
      setConnectionStatus(prev => ({ ...prev, ai: response.ok }));
    } catch {
      setConnectionStatus(prev => ({ ...prev, ai: false }));
    }
  };

  const initWebSocket = () => {
    const config = getConfig();
    if (!config.wsServer) return;
    
    try {
      const ws = new WebSocket(config.wsServer);

      ws.onopen = () => {
        setConnectionStatus(prev => ({ ...prev, ws: true }));
        logger.info('WebSocket connected');
      };

      ws.onclose = () => {
        setConnectionStatus(prev => ({ ...prev, ws: false }));
        logger.info('WebSocket disconnected');
      };

      ws.onerror = (error) => {
        setConnectionStatus(prev => ({ ...prev, ws: false }));
        logger.error('WebSocket error:', error);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          logger.info('WebSocket message received:', data);

          switch (data.type) {
            case 'translation':
              if (data.username) {
                setOriginalText(data.original || '');
                setTranslatedText(data.translation || '');
                setStatus(`💬 ${data.username}: ${data.from} → ${data.to}`);
              }
              break;

            case 'user_joined':
              setStatus(`✅ ${data.username} подключился (${data.participants} чел.)`);
              break;

            case 'welcome':
              logger.info('Welcome:', data.message);
              break;

            default:
              logger.info('Unknown type:', data.type);
          }
        } catch (error) {
          logger.error('WebSocket parse error:', error);
        }
      };

      websocketRef.current = ws;
    } catch (error) {
      logger.error('WebSocket init error:', error);
      setConnectionStatus(prev => ({ ...prev, ws: false }));
    }
  };

  const initSpeechRecognition = () => {
    if (typeof window === 'undefined') return;
    
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setConnectionStatus(prev => ({ ...prev, speech: false }));
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = recognitionLang;

    recognition.onstart = () => {
      setConnectionStatus(prev => ({ ...prev, speech: true }));
      setStatus('🎤 Recording...');
    };

    recognition.onresult = (event: any) => {
      let transcript = '';
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      if (transcript.trim()) {
        setOriginalText(transcript);
      }
    };

    recognition.onerror = (event: any) => {
      if (event.error !== 'no-speech' && event.error !== 'audio-capture') {
        setStatus(`❌ Error: ${event.error}`);
      }
    };

    recognition.onend = () => {
      if (isRecording) {
        try {
          recognition.start();
        } catch (err) {
          setIsRecording(false);
        }
      }
    };

    recognitionRef.current = recognition;
    setConnectionStatus(prev => ({ ...prev, speech: true }));
  };

  const detectLanguage = async (text: string): Promise<string> => {
    const config = getConfig();
    try {
      // Next.js API route: POST /api/languages (detection)
      const response = await fetch(`${config.aiServer}/api/languages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      const result = await response.json();
      return result.detected_language || 'RU';
    } catch {
      return 'RU';
    }
  };

  const performTranslation = async (text: string) => {
    if (!text.trim()) return;

    setIsTranslating(true);
    setStatus('🔄 Translating...');

    const config = getConfig();

    try {
      let fromLang: string;
      let toLang: string;

      if (translationMode === 'auto') {
        const detected = await detectLanguage(text);
        setRecognitionLang(detected === 'RU' ? 'ru-RU' : 'de-DE');

        if (detected === 'RU') {
          fromLang = 'RU';
          toLang = 'DE';
        } else {
          fromLang = detected;
          toLang = 'RU';
        }
      } else {
        fromLang = currentRole === 'user' ? 'RU' : 'DE';
        toLang = currentRole === 'user' ? 'DE' : 'RU';
      }

      // Next.js API route: POST /api/translation
      const response = await fetch(`${config.aiServer}/api/translation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          source_language: fromLang,
          target_language: toLang
        })
      });

      const result = await response.json();
      const translation = result.translated_text || '';

      setTranslatedText(translation);
      setStatus(`✅ Done (${fromLang} → ${toLang})`);

      // Send to room via WebSocket
      if (websocketRef?.current?.readyState === WebSocket.OPEN) {
        websocketRef.current.send(JSON.stringify({
          type: 'translation',
          original: text,
          translation: translation,
          from: fromLang,
          to: toLang,
          timestamp: new Date().toISOString()
        }));
        logger.info('Translation sent to room');
      }

      // Text-to-Speech (browser native)
      const targetLangCode = toLang.toLowerCase();
      if (typeof window !== 'undefined' && 'speechSynthesis' in window && translation) {
        const utterance = new SpeechSynthesisUtterance(translation);
        utterance.lang = targetLangCode === 'ru' ? 'ru-RU' : 'de-DE';
        utterance.rate = 0.9;

        const speakNow = () => {
          const voices = speechSynthesis.getVoices();
          const voice = voices.find(v => v.lang.startsWith(targetLangCode));
          if (voice) utterance.voice = voice;
          speechSynthesis.speak(utterance);
        };

        if (speechSynthesis.getVoices().length === 0) {
          speechSynthesis.addEventListener('voiceschanged', speakNow, { once: true });
        } else {
          speakNow();
        }
      }

    } catch (error: any) {
      setStatus('❌ Translation error');
      setTranslatedText('Error: ' + error.message);
    } finally {
      setIsTranslating(false);
    }
  };

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      setStatus('❌ Speech recognition unavailable');
      return;
    }
    if (!isRecording) {
      setIsRecording(true);
      setStatus('🎤 Listening...');
      try {
        recognitionRef.current.start();
      } catch {
        setIsRecording(false);
      }
    } else {
      setIsRecording(false);
      setStatus('⏸️ Stopped');
      if (recognitionRef.current) recognitionRef.current.stop();
    }
  };

  const toggleTranslationMode = () => {
    const newMode = translationMode === 'manual' ? 'auto' : 'manual';
    setTranslationMode(newMode);
    setStatus(newMode === 'auto' ? '🤖 Auto mode' : '🎯 Manual mode');

    const newLang = newMode === 'manual'
      ? (currentRole === 'user' ? 'ru-RU' : 'de-DE')
      : 'ru-RU';

    setRecognitionLang(newLang);

    if (recognitionRef.current) {
      recognitionRef.current.lang = newLang;
      try { recognitionRef.current.stop(); } catch {}
    }

    initSpeechRecognition();
  };

  const handleRoleChange = (role: 'user' | 'steuerberater') => {
    if (translationMode === 'manual') {
      setCurrentRole(role);
      if (recognitionRef.current) {
        recognitionRef.current.lang = role === 'user' ? 'ru-RU' : 'de-DE';
      }
    }
  };

  const translateText = async () => {
    if (inputText.trim()) {
      await performTranslation(inputText.trim());
    }
  };

  const clearText = () => {
    setInputText('');
    setOriginalText('');
    setTranslatedText('');
    setStatus('🟢 Ready');
  };

  const pasteText = async () => {
    if (typeof window === 'undefined') return;
    try {
      const text = await navigator.clipboard.readText();
      setInputText(text);
    } catch { }
  };

  const copyResult = async () => {
    if (typeof window === 'undefined') return;
    if (translatedText) {
      try {
        await navigator.clipboard.writeText(translatedText);
        setStatus('📄 Copied');
      } catch { }
    }
  };

  return {
    translationMode,
    currentRole,
    currentMode,
    inputText,
    originalText,
    translatedText,
    isRecording,
    status,
    isTranslating,
    autoTranslate,
    connectionStatus,
    setCurrentMode,
    setInputText,
    setAutoTranslate,
    handleRoleChange,
    toggleRecording,
    translateText,
    clearText,
    pasteText,
    copyResult,
    performTranslation,
    toggleTranslationMode,
    recognitionLang,
    setRecognitionLang,
    websocketRef,
    setOriginalText,
    setStatus
  };
};
