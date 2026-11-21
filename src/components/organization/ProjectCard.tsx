/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Project } from '../../types';
import { StatusBadge } from './StatusBadge';
import { projectService } from '../../services/projectService';
import { Calendar, DollarSign, User } from 'lucide-react';

interface ProjectCardProps {
  project: Project;
  onClick?: (project: Project) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onClick }) => {
  const progress = projectService.getProjectProgress(project.id);

  return (
    <div
      onClick={() => onClick?.(project)}
      className={`p-5 bg-zinc-900/80 border border-zinc-800 rounded-lg hover:border-zinc-700 transition-all flex flex-col justify-between ${
        onClick ? 'cursor-pointer hover:bg-zinc-850/40' : ''
      }`}
    >
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider block">
              {project.code}
            </span>
            <h4 className="text-sm font-semibold text-zinc-100">{project.name}</h4>
          </div>
          <div className="flex items-center gap-1.5">
            <StatusBadge status={project.priority} />
            <StatusBadge status={project.status} />
          </div>
        </div>

        <p className="text-xs text-zinc-400 mt-2 line-clamp-2 leading-relaxed">
          {project.description}
        </p>

        {/* Real Progress indicator derived from tasks */}
        <div className="mt-4 pt-3 border-t border-zinc-800/80">
          <div className="flex justify-between items-center text-xs mb-1.5">
            <span className="text-zinc-500 font-medium">Progresso de Tarefas:</span>
            <span className="font-mono tabular-nums text-zinc-200">
              {progress.completed}/{progress.total} ({progress.percentage}%)
            </span>
          </div>
          <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-400 transition-all duration-300 rounded-full"
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
        <div className="flex items-center gap-1 text-zinc-400">
          <User className="w-3.5 h-3.5 text-zinc-500" />
          <span className="truncate max-w-[120px]">{project.lead_name || 'Líder não atribuído'}</span>
        </div>

        <div className="flex items-center gap-1 font-mono tabular-nums text-zinc-400">
          <Calendar className="w-3.5 h-3.5 text-zinc-500" />
          <span>{project.due_date}</span>
        </div>
      </div>
    </div>
  );
};
