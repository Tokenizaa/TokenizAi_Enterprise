/**
 * NettosCorp — UI Input
 * Form field primitive: label, input, optional error/helper text.
 * WCAG 2.1 AA: label bound via htmlFor/id, aria-invalid, aria-describedby.
 */

import React from 'react';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label?: string;
  labelHidden?: boolean;
  error?: string;
  helperText?: string;
  required?: boolean;
}

export const Input: React.FC<InputProps> = ({
  id,
  label,
  labelHidden = false,
  error,
  helperText,
  required = false,
  className = '',
  ...props
}) => {
  const errorId = `${id}-error`;
  const helperId = `${id}-helper`;

  const inputClasses = `block w-full rounded-md border border-nc-border bg-nc-surface-input px-3 py-1.5 text-sm text-nc-text placeholder-nc-text-muted transition-colors focus:outline-none focus:ring-2 focus:ring-nc-border-focus focus:border-nc-border-focus disabled:opacity-50 disabled:pointer-events-none readonly:bg-nc-surface ${className}`;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={id}
          className={`text-xs font-medium text-nc-text-secondary block ${labelHidden ? 'sr-only' : ''}`}
        >
          {label}{required && <span className="text-nc-error ml-0.5">*</span>}
        </label>
      )}
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-required={required || undefined}
        aria-describedby={
          [
            error ? errorId : undefined,
            helperText ? helperId : undefined,
          ]
            .filter(Boolean)
            .join(' ') || undefined
        }
        className={inputClasses}
        {...props}
      />
      {error && (
        <p id={errorId} role="alert" className="text-xs text-rose-400">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p id={helperId} className="text-xs text-nc-text-muted">
          {helperText}
        </p>
      )}
    </div>
  );
};

Input.displayName = 'Input';
