/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuditLog } from '../../types';
import { ChevronDown, ChevronRight, Terminal, User, Calendar, Shield } from 'lucide-react';

interface AuditTimelineProps {
  logs: AuditLog[];
  className?: string;
}

export const AuditTimeline: React.FC<AuditTimelineProps> = ({ logs, className = '' }) => {
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedLogId(prev => (prev === id ? null : id));
  };

  if (logs.length === 0) {
    return (
      <div className="p-8 text-center text-xs text-zinc-500 italic border border-zinc-800 rounded bg-zinc-950/40">
        Nenhum registro de auditoria corresponde aos critérios de busca.
      </div>
    );
  }

  return (
    <div className={`space-y-2 font-sans ${className}`}>
      {logs.map(log => {
        const isExpanded = expandedLogId === log.id;
        const formattedDate = new Date(log.created_at).toLocaleString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        });

        const actionColor = {
          LOGIN: 'text-sky-400 bg-sky-950/40 border-sky-800/40',
          LOGOUT: 'text-zinc-400 bg-zinc-900 border-zinc-800',
          CREATE: 'text-emerald-400 bg-emerald-950/40 border-emerald-800/40',
          UPDATE: 'text-blue-400 bg-blue-950/40 border-blue-800/40',
          STATUS_CHANGE: 'text-amber-400 bg-amber-950/40 border-amber-800/40',
          PERM_CHANGE: 'text-purple-400 bg-purple-950/40 border-purple-800/40',
          DELETE: 'text-rose-400 bg-rose-950/40 border-rose-800/40',
          PASSWORD_RESET: 'text-amber-400 bg-amber-950/40 border-amber-800/40',
        }[log.action] || 'text-zinc-400 bg-zinc-900 border-zinc-800';

        return (
          <div
            key={log.id}
            className="border border-zinc-800/80 rounded bg-zinc-900/60 hover:border-zinc-700/80 transition-colors overflow-hidden"
          >
            <div
              onClick={() => toggleExpand(log.id)}
              className="flex items-center justify-between p-3 cursor-pointer text-xs select-none"
            >
              <div className="flex items-center gap-3 min-w-0">
                <button className="text-zinc-500 hover:text-zinc-300">
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>

                <span
                  className={`px-2 py-0.5 rounded text-[11px] font-mono border font-medium ${actionColor}`}
                >
                  {log.action}
                </span>

                <span className="font-mono text-zinc-300 font-semibold uppercase">
                  {log.resource}
                </span>

                <span className="text-zinc-500 hidden sm:inline">·</span>

                <span className="text-zinc-400 truncate hidden md:inline font-mono">
                  {log.user_email}
                </span>
              </div>

              <div className="flex items-center gap-3 shrink-0 text-zinc-500 font-mono text-[11px] tabular-nums">
                <span className="hidden lg:inline">{log.ip_address || '127.0.0.1'}</span>
                <span>{formattedDate}</span>
              </div>
            </div>

            {isExpanded && (
              <div className="px-5 py-3 border-t border-zinc-800 bg-zinc-950/70 text-xs space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-zinc-400 font-mono text-[11px] pb-2 border-b border-zinc-800/60">
                  <div>
                    <span className="text-zinc-500 block">ID do Registro:</span>
                    <span className="text-zinc-300">{log.id}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block">Identificador do Recurso:</span>
                    <span className="text-zinc-300">{log.resource_id || 'Global'}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block">Operador Autenticado:</span>
                    <span className="text-zinc-300">{log.user_email}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-semibold text-zinc-400 block mb-1 uppercase tracking-wider">
                    Payload & Metadados do Evento
                  </span>
                  <pre className="p-3 bg-zinc-950 rounded border border-zinc-800 font-mono text-[11px] text-amber-300/90 overflow-x-auto">
                    {JSON.stringify(log.details, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
