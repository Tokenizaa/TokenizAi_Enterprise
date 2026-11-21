/**
 * NettosCorp — UI Badge
 * Small status/label indicator with semantic color variants.
 */

import React from 'react';

type BadgeVariant =
  | 'default'
  | 'secondary'
  | 'success'
  | 'warn'
  | 'error'
  | 'info'
  | 'outline';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  default:
    'border-transparent bg-nc-brand text-nc-brand-text',
  secondary:
    'border-nc-border bg-nc-surface-hover text-nc-text',
  success:
    'border-emerald-800/40 bg-emerald-950/40 text-emerald-400',
  warn:
    'border-amber-800/40 bg-amber-950/40 text-amber-400',
  error:
    'border-rose-800/40 bg-rose-950/40 text-rose-400',
  info:
    'border-sky-800/40 bg-sky-950/40 text-sky-400',
  outline:
    'border-nc-border bg-transparent text-nc-text-secondary',
};

export const Badge: React.FC<BadgeProps> = ({
  className = '',
  variant = 'default',
  children,
  ...props
}) => {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-md border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ${VARIANT_CLASSES[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};

Badge.displayName = 'Badge';
