/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ChevronRight } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, className = '' }) => {
  return (
    <nav className={`flex items-center gap-1.5 text-xs text-zinc-400 font-sans ${className}`} aria-label="Breadcrumb">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <React.Fragment key={index}>
            {index > 0 && (
              <ChevronRight className="w-3.5 h-3.5 text-zinc-600 shrink-0" aria-hidden="true" />
            )}
            {item.onClick && !isLast ? (
              <button
                onClick={item.onClick}
                className="hover:text-zinc-200 transition-colors whitespace-nowrap"
              >
                {item.label}
              </button>
            ) : (
              <span
                className={`whitespace-nowrap ${isLast ? 'text-zinc-200 font-medium' : 'text-zinc-400'}`}
                aria-current={isLast ? 'page' : undefined}
              >
                {item.label}
              </span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
