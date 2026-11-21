/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Department } from '../../types';
import { StatusBadge } from './StatusBadge';
import { Users, Briefcase } from 'lucide-react';

interface DepartmentCardProps {
  department: Department;
  onEdit?: (dept: Department) => void;
  onViewPositions?: (dept: Department) => void;
}

export const DepartmentCard: React.FC<DepartmentCardProps> = ({
  department,
  onEdit,
  onViewPositions,
}) => {
  return (
    <div className="p-5 bg-zinc-900/70 border border-zinc-800 rounded-lg hover:border-zinc-700 transition-all flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider block">
              {department.code}
            </span>
            <h4 className="text-sm font-semibold text-zinc-100">{department.name}</h4>
          </div>
          <StatusBadge status={department.status} />
        </div>

        <p className="text-xs text-zinc-400 mt-2 line-clamp-2 leading-relaxed">
          {department.description}
        </p>

        <div className="mt-4 pt-3 border-t border-zinc-800/80 space-y-1.5 text-xs text-zinc-400">
          <div className="flex items-center justify-between">
            <span className="text-zinc-500">Gestor Responsável:</span>
            <span className="text-zinc-200 font-medium">
              {department.manager_name || 'Não atribuído'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-zinc-500 flex items-center gap-1">
              <Users className="w-3.5 h-3.5" /> Quadro Total:
            </span>
            <span className="font-mono tabular-nums text-zinc-200">
              {department.headcount || 0} integrantes
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-end gap-2">
        {onViewPositions && (
          <button
            onClick={() => onViewPositions(department)}
            className="px-2.5 py-1 text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded transition-colors inline-flex items-center gap-1"
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Cargos</span>
          </button>
        )}
        {onEdit && (
          <button
            onClick={() => onEdit(department)}
            className="px-2.5 py-1 text-xs font-medium text-amber-400 hover:text-amber-300 hover:bg-amber-950/30 rounded transition-colors"
          >
            Editar
          </button>
        )}
      </div>
    </div>
  );
};
