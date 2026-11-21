/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface NavigationItemProps {
  label: string;
  icon: LucideIcon;
  active?: boolean;
  onClick: () => void;
  badge?: string | number;
  collapsed?: boolean;
}

export const NavigationItem: React.FC<NavigationItemProps> = ({
  label,
  icon: Icon,
  active,
  onClick,
  badge,
  collapsed = false,
}) => {
  return (
    <button
      onClick={onClick}
      title={collapsed ? label : undefined}
      className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-medium rounded transition-colors whitespace-nowrap group ${
        active
          ? 'bg-zinc-800 text-amber-400 font-semibold shadow-xs'
          : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
      } ${collapsed ? 'justify-center px-2' : ''}`}
    >
      <Icon
        className={`w-4 h-4 shrink-0 transition-colors ${
          active ? 'text-amber-400' : 'text-zinc-500 group-hover:text-zinc-300'
        }`}
      />
      {!collapsed && <span className="truncate flex-1 text-left">{label}</span>}
      {!collapsed && badge !== undefined && (
        <span className="text-[10px] font-mono tabular-nums px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-700/60 text-zinc-400">
          {badge}
        </span>
      )}
    </button>
  );
};
