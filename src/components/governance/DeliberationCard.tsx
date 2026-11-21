/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Deliberation } from '../../types';
import { StatusBadge } from '../organization/StatusBadge';
import { Scale, Users, Calendar, Link2, FileCheck } from 'lucide-react';

interface DeliberationCardProps {
  deliberation: Deliberation;
  onEdit?: (delib: Deliberation) => void;
  onNavigateToDec?: (decCode: string) => void;
  onNavigateToDelib?: (delibFile: string) => void;
}

export const DeliberationCard: React.FC<DeliberationCardProps> = ({
  deliberation,
  onEdit,
  onNavigateToDec,
  onNavigateToDelib,
}) => {
  return (
    <div className="p-5 bg-zinc-900/80 border border-zinc-800 rounded-lg hover:border-zinc-700 transition-all flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded bg-zinc-800 text-sky-400">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-mono text-zinc-500 block uppercase tracking-wider">
                {deliberation.cns_code}
              </span>
              <h4 className="text-sm font-semibold text-zinc-100">{deliberation.title}</h4>
            </div>
          </div>
          <StatusBadge status={deliberation.status} />
        </div>

        <p className="text-xs text-zinc-300 mt-2.5 leading-relaxed">
          {deliberation.decision_summary}
        </p>

        <div className="mt-4 pt-3 border-t border-zinc-800/80 grid grid-cols-2 gap-2 text-xs text-zinc-400">
          <div>
            <span className="text-zinc-500 block text-[11px]">Presidente da Sessão:</span>
            <span className="text-zinc-200 font-medium">{deliberation.president}</span>
          </div>
          <div>
            <span className="text-zinc-500 block text-[11px]">Quórum Registrado:</span>
            <span className="text-zinc-200 font-mono text-[11px]">{deliberation.quorum}</span>
          </div>
        </div>

        {/* Cross-references to DEC and DELIB */}
        <div className="mt-3 pt-2 border-t border-zinc-800/80 space-y-1 text-xs">
          {deliberation.dec_code_ref && (
            <div className="flex items-center justify-between">
              <span className="text-zinc-500 flex items-center gap-1.5">
                <Link2 className="w-3.5 h-3.5 text-sky-400" />
                Decreto Vinculado (DEC):
              </span>
              <button
                onClick={() => onNavigateToDec?.(deliberation.dec_code_ref!)}
                className="font-mono text-sky-400 hover:text-sky-300 underline underline-offset-2 transition-colors cursor-pointer"
              >
                {deliberation.dec_code_ref}
              </button>
            </div>
          )}

          {deliberation.delib_file_ref && (
            <div className="flex items-center justify-between">
              <span className="text-zinc-500 flex items-center gap-1.5">
                <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
                Arquivo Integral (DELIB):
              </span>
              <button
                onClick={() => onNavigateToDelib?.(deliberation.delib_file_ref!)}
                className="font-mono text-emerald-400 hover:text-emerald-300 underline underline-offset-2 transition-colors cursor-pointer"
              >
                {deliberation.delib_file_ref}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
        <span className="font-mono tabular-nums text-zinc-500 flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5" />
          {deliberation.session_date}
        </span>

        {onEdit && (
          <button
            onClick={() => onEdit(deliberation)}
            className="text-amber-400 hover:text-amber-300 font-medium"
          >
            Editar Deliberação
          </button>
        )}
      </div>
    </div>
  );
};
