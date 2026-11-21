/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Position } from '../../types';
import { Layers } from 'lucide-react';

interface PositionCardProps {
  position: Position;
  onEdit?: (pos: Position) => void;
}

export const PositionCard: React.FC<PositionCardProps> = ({ position, onEdit }) => {
  return (
    <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-lg hover:border-zinc-700 transition-all flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-2">
          <div>
            <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider block">
              {position.code}
            </span>
            <h4 className="text-sm font-semibold text-zinc-100">{position.title}</h4>
          </div>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700/60 whitespace-nowrap">
            {position.level}
          </span>
        </div>

        <p className="text-xs text-zinc-400 mt-2 line-clamp-2 leading-relaxed">
          {position.description}
        </p>

        <div className="mt-3 pt-2 border-t border-zinc-800/80 flex items-center gap-1.5 text-xs text-zinc-500">
          <Layers className="w-3.5 h-3.5" />
          <span>{position.department_name || 'Departamento Geral'}</span>
        </div>
      </div>

      {onEdit && (
        <div className="mt-3 pt-2 border-t border-zinc-800/80 flex justify-end">
          <button
            onClick={() => onEdit(position)}
            className="px-2.5 py-1 text-xs text-amber-400 hover:text-amber-300 hover:bg-amber-950/30 rounded transition-colors"
          >
            Editar Cargo
          </button>
        </div>
      )}
    </div>
  );
};
