/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Task, TaskStatus, PriorityLevel } from '../../types';
import { StatusBadge } from '../organization/StatusBadge';
import {
  Plus,
  MoveRight,
  MoveLeft,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
  HelpCircle,
  Bot,
  User,
  GripVertical
} from 'lucide-react';

interface KanbanColumnConfig {
  id: TaskStatus;
  title: string;
  colorBorder: string;
  badgeClass: string;
}

const COLUMNS: KanbanColumnConfig[] = [
  { id: 'todo', title: 'A Fazer', colorBorder: 'border-zinc-700', badgeClass: 'bg-zinc-800 text-zinc-300' },
  { id: 'in_progress', title: 'Em Andamento', colorBorder: 'border-amber-500/40', badgeClass: 'bg-amber-950/40 text-amber-400 border border-amber-800/40' },
  { id: 'in_review', title: 'Em Revisão', colorBorder: 'border-purple-500/40', badgeClass: 'bg-purple-950/40 text-purple-400 border border-purple-800/40' },
  { id: 'blocked', title: 'Impedido', colorBorder: 'border-rose-500/40', badgeClass: 'bg-rose-950/40 text-rose-400 border border-rose-800/40' },
  { id: 'done', title: 'Concluído', colorBorder: 'border-emerald-500/40', badgeClass: 'bg-emerald-950/40 text-emerald-400 border border-emerald-800/40' },
];

