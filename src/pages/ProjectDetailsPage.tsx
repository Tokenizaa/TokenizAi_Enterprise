/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { projectService } from '../services/projectService';
import { taskService } from '../services/taskService';
import { localStore } from '../services/supabaseClient';
import { Project, Task, ProjectStatus, PriorityLevel, TaskStatus } from '../types';
import { PageHeader } from '../components/layout/PageHeader';
import { StatusBadge } from '../components/organization/StatusBadge';
import { DataTable, Column } from '../components/data/DataTable';
import { KanbanBoard } from '../components/data/KanbanBoard';
import { Modal } from '../components/forms/Modal';
import { FormField } from '../components/forms/FormField';
import { TextInput } from '../components/forms/TextInput';
import { SelectInput } from '../components/forms/SelectInput';
import { TextArea } from '../components/forms/TextArea';
import { FormActions } from '../components/forms/FormActions';
import { ConfirmDialog } from '../components/forms/ConfirmDialog';
import {
  FolderGit2,
  Calendar,
  DollarSign,
  User,
  Layers,
  ArrowLeft,
  Plus,
  Trash2,
  CheckSquare,
  Kanban,
  Table as TableIcon,
  Clock,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

interface ProjectDetailsPageProps {
  projectId: string;
  onNavigate: (route: string) => void;
}

export const ProjectDetailsPage: React.FC<ProjectDetailsPageProps> = ({
  projectId,
  onNavigate,
}) => {
  const [project, setProject] = useState<Project | undefined>(projectService.getProjectById(projectId));
  const [tasks, setTasks] = useState<Task[]>([]);
  const [progress, setProgress] = useState({ total: 0, completed: 0, percentage: 0 });

  const [tabView, setTabView] = useState<'kanban' | 'table' | 'timeline'>('kanban');

  // Add Task Modal
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskCode, setTaskCode] = useState('');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskPriority, setTaskPriority] = useState<PriorityLevel>('medium');
  const [taskStatus, setTaskStatus] = useState<TaskStatus>('todo');
  const [taskDueDate, setTaskDueDate] = useState('2026-06-30');
  const [assigneeId, setAssigneeId] = useState('');
  const [formError, setFormError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Edit Task
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const members = localStore.getProfiles();
  const agents = localStore.getAgents();

  const refreshData = () => {
    const current = projectService.getProjectById(projectId);
    setProject(current);
    if (current) {
      const projTasks = projectService.getProjectTasks(current.id);
      setTasks(projTasks);
      setProgress(projectService.getProjectProgress(current.id));
    }
  };

  useEffect(() => {
    refreshData();
    return localStore.subscribe(refreshData);
  }, [projectId]);

  if (!project) {
    return (
      <div className="p-8 text-center bg-zinc-900 border border-zinc-800 rounded-lg">
        <FolderGit2 className="w-8 h-8 text-zinc-500 mx-auto mb-2" />
        <h3 className="text-sm font-semibold text-zinc-200">Projeto não localizado</h3>
        <button
          onClick={() => onNavigate('/projects')}
          className="mt-4 px-3.5 py-1.5 text-xs font-medium text-amber-400 bg-zinc-800 rounded"
        >
          Voltar ao Portfólio
        </button>
      </div>
    );
  }

  const handleStatusChange = (newStatus: ProjectStatus) => {
    const updated = projectService.updateProject(project.id, { status: newStatus });
    setProject(updated);
  };

  const openNewTaskModal = (initialStatus: TaskStatus = 'todo') => {
    setEditingTask(null);
    setTaskCode(`TSK-${Math.floor(100 + Math.random() * 900)}`);
    setTaskTitle('');
    setTaskDesc('');
    setTaskPriority('medium');
    setTaskStatus(initialStatus);
    setTaskDueDate(project.due_date);
    setAssigneeId(members[0]?.id || '');
    setFormError('');
    setIsTaskModalOpen(true);
  };

  const openEditTaskModal = (task: Task) => {
    setEditingTask(task);
    setTaskCode(task.code);
    setTaskTitle(task.title);
    setTaskDesc(task.description);
    setTaskPriority(task.priority);
    setTaskStatus(task.status);
    setTaskDueDate(task.due_date);
    setAssigneeId(task.assignee_id || '');
    setFormError('');
    setIsTaskModalOpen(true);
  };

  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim() || !taskCode.trim()) {
      setFormError('Código e título da atividade são obrigatórios.');
      return;
    }

    const matchedMember = members.find(m => m.id === assigneeId);
    const matchedAgent = agents.find(a => a.id === assigneeId);
    const assigneeName = matchedMember?.full_name || matchedAgent?.name;
    const assigneeType = matchedAgent ? 'agent' : 'user';

    if (editingTask) {
      taskService.updateTask(editingTask.id, {
        code: taskCode,
        title: taskTitle,
        description: taskDesc,
        priority: taskPriority,
        status: taskStatus,
        due_date: taskDueDate,
        assignee_id: assigneeId || undefined,
        assignee_name: assigneeName,
        assignee_type: assigneeType,
      });
    } else {
      taskService.createTask({
        project_id: project.id,
        project_name: project.name,
        code: taskCode,
        title: taskTitle,
        description: taskDesc,
        status: taskStatus,
        priority: taskPriority,
        due_date: taskDueDate,
        reporter_id: localStore.getSessionUser()?.id || 'usr-001',
        reporter_name: localStore.getSessionUser()?.full_name || 'Admin',
        assignee_id: assigneeId || undefined,
        assignee_name: assigneeName,
        assignee_type: assigneeType,
      });
    }

    setIsTaskModalOpen(false);
  };

  const handleTaskStatusChange = (taskId: string, newStatus: TaskStatus) => {
    taskService.updateTaskStatus(taskId, newStatus);
  };

  const handleDelete = () => {
    projectService.deleteProject(project.id);
    onNavigate('/projects');
  };

  const taskColumns: Column<Task>[] = [
    {
      key: 'code',
      header: 'Código',
      sortable: true,
      width: '110px',
      accessor: t => <span className="font-mono text-zinc-400 font-medium">{t.code}</span>,
    },
    {
      key: 'title',
      header: 'Atividade',
      sortable: true,
      accessor: t => (
        <div>
          <span className="font-semibold text-zinc-100 block">{t.title}</span>
          <span className="text-[11px] text-zinc-400 line-clamp-1">{t.description}</span>
        </div>
      ),
    },
    {
      key: 'assignee_name',
      header: 'Responsável',
      sortable: true,
      accessor: t => (
        <span className="text-zinc-300 font-mono text-xs flex items-center gap-1.5">
          {t.assignee_type === 'agent' ? '🤖' : '👤'} {t.assignee_name || 'Não alocado'}
        </span>
      ),
    },
    {
      key: 'due_date',
      header: 'Prazo',
      sortable: true,
      align: 'center',
      accessor: t => (
        <span className="font-mono tabular-nums text-zinc-400 text-xs">
          {t.due_date}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center',
      accessor: t => <StatusBadge status={t.status} />,
    },
    {
      key: 'actions',
      header: 'Ação',
      align: 'right',
      accessor: t => (
        <button
          onClick={() => openEditTaskModal(t)}
          className="px-2 py-1 text-xs rounded border border-zinc-800 text-zinc-300 hover:text-amber-400 hover:bg-zinc-800 transition-colors"
        >
          Editar
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <button
          onClick={() => onNavigate('/projects')}
          className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 mb-3 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Voltar ao Portfólio de Projetos</span>
        </button>

        <PageHeader
          kicker={`${project.code} · ${project.department_name || 'Geral'}`}
          title={project.name}
          description={project.description}
          actions={
            <div className="flex items-center gap-2">
              <StatusBadge status={project.priority} />
              <StatusBadge status={project.status} />
              <select
                value={project.status}
                onChange={e => handleStatusChange(e.target.value as ProjectStatus)}
                className="px-2.5 py-1.5 text-xs bg-zinc-900 border border-zinc-800 rounded text-zinc-200"
              >
                <option value="planning">Planejamento</option>
                <option value="in_progress">Em Andamento</option>
                <option value="on_hold">Pausado</option>
                <option value="completed">Concluído</option>
                <option value="cancelled">Cancelado</option>
              </select>
              <button
                onClick={() => setIsDeleting(true)}
                className="p-1.5 text-rose-400 hover:bg-rose-950/40 border border-zinc-800 rounded transition-colors"
                title="Excluir projeto"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          }
        />
      </div>

      {/* KPI Details Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 bg-zinc-900/60 border border-zinc-800 rounded-lg text-xs">
        <div>
          <span className="text-zinc-500 block mb-1">Líder do Projeto:</span>
          <span className="text-zinc-200 font-semibold">{project.lead_name || 'Não atribuído'}</span>
        </div>

        <div>
          <span className="text-zinc-500 block mb-1">Período de Execução:</span>
          <span className="font-mono text-zinc-300">
            {project.start_date} → {project.due_date}
          </span>
        </div>

        <div>
          <span className="text-zinc-500 block mb-1">Orçamento Aprovado:</span>
          <span className="font-mono tabular-nums text-amber-400 font-semibold">
            R$ {Number(project.budget).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
        </div>

        <div>
          <span className="text-zinc-500 block mb-1">Taxa de Conclusão:</span>
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-zinc-100">{progress.percentage}%</span>
            <span className="text-zinc-500">
              ({progress.completed}/{progress.total} tarefas)
            </span>
          </div>
          <div className="w-full h-1 bg-zinc-800 rounded-full mt-1.5 overflow-hidden">
            <div
              className="h-full bg-amber-400 rounded-full"
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Project Tasks Section with View Switcher */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-amber-400" />
            <h3 className="text-base font-semibold text-zinc-100">
              Execução de Demandas ({tasks.length})
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded p-0.5">
              <button
                onClick={() => setTabView('kanban')}
                className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                  tabView === 'kanban' ? 'bg-zinc-800 text-amber-400' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Kanban className="w-3.5 h-3.5" />
                <span>Quadro Kanban</span>
              </button>
              <button
                onClick={() => setTabView('table')}
                className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                  tabView === 'table' ? 'bg-zinc-800 text-amber-400' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span>Tabela</span>
              </button>
              <button
                onClick={() => setTabView('timeline')}
                className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                  tabView === 'timeline' ? 'bg-zinc-800 text-amber-400' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Linha do Tempo</span>
              </button>
            </div>

            <button
              onClick={() => openNewTaskModal('todo')}
              className="px-3 py-1.5 text-xs font-semibold text-zinc-950 bg-amber-400 hover:bg-amber-300 rounded transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nova Tarefa</span>
            </button>
          </div>
        </div>

        {tabView === 'kanban' && (
          <KanbanBoard
            tasks={tasks}
            onTaskStatusChange={handleTaskStatusChange}
            onEditTask={openEditTaskModal}
            onQuickAddTask={status => openNewTaskModal(status)}
          />
        )}

        {tabView === 'table' && (
          <DataTable
            data={tasks}
            columns={taskColumns}
            keyExtractor={t => t.id}
            pageSize={6}
            emptyTitle="Nenhuma tarefa cadastrada para este projeto"
            emptyDescription="Crie atividades e atribua a membros da equipe ou agentes de IA."
            emptyActionLabel="Adicionar Primeira Tarefa"
            onEmptyAction={() => openNewTaskModal('todo')}
          />
        )}

        {tabView === 'timeline' && (
          <div className="p-6 bg-zinc-900/60 border border-zinc-800 rounded-lg space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Cronograma de Entregas & Marcos Temporais
              </span>
              <span className="text-[11px] font-mono text-zinc-500">
                Data Final: {project.due_date}
              </span>
            </div>

            {tasks.length === 0 ? (
              <p className="text-xs text-zinc-500 italic py-4 text-center">
                Sem tarefas registradas para plotagem da linha do tempo.
              </p>
            ) : (
              <div className="space-y-3 relative before:absolute before:inset-0 before:left-3 before:w-0.5 before:bg-zinc-800">
                {tasks
                  .sort((a, b) => a.due_date.localeCompare(b.due_date))
                  .map(t => {
                    const isDone = t.status === 'done';
                    return (
                      <div key={t.id} className="relative flex items-start gap-4 pl-8 text-xs">
                        <div
                          className={`absolute left-1.5 top-1.5 w-3 h-3 rounded-full border-2 ${
                            isDone
                              ? 'bg-emerald-400 border-zinc-950 ring-2 ring-emerald-500/30'
                              : 'bg-zinc-900 border-amber-400'
                          }`}
                        />
                        <div className="flex-1 p-3 bg-zinc-950/70 border border-zinc-800 rounded flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[10px] text-zinc-500">{t.code}</span>
                              <span className="font-semibold text-zinc-200">{t.title}</span>
                            </div>
                            <span className="text-[11px] text-zinc-400 block mt-0.5">
                              Executor: {t.assignee_type === 'agent' ? '🤖' : '👤'} {t.assignee_name || 'Não alocado'}
                            </span>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="font-mono tabular-nums text-zinc-400 text-[11px]">
                              {t.due_date}
                            </span>
                            <StatusBadge status={t.status} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal Add/Edit Task */}
      <Modal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        title={editingTask ? 'Editar Tarefa do Projeto' : 'Nova Tarefa do Projeto'}
        description={`Vinculada ao projeto "${project.name}"`}
        maxWidth="lg"
      >
        <form onSubmit={handleSaveTask} className="space-y-4">
          {formError && (
            <p className="text-xs text-rose-400 bg-rose-950/40 p-2 rounded border border-rose-800/40">
              {formError}
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Código da Tarefa" required helperText="Ex: TSK-201">
              <TextInput
                value={taskCode}
                onChange={e => setTaskCode(e.target.value.toUpperCase())}
                placeholder="TSK-XXX"
                required
              />
            </FormField>

            <FormField label="Prioridade">
              <SelectInput
                value={taskPriority}
                onChange={e => setTaskPriority(e.target.value as any)}
                options={[
                  { value: 'low', label: 'Baixa' },
                  { value: 'medium', label: 'Média' },
                  { value: 'high', label: 'Alta' },
                  { value: 'urgent', label: 'Urgente' },
                ]}
              />
            </FormField>
          </div>

          <FormField label="Título da Atividade" required>
            <TextInput
              value={taskTitle}
              onChange={e => setTaskTitle(e.target.value)}
              placeholder="Ex: Auditoria de Segurança nas APIs"
              required
            />
          </FormField>

          <FormField label="Descrição da Tarefa">
            <TextArea
              value={taskDesc}
              onChange={e => setTaskDesc(e.target.value)}
              placeholder="Detalhamento técnico ou procedimental..."
              rows={3}
            />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormField label="Status Atual">
              <SelectInput
                value={taskStatus}
                onChange={e => setTaskStatus(e.target.value as any)}
                options={[
                  { value: 'todo', label: 'A Fazer' },
                  { value: 'in_progress', label: 'Em Andamento' },
                  { value: 'in_review', label: 'Em Revisão' },
                  { value: 'blocked', label: 'Impedido' },
                  { value: 'done', label: 'Concluído' },
                ]}
              />
            </FormField>

            <FormField label="Responsável">
              <SelectInput
                value={assigneeId}
                onChange={e => setAssigneeId(e.target.value)}
                options={[
                  { value: '', label: 'Não alocado' },
                  { value: '---', label: '--- Membros da Equipe ---' },
                  ...members.map(m => ({
                    value: m.id,
                    label: `👤 ${m.full_name} (${m.email})`,
                  })),
                  { value: '---', label: '--- Agentes Autônomos de IA ---' },
                  ...agents.map(a => ({
                    value: a.id,
                    label: `🤖 ${a.name} (${a.code})`,
                  })),
                ]}
              />
            </FormField>

            <FormField label="Data Limite (Prazo)">
              <TextInput
                type="date"
                value={taskDueDate}
                onChange={e => setTaskDueDate(e.target.value)}
              />
            </FormField>
          </div>

          <FormActions
            onCancel={() => setIsTaskModalOpen(false)}
            submitLabel={editingTask ? 'Atualizar Tarefa' : 'Criar Tarefa no Projeto'}
          />
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={isDeleting}
        onClose={() => setIsDeleting(false)}
        onConfirm={handleDelete}
        title="Excluir Projeto"
        message={`Confirma a exclusão definitiva do projeto "${project.name}" (${project.code})? Todas as tarefas vinculadas também serão removidas.`}
        confirmLabel="Excluir Definitivamente"
      />
    </div>
  );
};
