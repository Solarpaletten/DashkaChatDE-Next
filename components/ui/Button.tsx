/**
 * Button
 * TODO: Перенести из текущего frontend
 */

import { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
}

export function Button({ children, variant = 'primary', ...props }: ButtonProps) {
  return (
    <button className="px-4 py-2 rounded" {...props}>
      {children}
    </button>
  );
}
