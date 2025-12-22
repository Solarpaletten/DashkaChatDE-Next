/**
 * Input
 * TODO: Перенести из текущего frontend
 */

import { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

export function Input({ className, ...props }: InputProps) {
  return (
    <input className={`border rounded px-3 py-2 ${className}`} {...props} />
  );
}
