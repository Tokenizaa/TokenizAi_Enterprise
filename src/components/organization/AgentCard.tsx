/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AIAgent } from '../../types';
import { StatusBadge } from './StatusBadge';
import { Bot, Cpu, Sparkles } from 'lucide-react';

interface AgentCardProps {
  agent: AIAgent;
  onToggleStatus?: (agent: AIAgent) => void;
  onViewDetails?: (agent: AIAgent) => void;
}

export const AgentCard: React.FC<AgentCardProps> = ({
  agent,
  onToggleStatus,
  onViewDetails,
}) => {
  return (
    <div className="p-5 bg-zinc-900/80 border border-zinc-800 rounded-lg hover:border-zinc-700 transition-all flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-zinc-800 border border-zinc-700/60 flex items-center justify-center text-amber-400">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-mono text-zinc-500 block uppercase tracking-wider">
                {agent.code} · v{agent.version}
              </span>
              <h4 className="text-sm font-semibold text-zinc-100">{agent.name}</h4>
            </div>
          </div>
          <StatusBadge status={agent.status} />
        </div>

        <p className="text-xs text-zinc-400 mt-2.5 line-clamp-2 leading-relaxed">
          {agent.purpose}
        </p>

        <div className="mt-4 pt-3 border-t border-zinc-800/80 space-y-2 text-xs">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="flex items-center gap-1.5 text-zinc-500">
              <Cpu className="w-3.5 h-3.5" /> Modelo Base:
            </span>
            <span className="font-mono text-zinc-300">{agent.model}</span>
          </div>

          {agent.config.capabilities && agent.config.capabilities.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {agent.config.capabilities.map((cap, idx) => (
                <span
                  key={idx}
                  className="text-[11px] text-zinc-400 font-mono bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800/80"
                >
                  {cap}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between">
        <span className="text-[11px] text-zinc-500">
          {agent.department_name || 'Departamento Geral'}
        </span>

        <div className="flex items-center gap-2">
          {onToggleStatus && (
            <button
              onClick={() => onToggleStatus(agent)}
              className="px-2.5 py-1 text-xs text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800 rounded border border-zinc-800 transition-colors"
            >
              {agent.status === 'active' ? 'Pausar' : 'Ativar'}
            </button>
          )}
          {onViewDetails && (
            <button
              onClick={() => onViewDetails(agent)}
              className="px-2.5 py-1 text-xs font-medium text-amber-400 hover:text-amber-300 hover:bg-amber-950/30 rounded transition-colors"
            >
              Configurações
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
