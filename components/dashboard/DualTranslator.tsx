'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useTranslator } from '@/hooks/useTranslator';
import RoomJoin from './RoomJoin';

const DualTranslator: React.FC = () => {
  const {
    originalText,
    translatedText,
    isRecording,
    status,
    toggleRecording,
    connectionStatus,
    recognitionLang,
    setRecognitionLang,
    websocketRef,
    setOriginalText,
    performTranslation,
    setStatus
  } = useTranslator();

  const dialects = ['de-DE', 'ru-RU'];
  const dialectNames: Record<string, string> = {
    'de-DE': '🇩🇪 Deutsch',
    'ru-RU': '🇷🇺 Русский'
  };

  const [dialect, setDialect] = useState(recognitionLang);
  const [dialectIndex, setDialectIndex] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [showRoomJoin, setShowRoomJoin] = useState(false);
  const [roomCode, setRoomCode] = useState('');
  const [username, setUsername] = useState('');
  const [isWakingUp, setIsWakingUp] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<Array<{
    speaker: string;
    lang: string;
    text: string;
    translation: string;
    timestamp: string;
  }>>([]);

  const leftPanelRef = useRef<HTMLTextAreaElement>(null);
  const rightPanelRef = useRef<HTMLDivElement>(null);

  const handleJoinRoom = (code: string, name: string) => {
    setRoomCode(code);
    setUsername(name);

    if (websocketRef?.current?.readyState === WebSocket.OPEN) {
      websocketRef.current.send(JSON.stringify({
        type: 'join_room',
        room: code,
        username: name
      }));
      setIsConnected(true);
    }
    setShowRoomJoin(false);
  };

  const switchDialect = () => {
    const nextIndex = (dialectIndex + 1) % dialects.length;
    setDialectIndex(nextIndex);
    const newDialect = dialects[nextIndex];
    setDialect(newDialect);
    setRecognitionLang(newDialect);
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert(`${label} скопирован`);
    } catch {
      alert('Ошибка');
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Enter' && !isRecording) {
        e.preventDefault();
        switchDialect();
      } else if (e.code === 'Space' && e.target === document.body) {
        e.preventDefault();
        toggleRecording();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dialectIndex, isRecording]);

  // Update conversation history when translation completes
  useEffect(() => {
    if (translatedText && translatedText !== 'Перевод появится здесь...' && originalText) {
      const newEntry = {
        speaker: username || (dialect.startsWith('ru') ? 'RU' : 'DE'),
        lang: dialect,
        text: originalText,
        translation: translatedText,
        timestamp: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
      };
      setConversationHistory(prev => {
        if (prev.length > 0 && prev[prev.length - 1].text === originalText) return prev;
        return [...prev, newEntry];
      });
    }
  }, [translatedText]);

  useEffect(() => setDialect(recognitionLang), [recognitionLang]);
  
  useEffect(() => {
    if (leftPanelRef.current) leftPanelRef.current.scrollTop = leftPanelRef.current.scrollHeight;
  }, [originalText]);
  
  useEffect(() => {
    if (rightPanelRef.current) rightPanelRef.current.scrollTop = rightPanelRef.current.scrollHeight;
  }, [translatedText]);

  const wakeUpAPI = async () => {
    setIsWakingUp(true);
    if (setStatus) setStatus('⏰ Пробуждаю backend...');

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' ? window.location.origin : '');
      const response = await fetch(`${baseUrl}/api/health`);

      if (response.ok) {
        if (setStatus) setStatus('✅ Backend проснулся!');
      } else {
        if (setStatus) setStatus('❌ Backend не отвечает');
      }
    } catch (error) {
      if (setStatus) setStatus('❌ Ошибка подключения к backend');
    } finally {
      setIsWakingUp(false);
    }
  };

  const pasteToOriginal = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setOriginalText(text);
    } catch (err) {
      console.error("Не удалось вставить текст:", err);
    }
  };

  const clearAll = () => {
    setOriginalText("");
    if (isRecording) toggleRecording();
  };

  return (
    <>
      {/* Room Join Modal */}
      {!isConnected && showRoomJoin && (
        <RoomJoin
          onJoin={handleJoinRoom}
          onClose={() => setShowRoomJoin(false)}
        />
      )}
      
      <div className="w-full h-screen flex flex-col bg-gradient-to-br from-purple-600 via-blue-600 to-teal-600">
        {/* Header */}
        <header className="flex justify-between items-center p-6 flex-wrap gap-3">
          <h1 className="text-white text-3xl font-bold">🎤 Dual Translator</h1>
          
          <div className="flex items-center gap-3">
            {/* API Status Indicators */}
            <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2">
              <span className="text-white text-sm font-medium">API</span>
              <div
                className={`w-3 h-3 rounded-full ${connectionStatus.ai ? 'bg-green-400' : 'bg-red-400'}`}
                title={connectionStatus.ai ? 'Backend доступен' : 'Backend недоступен'}
              />
              <div
                className={`w-3 h-3 rounded-full ${connectionStatus.ws ? 'bg-green-400' : 'bg-red-400'}`}
                title={connectionStatus.ws ? 'WebSocket подключен' : 'WebSocket отключен'}
              />
            </div>

            {/* Wake Up Button */}
            {!connectionStatus.ai && (
              <button
                onClick={wakeUpAPI}
                disabled={isWakingUp}
                className="px-3 py-1 bg-yellow-500 hover:bg-yellow-600 disabled:bg-yellow-300 rounded text-white text-xs font-semibold transition-all"
                title="Разбудить backend на Render"
              >
                {isWakingUp ? '⏳' : '⏰ Разбудить'}
              </button>
            )}

            {/* Room Join Button */}
            {connectionStatus.ai && connectionStatus.ws && !isConnected && (
              <button
                onClick={() => setShowRoomJoin(true)}
                className="px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg text-white text-sm font-semibold transition-all"
                title="Создать или войти в комнату"
              >
                🚪 Войти в комнату
              </button>
            )}

            {/* Start/Stop Button */}
            <button
              onClick={toggleRecording}
              className={`px-8 py-4 rounded-xl font-semibold text-white text-lg shadow-lg transition-all ${
                isRecording 
                  ? 'bg-red-600 hover:bg-red-700 animate-pulse' 
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {isRecording ? '⏹️ Остановить' : '▶️ Запустить'}
            </button>
          </div>
          
          {/* Dialect Selector */}
          <button
            onClick={switchDialect}
            className="px-4 py-2 bg-white/20 text-white rounded-lg font-semibold hover:bg-white/30"
          >
            {dialectNames[dialect] || dialect}
          </button>
        </header>

        {/* Status Bar */}
        <div className="px-6 pb-4">
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center text-white">
            <span>{status}</span>
            <span className="ml-3 text-sm opacity-70">
              {isConnected ? `Комната: ${roomCode} | ${username}` : '(Enter = язык | Space = запись)'}
            </span>
          </div>
        </div>

        {/* Main Content - Two Panels */}
        <main className="flex-1 flex gap-4 px-6 pb-6">
          {/* Left Panel - Original */}
          <div className="flex-1 bg-white/10 backdrop-blur-sm rounded-2xl p-6 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-white text-xl font-semibold flex items-center gap-2">
                <span>🇷🇺</span>
                <span>Оригинал</span>
              </h2>

              <div className="flex items-center gap-2">
                <button
                  onClick={pasteToOriginal}
                  className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-white text-sm"
                >
                  📥 Вставить
                </button>
                <button
                  onClick={() => navigator.clipboard.writeText(originalText)}
                  className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-white text-sm"
                  disabled={!originalText}
                >
                  📋 Копировать
                </button>
                <button
                  onClick={clearAll}
                  className="px-3 py-1 bg-red-500/70 hover:bg-red-600 rounded-lg text-white text-sm"
                >
                  🗑️ Стереть
                </button>
                <button
                  onClick={() => {
                    if (isRecording) toggleRecording();
                  }}
                  className="px-3 py-1 bg-yellow-500/70 hover:bg-yellow-600 rounded-lg text-white text-sm"
                >
                  ⏹️ Стоп
                </button>
              </div>
            </div>
            
            <textarea
              ref={leftPanelRef}
              value={originalText}
              onChange={(e) => setOriginalText(e.target.value)}
              onKeyDown={(e) => {
                if (e.ctrlKey && e.key === 'v') {
                  e.preventDefault();
                  pasteToOriginal();
                }
                if (e.ctrlKey && e.key === 'Enter') {
                  e.preventDefault();
                  performTranslation(originalText);
                }
              }}
              placeholder="Начните говорить или вставьте текст..."
              className="flex-1 bg-white/5 rounded-xl p-4 text-white text-lg leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-white/50"
            />
          </div>

          {/* Right Panel - Translation */}
          <div className="flex-1 bg-white/10 backdrop-blur-sm rounded-2xl p-6 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-white text-xl font-semibold">🌐 Перевод</h2>
              <button
                onClick={() => copyToClipboard(translatedText, 'Перевод')}
                className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-white text-sm"
              >
                📋 Копировать
              </button>
            </div>
            <div ref={rightPanelRef} className="flex-1 bg-white/5 rounded-xl p-4 overflow-y-auto">
              <p className="text-white text-lg leading-relaxed whitespace-pre-wrap">
                {translatedText || 'Перевод появится здесь...'}
              </p>
            </div>
          </div>
        </main>

        {/* Footer - Conversation History */}
        <footer className="bg-white/10 backdrop-blur-sm p-6 text-white">
          <h3 className="font-semibold mb-3 text-lg">🕐 История разговора</h3>
          <div className="max-h-48 overflow-y-auto space-y-3 pr-2">
            {conversationHistory.length === 0 ? (
              <p className="text-white/50 text-center py-4">История пуста</p>
            ) : (
              conversationHistory.map((msg, index) => (
                <div key={index} className="bg-white/10 rounded-lg p-3 border-l-4 border-white/30">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold">{msg.speaker}</span>
                    <span className="text-sm opacity-70">{msg.timestamp}</span>
                  </div>
                  <div className="text-base">
                    <p className="mb-1">{msg.text}</p>
                    <p className="text-white/80 italic">→ {msg.translation}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </footer>
      </div>
    </>
  );
};

export default DualTranslator;
