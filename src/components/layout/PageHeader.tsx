/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  subtitle?: string;
  kicker?: string;
  actions?: React.ReactNode;
  primaryAction?: {
    label: string;
    onClick: () => void;
    icon?: React.ComponentType<{ className?: string }>;
  };
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  subtitle,
  kicker,
  actions,
  primaryAction,
  className = '',
}) => {
  const finalDescription = description || subtitle;

  return (
    <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-zinc-800 ${className}`}>
      <div>
        {kicker && (
          <span className="text-[11px] font-mono uppercase tracking-wider text-amber-400 block mb-1">
            {kicker}
          </span>
        )}
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-100 font-sans">
          {title}
        </h1>
        {finalDescription && (
          <p className="text-xs text-zinc-400 mt-1 max-w-2xl leading-relaxed">
            {finalDescription}
          </p>
        )}
      </div>

      {(actions || primaryAction) && (
        <div className="flex items-center gap-2.5 shrink-0">
          {actions}
          {primaryAction && (
            <button
              onClick={primaryAction.onClick}
              className="px-3.5 py-1.5 text-xs font-semibold text-zinc-950 bg-amber-400 hover:bg-amber-300 rounded transition-colors flex items-center gap-1.5 whitespace-nowrap shadow-xs"
            >
              {primaryAction.icon && React.createElement(primaryAction.icon, { className: 'w-4 h-4' })}
              <span>{primaryAction.label}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
