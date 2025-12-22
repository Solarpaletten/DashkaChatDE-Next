/**
 * VoiceRecorder
 * TODO: Перенести из текущего frontend
 */

interface VoiceRecorderProps {
  onRecordingComplete?: (blob: Blob) => void;
}

export function VoiceRecorder({ onRecordingComplete }: VoiceRecorderProps) {
  return <button className="p-4 rounded-full bg-red-500">{/* TODO */}</button>;
}
