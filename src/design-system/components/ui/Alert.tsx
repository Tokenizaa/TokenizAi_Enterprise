/**
 * NettosCorp — UI Alert
 * Dismissible inline alert with semantic variants and aria-live.
 */

import React from 'react';

type AlertVariant = 'info' | 'success' | 'warn' | 'error';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant;
  title?: string;
}

const VARIANT_CLASSES: Record<AlertVariant, string> = {
  info:
    'border-sky-800/40 bg-sky-950/40 text-sky-300',
  success:
    'border-emerald-800/40 bg-emerald-950/40 text-emerald-300',
  warn:
    'border-amber-800/40 bg-amber-950/40 text-amber-300',
  error:
    'border-rose-800/40 bg-rose-950/40 text-rose-300',
};

const VARIANT_ICON_LABELS: Record<AlertVariant, string> = {
  info: 'Informação',
  success: 'Sucesso',
  warn: 'Atenção',
  error: 'Erro',
};

export const Alert: React.FC<AlertProps> = ({
  className = '',
  variant = 'info',
  title,
  children,
  ...props
}) => {
  return (
    <div
      role="alert"
      aria-label={VARIANT_ICON_LABELS[variant]}
      className={`relative rounded-md border p-3 text-sm flex items-start gap-2.5 ${VARIANT_CLASSES[variant]} ${className}`}
      {...props}
    >
      {title && (
        <span className="sr-only">{title}</span>
      )}
      <div className="flex items-start gap-2.5">
        <div className="flex flex-col gap-1">
          {title && (
            <h3 className="font-semibold text-sm">{title}</h3>
          )}
          <span className="text-sm">{children}</span>
        </div>
      </div>
    </div>
  );
};

Alert.displayName = 'Alert';
