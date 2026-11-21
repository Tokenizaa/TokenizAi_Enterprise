/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { projectService } from '../services/projectService';
import { organizationService } from '../services/organizationService';
import { localStore } from '../services/supabaseClient';
import { Project, Department, UserProfile, ProjectStatus, PriorityLevel } from '../types';
import { PageHeader } from '../components/layout/PageHeader';
import { ProjectCard } from '../components/organization/ProjectCard';
import { SearchInput } from '../components/data/SearchInput';
import { FilterBar } from '../components/data/FilterBar';
import { EmptyState } from '../components/data/EmptyState';
import { Modal } from '../components/forms/Modal';
import { FormField } from '../components/forms/FormField';
import { TextInput } from '../components/forms/TextInput';
import { SelectInput } from '../components/forms/SelectInput';
import { TextArea } from '../components/forms/TextArea';
import { FormActions } from '../components/forms/FormActions';
import { FolderGit2, Plus } from 'lucide-react';

interface ProjectsPageProps {
  onNavigate: (route: string) => void;
}

export const ProjectsPage: React.FC<ProjectsPageProps> = ({ onNavigate }) => {
  const [projects, setProjects] = useState<Project[]>(projectService.getProjects());
  const [departments, setDepartments] = useState<Department[]>(organizationService.getDepartments());
  const [profiles, setProfiles] = useState<UserProfile[]>(organizationService.getUsers());
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [leadId, setLeadId] = useState('');
  const [priority, setPriority] = useState<PriorityLevel>('medium');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('2026-08-30');
  const [budget, setBudget] = useState(150000);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    const handleUpdate = () => {
      setProjects(projectService.getProjects());
      setDepartments(organizationService.getDepartments());
      setProfiles(organizationService.getUsers());
    };
    return localStore.subscribe(handleUpdate);
  }, []);

  const openCreateModal = () => {
    setCode(`PRJ-2026-${Math.floor(100 + Math.random() * 900)}`);
    setName('');
    setDescription('');
    setDepartmentId(departments[0]?.id || '');
    setLeadId(profiles[0]?.id || '');
    setPriority('medium');
    setBudget(100000);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim() || !departmentId) {
      setFormError('Código, nome e departamento são obrigatórios.');
      return;
    }

    const dept = departments.find(d => d.id === departmentId);
    const lead = profiles.find(p => p.id === leadId);

    projectService.createProject({
      code,
      name,
      description,
      department_id: departmentId,
      department_name: dept?.name,
      lead_id: leadId || undefined,
      lead_name: lead?.full_name,
      priority,
      status: 'planning',
      start_date: startDate,
      due_date: dueDate,
      budget: Number(budget),
    });

    setIsModalOpen(false);
  };

  const filteredProjects = projects.filter(p => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.code.toLowerCase().includes(search.toLowerCase()) ||
      (p.department_name && p.department_name.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        kicker="Portfólio Corporativo"
        title="Projetos Estratégicos"
        description="Gestão de iniciativas institucionais, metas de execução e alocação orçamentária por unidade departamental."
        actions={
          <button
            onClick={openCreateModal}
            className="px-3.5 py-2 text-xs font-semibold text-zinc-950 bg-amber-400 hover:bg-amber-300 rounded transition-colors flex items-center gap-1.5 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar Projeto</span>
          </button>
        }
      />

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <FilterBar
          options={[
            { id: 'all', label: 'Todos os Projetos', count: projects.length },
            { id: 'in_progress', label: 'Em Andamento', count: projects.filter(p => p.status === 'in_progress').length },
            { id: 'planning', label: 'Planejamento', count: projects.filter(p => p.status === 'planning').length },
            { id: 'completed', label: 'Concluídos', count: projects.filter(p => p.status === 'completed').length },
          ]}
          activeId={statusFilter}
          onChange={setStatusFilter}
        />

        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Buscar por projeto, código ou departamento..."
          className="w-full sm:w-72"
        />
      </div>

      {filteredProjects.length === 0 ? (
        <EmptyState
          title="Nenhum projeto encontrado"
          description="Inicie um novo projeto corporativo para agrupar tarefas, equipes e marcos orçamentários."
          actionLabel="Cadastrar Novo Projeto"
          onAction={openCreateModal}
          icon={FolderGit2}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map(project => (
            <ProjectCard
              key={project.id}
              project={project}
              onClick={p => onNavigate(`/projects/${p.id}`)}
            />
          ))}
        </div>
      )}

      {/* Modal New Project */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Novo Projeto Estratégico"
        description="Defina os parâmetros, liderança e orçamento da iniciativa corporativa."
        maxWidth="lg"
      >
        <form onSubmit={handleSave} className="space-y-4">
          {formError && (
            <p className="text-xs text-rose-400 bg-rose-950/40 p-2.5 rounded border border-rose-800/40">
              {formError}
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Código do Projeto" required helperText="Ex: PRJ-2026-001">
              <TextInput
                value={code}
                onChange={e => setCode(e.target.value.toUpperCase())}
                placeholder="PRJ-XXX"
                required
              />
            </FormField>

            <FormField label="Prioridade Institucional">
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

          <FormField label="Nome do Projeto" required>
            <TextInput
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ex: Plataforma de Governança Digital"
              required
            />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Departamento Responsável" required>
              <SelectInput
                value={departmentId}
                onChange={e => setDepartmentId(e.target.value)}
                options={[
                  { value: '', label: 'Selecione o departamento...' },
                  ...departments.map(d => ({
                    value: d.id,
                    label: `${d.name} (${d.code})`,
                  })),
                ]}
              />
            </FormField>

            <FormField label="Líder do Projeto">
              <SelectInput
                value={leadId}
                onChange={e => setLeadId(e.target.value)}
                options={[
                  { value: '', label: 'Selecione o líder...' },
                  ...profiles.map(p => ({
                    value: p.id,
                    label: `${p.full_name} (${p.email})`,
                  })),
                ]}
              />
            </FormField>
          </div>

          <FormField label="Descrição & Escopo">
            <TextArea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Objetivos e entregáveis esperados..."
              rows={3}
            />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormField label="Data de Início">
              <TextInput
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
              />
            </FormField>

            <FormField label="Previsão de Término">
              <TextInput
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
              />
            </FormField>

            <FormField label="Orçamento Alocado (BRL)">
              <TextInput
                type="number"
                step="5000"
                value={budget}
                onChange={e => setBudget(Number(e.target.value))}
              />
            </FormField>
          </div>

          <FormActions
            onCancel={() => setIsModalOpen(false)}
            submitLabel="Criar Projeto"
          />
        </form>
      </Modal>
    </div>
  );
};
