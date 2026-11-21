/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Decision } from '../../types';
import { StatusBadge } from '../organization/StatusBadge';
import { Gavel, Calendar, Link2 } from 'lucide-react';

interface DecisionCardProps {
  decision: Decision;
  onEdit?: (dec: Decision) => void;
  onNavigateToCns?: (cnsCode: string) => void;
}

export const DecisionCard: React.FC<DecisionCardProps> = ({
  decision,
  onEdit,
  onNavigateToCns,
}) => {
  return (
    <div className="p-5 bg-zinc-900/80 border border-zinc-800 rounded-lg hover:border-zinc-700 transition-all flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded bg-zinc-800 text-amber-400">
              <Gavel className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-mono text-zinc-500 block uppercase tracking-wider">
                {decision.dec_code}
              </span>
              <h4 className="text-sm font-semibold text-zinc-100">{decision.title}</h4>
            </div>
          </div>
          <StatusBadge status={decision.status} />
        </div>

        <p className="text-xs text-zinc-300 mt-2.5 leading-relaxed">
          {decision.summary}
        </p>

        <div className="mt-3 p-3 bg-zinc-950/50 border border-zinc-800/80 rounded text-xs text-zinc-400">
          <strong className="text-zinc-300 block mb-1">Fundamentação & Motivação:</strong>
          <p className="line-clamp-2 leading-relaxed">{decision.rationale}</p>
        </div>

        {/* Cross-reference to CNS */}
        {decision.deliberation_cns_code && (
          <div className="mt-3 pt-2 border-t border-zinc-800/80 flex items-center justify-between text-xs">
            <span className="text-zinc-500 flex items-center gap-1.5">
              <Link2 className="w-3.5 h-3.5 text-amber-400" />
              Referência Deliberativa CNS:
            </span>
            <button
              onClick={() => onNavigateToCns?.(decision.deliberation_cns_code!)}
              className="font-mono text-amber-400 hover:text-amber-300 underline underline-offset-2 transition-colors cursor-pointer"
            >
              {decision.deliberation_cns_code}
            </button>
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
        <span className="truncate max-w-[150px]">
          Órgão: <strong className="text-zinc-300">{decision.decided_by}</strong>
        </span>

        <div className="flex items-center gap-3">
          <span className="font-mono tabular-nums text-zinc-500 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {decision.decided_at}
          </span>
          {onEdit && (
            <button
              onClick={() => onEdit(decision)}
              className="text-amber-400 hover:text-amber-300 font-medium"
            >
              Editar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
