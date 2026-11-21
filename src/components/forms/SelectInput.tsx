/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectInputProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: SelectOption[];
  error?: boolean;
}

export const SelectInput = React.forwardRef<HTMLSelectElement, SelectInputProps>(
  ({ options, className = '', error, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={`w-full px-3 py-2 text-sm bg-zinc-900 border rounded text-zinc-100 focus:outline-none transition-colors ${
          error
            ? 'border-rose-500 focus:border-rose-400'
            : 'border-zinc-800 focus:border-zinc-500'
        } disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        {...props}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value} className="bg-zinc-900 text-zinc-100">
            {opt.label}
          </option>
        ))}
      </select>
    );
  }
);

SelectInput.displayName = 'SelectInput';
