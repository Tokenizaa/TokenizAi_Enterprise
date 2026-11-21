/**
 * NettosCorp — UI Button
 * Accessible button primitive with NettosCorp design tokens.
 * WCAG 2.1 AA: focus-visible ring, disabled state, type defaults to 'button'.
 */

import React from 'react';

type ButtonVariant =
  | 'default'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'danger';

type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
}

const VARIANT_CLASSES: Record<
  ButtonVariant,
  { base: string; hover: string; active: string }
> = {
  default: {
    base: 'bg-nc-brand text-nc-brand-text border-transparent shadow-sm',
    hover: 'hover:bg-nc-brand-hover',
    active: 'active:bg-nc-brand-hover',
  },
  secondary: {
    base: 'bg-nc-surface-elevated border border-nc-border text-nc-text',
    hover: 'hover:bg-nc-surface-hover hover:border-nc-border-hover',
    active: 'active:bg-nc-surface-hover',
  },
  outline: {
    base: 'border border-nc-border text-nc-text bg-transparent',
    hover: 'hover:bg-nc-surface-hover hover:border-nc-border-hover',
    active: 'active:bg-nc-surface-hover',
  },
  ghost: {
    base: 'text-nc-text-secondary bg-transparent border-transparent',
    hover: 'hover:text-nc-text hover:bg-nc-surface-hover',
    active: 'active:bg-nc-surface-hover',
  },
  danger: {
    base:
      'bg-rose-950/40 border border-rose-800/40 text-rose-400 shadow-sm',
    hover: 'hover:bg-rose-950/60 hover:border-rose-700/60',
    active: 'active:bg-rose-950/60',
  },
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-5 py-3 text-base',
};

export const Button: React.FC<ButtonProps> = ({
  className = '',
  variant = 'default',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled = false,
  children,
  ...props
}) => {
  const { base, hover, active } = VARIANT_CLASSES[variant];

  return (
    <button
      type={props.type ?? 'button'}
      disabled={disabled || loading}
      aria-disabled={disabled || loading ? true : undefined}
      aria-busy={loading || undefined}
      className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md border font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nc-border-focus focus-visible:ring-offset-2 focus-visible:ring-offset-nc-surface disabled:pointer-events-none disabled:opacity-50 ${base} ${hover} ${active} ${SIZE_CLASSES[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {loading && (
        <span className="flex items-center justify-center w-4 h-4 shrink-0">
          <svg
            className="animate-spin text-nc-brand-text"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </span>
      )}
      {children}
    </button>
  );
};

Button.displayName = 'Button';
