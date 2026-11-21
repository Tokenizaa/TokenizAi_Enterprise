/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface StatusBadgeProps {
  status: string;
  variant?: 'neutral' | 'success' | 'warning' | 'danger' | 'info';
  className?: string;
}

const STATUS_VARIANTS: Record<string, { label: string; textClass: string; bgClass: string }> = {
  // Common / General
  active: { label: 'Ativo', textClass: 'text-emerald-400', bgClass: 'bg-emerald-950/40 border-emerald-800/40' },
  inactive: { label: 'Inativo', textClass: 'text-zinc-400', bgClass: 'bg-zinc-900 border-zinc-800' },
  suspended: { label: 'Suspenso', textClass: 'text-rose-400', bgClass: 'bg-rose-950/40 border-rose-800/40' },
  invited: { label: 'Convidado', textClass: 'text-amber-400', bgClass: 'bg-amber-950/40 border-amber-800/40' },

  // Agents
  standby: { label: 'Em Espera', textClass: 'text-amber-400', bgClass: 'bg-amber-950/40 border-amber-800/40' },
  training: { label: 'Em Ajuste', textClass: 'text-sky-400', bgClass: 'bg-sky-950/40 border-sky-800/40' },
  disabled: { label: 'Desativado', textClass: 'text-zinc-500', bgClass: 'bg-zinc-900 border-zinc-800' },

  // Projects
  planning: { label: 'Planejamento', textClass: 'text-sky-400', bgClass: 'bg-sky-950/40 border-sky-800/40' },
  in_progress: { label: 'Em Andamento', textClass: 'text-amber-400', bgClass: 'bg-amber-950/40 border-amber-800/40' },
  on_hold: { label: 'Pausado', textClass: 'text-zinc-400', bgClass: 'bg-zinc-900 border-zinc-800' },
  completed: { label: 'Concluído', textClass: 'text-emerald-400', bgClass: 'bg-emerald-950/40 border-emerald-800/40' },
  cancelled: { label: 'Cancelado', textClass: 'text-rose-400', bgClass: 'bg-rose-950/40 border-rose-800/40' },

  // Tasks
  todo: { label: 'A Fazer', textClass: 'text-zinc-400', bgClass: 'bg-zinc-900 border-zinc-800' },
  in_review: { label: 'Em Revisão', textClass: 'text-purple-400', bgClass: 'bg-purple-950/40 border-purple-800/40' },
  done: { label: 'Finalizado', textClass: 'text-emerald-400', bgClass: 'bg-emerald-950/40 border-emerald-800/40' },
  blocked: { label: 'Impedido', textClass: 'text-rose-400', bgClass: 'bg-rose-950/40 border-rose-800/40' },

  // Priorities
  low: { label: 'Baixa', textClass: 'text-zinc-400', bgClass: 'bg-zinc-900 border-zinc-800' },
  medium: { label: 'Média', textClass: 'text-blue-400', bgClass: 'bg-blue-950/40 border-blue-800/40' },
  high: { label: 'Alta', textClass: 'text-amber-400', bgClass: 'bg-amber-950/40 border-amber-800/40' },
  urgent: { label: 'Urgente', textClass: 'text-rose-400', bgClass: 'bg-rose-950/40 border-rose-800/40' },

  // Decisions
  draft: { label: 'Minuta', textClass: 'text-zinc-400', bgClass: 'bg-zinc-900 border-zinc-800' },
  ratified: { label: 'Homologada', textClass: 'text-sky-400', bgClass: 'bg-sky-950/40 border-sky-800/40' },
  in_effect: { label: 'Em Vigor', textClass: 'text-emerald-400', bgClass: 'bg-emerald-950/40 border-emerald-800/40' },
  superseded: { label: 'Revogada por Nova', textClass: 'text-amber-400', bgClass: 'bg-amber-950/40 border-amber-800/40' },
  revoked: { label: 'Revogada', textClass: 'text-rose-400', bgClass: 'bg-rose-950/40 border-rose-800/40' },

  // Deliberations
  convened: { label: 'Convocada', textClass: 'text-amber-400', bgClass: 'bg-amber-950/40 border-amber-800/40' },
  approved: { label: 'Aprovada por Quórum', textClass: 'text-emerald-400', bgClass: 'bg-emerald-950/40 border-emerald-800/40' },
  rejected: { label: 'Rejeitada', textClass: 'text-rose-400', bgClass: 'bg-rose-950/40 border-rose-800/40' },
  adjourned: { label: 'Adiada', textClass: 'text-zinc-400', bgClass: 'bg-zinc-900 border-zinc-800' },

  // Documents
  published: { label: 'Publicado', textClass: 'text-emerald-400', bgClass: 'bg-emerald-950/40 border-emerald-800/40' },
  archived: { label: 'Arquivado', textClass: 'text-zinc-500', bgClass: 'bg-zinc-900 border-zinc-800' },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const norm = status.toLowerCase();
  const config = STATUS_VARIANTS[norm] || {
    label: status,
    textClass: 'text-zinc-400',
    bgClass: 'bg-zinc-900 border-zinc-800',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-xs font-medium border rounded whitespace-nowrap ${config.bgClass} ${config.textClass} ${className}`}
    >
      {config.label}
    </span>
  );
};
