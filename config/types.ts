// config/types.ts

export interface LanguageConfig {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  
  app: {
    title: string;
    subtitle: string;
  };
  
  buttons: {
    translate: string;
    clear: string;
    record: string;
  };
  
  placeholders: {
    inputText: string;
    outputLabel: string;
    sourceText: string;
  };
  
  languageSelector: {
    sourceLabel: string;
    targetLabel: string;
  };
  
  translationLanguages?: {
    source: { code: string; name: string; flag: string };
    target: { code: string; name: string; flag: string };
  };
  
  ui?: {
    title: string;
    subtitle: string;
    joinRoom: string;
    leaveRoom: string;
    startRecording: string;
    stopRecording: string;
    translate: string;
    settings: string;
    language: string;
  };
}
