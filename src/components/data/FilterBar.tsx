/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { RotateCcw } from 'lucide-react';

export interface FilterOption {
  id: string;
  label: string;
  count?: number;
}

export interface MultiFilterItem {
  key: string;
  label: string;
  options: Array<{ value: string; label: string }>;
  value: string;
  onChange: (val: string) => void;
}

export type FilterBarProps =
  | {
      options: FilterOption[];
      activeId: string;
      onChange: (id: string) => void;
      filters?: never;
      onReset?: never;
      hasActiveFilters?: never;
      className?: string;
    }
  | {
      options?: never;
      activeId?: never;
      onChange?: never;
      filters: MultiFilterItem[];
      onReset?: () => void;
      hasActiveFilters?: boolean;
      className?: string;
    };

export const FilterBar: React.FC<FilterBarProps> = (props) => {
  if ('filters' in props && props.filters) {
    const { filters, onReset, hasActiveFilters, className = '' } = props;
    return (
      <div className={`flex flex-wrap items-center gap-2 ${className}`}>
        {filters.map(filter => (
          <div key={filter.key} className="flex items-center gap-1.5">
            <span className="text-[11px] font-mono text-zinc-500 hidden sm:inline">
              {filter.label}:
            </span>
            <select
              value={filter.value}
              onChange={e => filter.onChange(e.target.value)}
              className="text-xs bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1 text-zinc-200 focus:outline-none focus:border-zinc-700 transition-colors"
            >
              {filter.options.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        ))}

        {hasActiveFilters && onReset && (
          <button
            onClick={onReset}
            className="flex items-center gap-1 px-2 py-1 text-[11px] font-mono text-zinc-400 hover:text-zinc-200 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded transition-colors"
            title="Limpar todos os filtros"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Limpar</span>
          </button>
        )}
      </div>
    );
  }

  // Classic Tabbed Filter Bar
  const { options, activeId, onChange, className = '' } = props;
  return (
    <div className={`flex items-center gap-1 p-1 bg-zinc-900 border border-zinc-800 rounded overflow-x-auto ${className}`}>
      {options?.map(opt => {
        const isActive = opt.id === activeId;
        return (
          <button
            key={opt.id}
            onClick={() => onChange(opt.id)}
            className={`px-3 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              isActive
                ? 'bg-zinc-800 text-zinc-100 shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
            }`}
          >
            <span>{opt.label}</span>
            {opt.count !== undefined && (
              <span className="text-[10px] font-mono tabular-nums text-zinc-400">
                ({opt.count})
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
