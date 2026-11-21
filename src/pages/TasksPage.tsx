/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { taskService } from '../services/taskService';
import { projectService } from '../services/projectService';
import { localStore } from '../services/supabaseClient';
import { Task, Project, TaskStatus, PriorityLevel, UserProfile, AIAgent } from '../types';
import { PageHeader } from '../components/layout/PageHeader';
import { DataTable, Column } from '../components/data/DataTable';
import { KanbanBoard } from '../components/data/KanbanBoard';
import { SearchInput } from '../components/data/SearchInput';
import { FilterBar } from '../components/data/FilterBar';
import { StatusBadge } from '../components/organization/StatusBadge';
import { Modal } from '../components/forms/Modal';
import { FormField } from '../components/forms/FormField';
import { TextInput } from '../components/forms/TextInput';
import { SelectInput } from '../components/forms/SelectInput';
import { TextArea } from '../components/forms/TextArea';
import { FormActions } from '../components/forms/FormActions';
import { ConfirmDialog } from '../components/forms/ConfirmDialog';
import {
  CheckSquare,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  RotateCcw,
  Kanban,
  Table as TableIcon
} from 'lucide-react';

interface TasksPageProps {
  onNavigate: (route: string) => void;
}

export const TasksPage: React.FC<TasksPageProps> = ({ onNavigate }) => {
  const [tasks, setTasks] = useState<Task[]>(taskService.getTasks());
  const [projects, setProjects] = useState<Project[]>(projectService.getProjects());
  const [members, setMembers] = useState<UserProfile[]>(localStore.getProfiles());
  const [agents, setAgents] = useState<AIAgent[]>(localStore.getAgents());

  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [assigneeFilter, setAssigneeFilter] = useState('all'); // all, human, agent
  const [projectFilter, setProjectFilter] = useState('all');

  // Feedback Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null);

  // Form Fields
  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState('');
  const [priority, setPriority] = useState<PriorityLevel>('medium');
  const [status, setStatus] = useState<TaskStatus>('todo');
  const [assigneeId, setAssigneeId] = useState('');
  const [dueDate, setDueDate] = useState('2026-06-30');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    const handleUpdate = () => {
      setTasks(taskService.getTasks());
      setProjects(projectService.getProjects());
      setMembers(localStore.getProfiles());
      setAgents(localStore.getAgents());
    };
    return localStore.subscribe(handleUpdate);
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const openCreateModal = (initialStatus: TaskStatus = 'todo') => {
    setEditingTask(null);
    setCode(`TSK-${Math.floor(100 + Math.random() * 900)}`);
    setTitle('');
    setDescription('');
    setProjectId(projects[0]?.id || '');
    setPriority('medium');
    setStatus(initialStatus);
    setAssigneeId(members[0]?.id || '');
    setDueDate(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setCode(task.code);
    setTitle(task.title);
    setDescription(task.description);
    setProjectId(task.project_id);
    setPriority(task.priority);
    setStatus(task.status);
    setAssigneeId(task.assignee_id || '');
    setDueDate(task.due_date);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !code.trim() || !projectId) {
      setFormError('Código, título e projeto são obrigatórios.');
      return;
    }

    const matchedProject = projects.find(p => p.id === projectId);
    const matchedMember = members.find(m => m.id === assigneeId);
    const matchedAgent = agents.find(a => a.id === assigneeId);

    const assigneeName = matchedMember?.full_name || matchedAgent?.name;
    const assigneeType = matchedAgent ? 'agent' : 'user';

    if (editingTask) {
      taskService.updateTask(editingTask.id, {
        code,
        title,
        description,
        project_id: projectId,
        project_name: matchedProject?.name,
        priority,
        status,
        due_date: dueDate,
        assignee_id: assigneeId || undefined,
        assignee_name: assigneeName,
        assignee_type: assigneeType,
      });
      triggerToast(`Tarefa ${code} atualizada com sucesso.`);
    } else {
      taskService.createTask({
        code,
        title,
        description,
        project_id: projectId,
        project_name: matchedProject?.name,
        priority,
        status,
        due_date: dueDate,
        reporter_id: localStore.getSessionUser()?.id || 'usr-001',
        reporter_name: localStore.getSessionUser()?.full_name || 'Admin',
        assignee_id: assigneeId || undefined,
        assignee_name: assigneeName,
        assignee_type: assigneeType,
      });
      triggerToast(`Nova tarefa ${code} criada.`);
    }

    setIsModalOpen(false);
  };

  const handleStatusChange = (taskId: string, newStatus: TaskStatus) => {
    taskService.updateTaskStatus(taskId, newStatus);
    const target = tasks.find(t => t.id === taskId);
    triggerToast(`Tarefa ${target?.code || taskId} movida para ${newStatus}.`);
  };

  const handleToggleDone = (task: Task) => {
    const nextStatus: TaskStatus = task.status === 'done' ? 'in_progress' : 'done';
    handleStatusChange(task.id, nextStatus);
  };

  const handleDelete = () => {
    if (deleteTarget) {
      taskService.deleteTask(deleteTarget.id);
      triggerToast(`Tarefa ${deleteTarget.code} excluída.`);
      setDeleteTarget(null);
    }
  };

  const filteredTasks = tasks.filter(t => {
    const matchesSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.code.toLowerCase().includes(search.toLowerCase()) ||
      (t.project_name && t.project_name.toLowerCase().includes(search.toLowerCase())) ||
      (t.assignee_name && t.assignee_name.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    const matchesProject = projectFilter === 'all' || t.project_id === projectFilter;

    let matchesAssignee = true;
    if (assigneeFilter === 'human') matchesAssignee = t.assignee_type === 'user';
    if (assigneeFilter === 'agent') matchesAssignee = t.assignee_type === 'agent';

    return matchesSearch && matchesStatus && matchesAssignee && matchesProject;
  });

  const columns: Column<Task>[] = [
    {
      key: 'code',
      header: 'Código',
      sortable: true,
      width: '100px',
      accessor: t => <span className="font-mono text-zinc-400 font-medium">{t.code}</span>,
    },
    {
      key: 'title',
      header: 'Título & Projeto',
      sortable: true,
      accessor: t => (
        <div>
          <span className="font-semibold text-zinc-100 block">{t.title}</span>
          <span className="text-[11px] text-zinc-400 line-clamp-1">
            Projeto: <strong className="text-zinc-300">{t.project_name || 'Geral'}</strong>
          </span>
        </div>
      ),
    },
    {
      key: 'assignee_name',
      header: 'Atribuído a',
      sortable: true,
      accessor: t => (
        <span className="text-zinc-300 font-mono text-xs flex items-center gap-1.5">
          {t.assignee_type === 'agent' ? '🤖' : '👤'} {t.assignee_name || 'Não alocado'}
        </span>
      ),
    },
    {
      key: 'priority',
      header: 'Prioridade',
      align: 'center',
      sortable: true,
      accessor: t => <StatusBadge status={t.priority} />,
    },
    {
      key: 'due_date',
      header: 'Vencimento',
      align: 'center',
      sortable: true,
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
      header: 'Ações',
      align: 'right',
      accessor: t => (
        <div className="flex items-center justify-end gap-1.5" onClick={e => e.stopPropagation()}>
          <button
            onClick={() => handleToggleDone(t)}
            className={`p-1 rounded transition-colors ${
              t.status === 'done'
                ? 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'
                : 'text-emerald-400 hover:bg-emerald-950/40'
            }`}
            title={t.status === 'done' ? 'Reabrir tarefa' : 'Marcar como concluída'}
          >
            {t.status === 'done' ? <RotateCcw className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => openEditModal(t)}
            className="p-1 rounded text-zinc-400 hover:text-amber-400 hover:bg-zinc-800 transition-colors"
            title="Editar tarefa"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setDeleteTarget(t)}
            className="p-1 rounded text-zinc-400 hover:text-rose-400 hover:bg-zinc-800 transition-colors"
            title="Excluir tarefa"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-zinc-900 border border-amber-500/50 text-zinc-100 text-xs px-4 py-2.5 rounded-lg shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <PageHeader
        kicker="Fluxo Operacional Ágil"
        title="Tarefas & Atividades"
        description="Gestão de atividades com suporte a visualização em Quadro Kanban ou Tabela de Dados, atribuíveis a colaboradores ou agentes autônomos."
        actions={
          <div className="flex items-center gap-2">
            {/* View Switcher: Kanban vs Table */}
            <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded p-0.5">
              <button
                onClick={() => setViewMode('kanban')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                  viewMode === 'kanban'
                    ? 'bg-zinc-800 text-amber-400 shadow-xs'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Kanban className="w-3.5 h-3.5" />
                <span>Kanban</span>
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                  viewMode === 'table'
                    ? 'bg-zinc-800 text-amber-400 shadow-xs'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span>Tabela</span>
              </button>
            </div>

            <button
              onClick={() => openCreateModal('todo')}
              className="px-3.5 py-2 text-xs font-semibold text-zinc-950 bg-amber-400 hover:bg-amber-300 rounded transition-colors flex items-center gap-1.5 whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Criar Tarefa</span>
            </button>
          </div>
        }
      />

      {/* Control Bar: Filters & Search */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {viewMode === 'table' ? (
            <FilterBar
              options={[
                { id: 'all', label: 'Todas', count: tasks.length },
                { id: 'todo', label: 'A Fazer', count: tasks.filter(t => t.status === 'todo').length },
                { id: 'in_progress', label: 'Em Andamento', count: tasks.filter(t => t.status === 'in_progress').length },
                { id: 'in_review', label: 'Revisão', count: tasks.filter(t => t.status === 'in_review').length },
                { id: 'done', label: 'Concluídas', count: tasks.filter(t => t.status === 'done').length },
              ]}
              activeId={statusFilter}
              onChange={setStatusFilter}
            />
          ) : (
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <span className="text-zinc-500 font-medium">Filtrar por Projeto:</span>
              <select
                value={projectFilter}
                onChange={e => setProjectFilter(e.target.value)}
                className="px-2.5 py-1 text-xs bg-zinc-900 border border-zinc-800 rounded text-zinc-200"
              >
                <option value="all">Todos os Projetos ({projects.length})</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.code})
                  </option>
                ))}
              </select>
            </div>
          )}

          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Buscar por título, código ou responsável..."
            className="w-full sm:w-72"
          />
        </div>

        {/* Executor Filter Bar */}
        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <span className="text-zinc-500 font-medium">Executor:</span>
          <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded p-0.5">
            <button
              onClick={() => setAssigneeFilter('all')}
              className={`px-2.5 py-0.5 rounded transition-colors ${
                assigneeFilter === 'all' ? 'bg-zinc-800 text-zinc-100 font-medium' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Todos ({tasks.length})
            </button>
            <button
              onClick={() => setAssigneeFilter('human')}
              className={`px-2.5 py-0.5 rounded transition-colors ${
                assigneeFilter === 'human' ? 'bg-zinc-800 text-zinc-100 font-medium' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              👤 Humanos ({tasks.filter(t => t.assignee_type === 'user').length})
            </button>
            <button
              onClick={() => setAssigneeFilter('agent')}
              className={`px-2.5 py-0.5 rounded transition-colors ${
                assigneeFilter === 'agent' ? 'bg-zinc-800 text-zinc-100 font-medium' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              🤖 Agentes IA ({tasks.filter(t => t.assignee_type === 'agent').length})
            </button>
          </div>
        </div>
      </div>

      {/* Main View Area: Kanban vs Table */}
      {viewMode === 'kanban' ? (
        <KanbanBoard
          tasks={filteredTasks}
          onTaskStatusChange={handleStatusChange}
          onEditTask={openEditModal}
          onQuickAddTask={status => openCreateModal(status)}
        />
      ) : (
        <DataTable
          data={filteredTasks}
          columns={columns}
          keyExtractor={t => t.id}
          pageSize={8}
          emptyTitle="Nenhuma tarefa localizada"
          emptyDescription="Crie tarefas operacionais para organizar a execução de projetos institucionais."
          emptyActionLabel="Criar Primeira Tarefa"
          onEmptyAction={() => openCreateModal('todo')}
        />
      )}

      {/* Modal Create/Edit */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTask ? 'Editar Tarefa' : 'Nova Tarefa Operacional'}
        description="Defina os parâmetros, projeto e responsável pela execução."
        maxWidth="lg"
      >
        <form onSubmit={handleSave} className="space-y-4">
          {formError && (
            <p className="text-xs text-rose-400 bg-rose-950/40 p-2.5 rounded border border-rose-800/40">
              {formError}
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Código da Tarefa" required helperText="Ex: TSK-104">
              <TextInput
                value={code}
                onChange={e => setCode(e.target.value.toUpperCase())}
                placeholder="TSK-XXX"
                required
              />
            </FormField>

            <FormField label="Prioridade">
              <SelectInput
                value={priority}
                onChange={e => setPriority(e.target.value as any)}
                options={[
                  { value: 'low', label: 'Baixa' },
                  { value: 'medium', label: 'Média' },
                  { value: 'high', label: 'Alta' },
                  { value: 'urgent', label: 'Urgente' },
                ]}
              />
            </FormField>
          </div>

          <FormField label="Título da Tarefa" required>
            <TextInput
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Ex: Auditoria de Regras de Segurança RLS"
              required
            />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Projeto Vinculado" required>
              <SelectInput
                value={projectId}
                onChange={e => setProjectId(e.target.value)}
                options={[
                  { value: '', label: 'Selecione o projeto...' },
                  ...projects.map(p => ({
                    value: p.id,
                    label: `${p.name} (${p.code})`,
                  })),
                ]}
              />
            </FormField>

            <FormField label="Status Inicial / Atual">
              <SelectInput
                value={status}
                onChange={e => setStatus(e.target.value as any)}
                options={[
                  { value: 'todo', label: 'A Fazer' },
                  { value: 'in_progress', label: 'Em Andamento' },
                  { value: 'in_review', label: 'Em Revisão' },
                  { value: 'blocked', label: 'Impedido' },
                  { value: 'done', label: 'Concluído' },
                ]}
              />
            </FormField>
          </div>

          <FormField label="Descrição Detalhada">
            <TextArea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Critérios de aceite e escopo da atividade..."
              rows={3}
            />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Responsável (Humano ou Agente IA)">
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

            <FormField label="Data Limite de Entrega">
              <TextInput
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
              />
            </FormField>
          </div>

          <FormActions
            onCancel={() => setIsModalOpen(false)}
            submitLabel={editingTask ? 'Atualizar Tarefa' : 'Criar Tarefa'}
          />
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Excluir Tarefa"
        message={`Confirma a exclusão definitiva da tarefa "${deleteTarget?.title}" (${deleteTarget?.code})?`}
        confirmLabel="Excluir Definitivamente"
      />
    </div>
  );
};
