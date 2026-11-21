/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const TextInput = React.forwardRef<HTMLInputElement, TextInputProps>(
  ({ className = '', error, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`w-full px-3 py-2 text-sm bg-zinc-900 border rounded text-zinc-100 placeholder-zinc-500 focus:outline-none transition-colors ${
          error
            ? 'border-rose-500 focus:border-rose-400 focus:ring-1 focus:ring-rose-400/30'
            : 'border-zinc-800 focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/20'
        } disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        {...props}
      />
    );
  }
);

TextInput.displayName = 'TextInput';
