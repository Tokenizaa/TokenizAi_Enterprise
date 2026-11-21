/**
 * NettosCorp — UI Card
 * Surface container primitive for dashboard panels, sheets and modals.
 */

import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padded?: boolean;
  paddingSize?: 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  className = '',
  padded = false,
  paddingSize = 'md',
  children,
  ...props
}) => {
  const paddingClasses = {
    sm: 'p-4',
    md: 'p-5',
    lg: 'p-6',
  }[paddingSize];

  return (
    <div
      role="region"
      aria-roledescription="card"
      className={`rounded-lg border border-nc-border bg-nc-surface-elevated shadow-card ${padded ? paddingClasses : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

Card.displayName = 'Card';
