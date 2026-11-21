/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AuditLog } from '../../types';
import { Clock, ShieldCheck, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

interface ActivityTimelineProps {
  logs: AuditLog[];
  className?: string;
  maxItems?: number;
}

const ACTION_ICONS: Record<string, React.ReactNode> = {
  LOGIN: <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />,
  CREATE: <FileText className="w-3.5 h-3.5 text-emerald-400" />,
  STATUS_CHANGE: <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />,
  UPDATE: <Clock className="w-3.5 h-3.5 text-blue-400" />,
  DELETE: <AlertCircle className="w-3.5 h-3.5 text-rose-400" />,
};

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({
  logs,
  className = '',
  maxItems = 6,
}) => {
  const displayLogs = logs.slice(0, maxItems);

  if (displayLogs.length === 0) {
    return (
      <div className="p-4 text-center text-xs text-zinc-500 italic border border-zinc-800 rounded bg-zinc-950/40">
        Nenhum evento registrado no log recente.
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {displayLogs.map(log => {
        const icon = ACTION_ICONS[log.action] || <Clock className="w-3.5 h-3.5 text-zinc-400" />;
        const formattedDate = new Date(log.created_at).toLocaleString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        });

        return (
          <div
            key={log.id}
            className="flex items-start gap-3 p-3 bg-zinc-900/60 border border-zinc-800/80 rounded hover:border-zinc-700/80 transition-colors"
          >
            <div className="p-1.5 rounded bg-zinc-950 border border-zinc-800 shrink-0 mt-0.5">
              {icon}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-xs font-semibold text-zinc-200 truncate">
                  {log.action} · {log.resource.toUpperCase()}
                </span>
                <span className="text-[11px] font-mono tabular-nums text-zinc-500 shrink-0">
                  {formattedDate}
                </span>
              </div>

              <p className="text-[11px] text-zinc-400 mt-0.5 truncate font-mono">
                Por: {log.user_email}
              </p>

              {log.details && (
                <div className="mt-1 text-[11px] text-zinc-400 font-mono truncate">
                  {Object.entries(log.details)
                    .map(([k, v]) => `${k}: ${v}`)
                    .join(' · ')}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
