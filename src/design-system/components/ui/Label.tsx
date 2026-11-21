/**
 * NettosCorp — UI Label
 * Accessible form label primitive.
 */

import React from 'react';

export interface LabelProps
  extends React.LabelHTMLAttributes<HTMLLabelElement> {}

export const Label: React.FC<LabelProps> = ({
  className = '',
  children,
  ...props
}) => {
  return (
    <label
      className={`text-xs font-medium text-nc-text-secondary block mb-1 ${className}`}
      {...props}
    >
      {children}
    </label>
  );
};

Label.displayName = 'Label';