interface KanbanBoardProps {
  tasks: Task[];
  onTaskStatusChange: (taskId: string, newStatus: TaskStatus) => void;
  onEditTask: (task: Task) => void;
  onQuickAddTask?: (initialStatus: TaskStatus) => void;
  className?: string;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  tasks,
  onTaskStatusChange,
  onEditTask,
  onQuickAddTask,
  className = '',
}) => {
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [activeDropColumn, setActiveDropColumn] = useState<TaskStatus | null>(null);

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedTaskId(taskId);
  };

  const handleDragOver = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (activeDropColumn !== status) {
      setActiveDropColumn(status);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    // Only clear if leaving to outside
  };

  const handleDrop = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    setActiveDropColumn(null);
    setDraggedTaskId(null);

    if (taskId) {
      const task = tasks.find(t => t.id === taskId);
      if (task && task.status !== status) {
        onTaskStatusChange(taskId, status);
      }
    }
  };

  // Helper for quick move buttons (left/right column)
  const moveTask = (task: Task, direction: 'prev' | 'next') => {
    const currentIndex = COLUMNS.findIndex(c => c.id === task.status);
    if (currentIndex === -1) return;

    const targetIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    if (targetIndex >= 0 && targetIndex < COLUMNS.length) {
      onTaskStatusChange(task.id, COLUMNS[targetIndex].id);
    }
  };

  return (
    <div className={`overflow-x-auto pb-4 ${className}`}>
      <div className="flex gap-4 min-w-[1050px] items-start">
        {COLUMNS.map(col => {
          const colTasks = tasks.filter(t => t.status === col.id);
          const isDropActive = activeDropColumn === col.id;
          const colIndex = COLUMNS.findIndex(c => c.id === col.id);

          return (
            <div
              key={col.id}
              onDragOver={e => handleDragOver(e, col.id)}
              onDragLeave={handleDragLeave}
              onDrop={e => handleDrop(e, col.id)}
              className={`flex-1 min-w-[210px] bg-zinc-900/60 rounded-lg border transition-all flex flex-col max-h-[calc(100vh-14rem)] ${
                isDropActive
                  ? 'border-amber-400/80 bg-zinc-850/80 shadow-lg shadow-amber-500/10'
                  : 'border-zinc-800/80 hover:border-zinc-700/80'
              }`}
            >
              {/* Column Header */}
              <div className="p-3 border-b border-zinc-800 flex items-center justify-between shrink-0 bg-zinc-950/40 rounded-t-lg">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-zinc-200">{col.title}</span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full tabular-nums ${col.badgeClass}`}>
                    {colTasks.length}
                  </span>
                </div>

                {onQuickAddTask && (
                  <button
                    onClick={() => onQuickAddTask(col.id)}
                    className="p-1 rounded text-zinc-500 hover:text-amber-400 hover:bg-zinc-800 transition-colors"
                    title={`Adicionar tarefa em ${col.title}`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Cards Container */}
              <div className="p-2 space-y-2.5 overflow-y-auto flex-1 min-h-[160px]">
                {colTasks.length === 0 ? (
                  <div
                    className={`h-28 rounded border border-dashed flex flex-col items-center justify-center p-3 text-center transition-colors ${
                      isDropActive ? 'border-amber-400/60 bg-amber-950/10' : 'border-zinc-800/60 bg-zinc-950/20'
                    }`}
                  >
                    <span className="text-[11px] text-zinc-500">
                      {isDropActive ? 'Solte a tarefa aqui' : 'Nenhuma tarefa'}
                    </span>
                  </div>
                ) : (
                  colTasks.map(task => {
                    const isDragging = draggedTaskId === task.id;

                    return (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={e => handleDragStart(e, task.id)}
                        onClick={() => onEditTask(task)}
                        className={`p-3 bg-zinc-950/80 border rounded-md hover:border-zinc-700 cursor-grab active:cursor-grabbing transition-all select-none shadow-xs group ${
                          isDragging ? 'opacity-40 scale-95 border-amber-400' : 'border-zinc-800/80'
                        }`}
                      >
                        {/* Top: Code & Priority */}
                        <div className="flex items-center justify-between gap-1 mb-1.5">
                          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                            {task.code}
                          </span>
                          <StatusBadge status={task.priority} />
                        </div>

                        {/* Title */}
                        <h5 className="text-xs font-semibold text-zinc-100 group-hover:text-amber-300 transition-colors line-clamp-2 leading-snug">
                          {task.title}
                        </h5>

                        {/* Project Name */}
                        {task.project_name && (
                          <span className="text-[10px] font-mono text-zinc-500 block mt-1 truncate">
                            {task.project_name}
                          </span>
                        )}

                        {/* Bottom: Assignee & Due Date */}
                        <div className="mt-3 pt-2 border-t border-zinc-850 flex items-center justify-between text-[11px] text-zinc-400">
                          <div className="flex items-center gap-1.5 truncate max-w-[130px]">
                            {task.assignee_type === 'agent' ? (
                              <div className="w-4 h-4 rounded bg-amber-400/10 text-amber-400 flex items-center justify-center shrink-0">
                                <Bot className="w-2.5 h-2.5" />
                              </div>
                            ) : (
                              <div className="w-4 h-4 rounded bg-zinc-800 text-zinc-400 flex items-center justify-center shrink-0">
                                <User className="w-2.5 h-2.5" />
                              </div>
                            )}
                            <span className="truncate font-mono text-[10px]">
                              {task.assignee_name || 'Livre'}
                            </span>
                          </div>

                          <span className="font-mono tabular-nums text-[10px] text-zinc-500 shrink-0">
                            {task.due_date}
                          </span>
                        </div>

                        {/* Quick Move Buttons (hover affordance for touch or keyboard users) */}
                        <div
                          className="mt-2 pt-1.5 border-t border-zinc-900 flex items-center justify-between opacity-80 group-hover:opacity-100 transition-opacity"
                          onClick={e => e.stopPropagation()}
                        >
                          <button
                            disabled={colIndex === 0}
                            onClick={() => moveTask(task, 'prev')}
                            className="p-1 rounded text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900 disabled:opacity-20 disabled:hover:bg-transparent"
                            title="Mover para coluna anterior"
                          >
                            <MoveLeft className="w-3 h-3" />
                          </button>

                          <span className="text-[9px] font-mono text-zinc-600 uppercase">
                            Arraste ou Mova
                          </span>

                          <button
                            disabled={colIndex === COLUMNS.length - 1}
                            onClick={() => moveTask(task, 'next')}
                            className="p-1 rounded text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900 disabled:opacity-20 disabled:hover:bg-transparent"
                            title="Mover para próxima coluna"
                          >
                            <MoveRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
