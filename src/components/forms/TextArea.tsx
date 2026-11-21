/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ className = '', error, rows = 3, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        rows={rows}
        className={`w-full px-3 py-2 text-sm bg-zinc-900 border rounded text-zinc-100 placeholder-zinc-500 focus:outline-none transition-colors ${
          error
            ? 'border-rose-500 focus:border-rose-400'
            : 'border-zinc-800 focus:border-zinc-500'
        } disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        {...props}
      />
    );
  }
);

TextArea.displayName = 'TextArea';
