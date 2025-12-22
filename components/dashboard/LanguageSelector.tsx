/**
 * LanguageSelector
 * TODO: Перенести из текущего frontend
 */

interface LanguageSelectorProps {
  value?: string;
  onChange?: (code: string) => void;
}

export function LanguageSelector({ value, onChange }: LanguageSelectorProps) {
  return <select className="border rounded p-2">{/* TODO */}</select>;
}
