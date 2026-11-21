/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { organizationService } from '../services/organizationService';
import { localStore } from '../services/supabaseClient';
import { Department, UserProfile } from '../types';
import { PageHeader } from '../components/layout/PageHeader';
import { DataTable, Column } from '../components/data/DataTable';
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
import { Plus, Edit2, Trash2, Users } from 'lucide-react';

interface DepartmentsPageProps {
  onNavigate: (route: string) => void;
}

export const DepartmentsPage: React.FC<DepartmentsPageProps> = ({ onNavigate }) => {
  const [departments, setDepartments] = useState<Department[]>(organizationService.getDepartments());
  const [profiles, setProfiles] = useState<UserProfile[]>(organizationService.getUsers());
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Department | null>(null);

  // Form fields
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [managerId, setManagerId] = useState('');
  const [headcount, setHeadcount] = useState(1);
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    const handleUpdate = () => {
      setDepartments(organizationService.getDepartments());
      setProfiles(organizationService.getUsers());
    };
    return localStore.subscribe(handleUpdate);
  }, []);

  const openCreateModal = () => {
    setEditingDept(null);
    setCode(`DEP-${Math.floor(100 + Math.random() * 900)}`);
    setName('');
    setDescription('');
    setManagerId(profiles[0]?.id || '');
    setHeadcount(5);
    setStatus('active');
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (dept: Department) => {
    setEditingDept(dept);
    setCode(dept.code);
    setName(dept.name);
    setDescription(dept.description);
    setManagerId(dept.manager_id || '');
    setHeadcount(dept.headcount || 0);
    setStatus(dept.status);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) {
      setFormError('Código e nome do departamento são obrigatórios.');
      return;
    }

    const selectedManager = profiles.find(p => p.id === managerId);

    if (editingDept) {
      organizationService.updateDepartment(editingDept.id, {
        code,
        name,
        description,
        manager_id: managerId || undefined,
        manager_name: selectedManager?.full_name,
        headcount: Number(headcount),
        status,
      });
    } else {
      organizationService.createDepartment({
        code,
        name,
        description,
        manager_id: managerId || undefined,
        manager_name: selectedManager?.full_name,
        headcount: Number(headcount),
        status,
      });
    }

    setIsModalOpen(false);
  };

  const handleDelete = () => {
    if (deleteTarget) {
      organizationService.deleteDepartment(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  const filteredDepts = departments.filter(d => {
    const matchesSearch =
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.code.toLowerCase().includes(search.toLowerCase()) ||
      (d.manager_name && d.manager_name.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || d.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const columns: Column<Department>[] = [
    {
      key: 'code',
      header: 'Código',
      sortable: true,
      width: '120px',
      accessor: d => <span className="font-mono text-zinc-400 font-medium">{d.code}</span>,
    },
    {
      key: 'name',
      header: 'Departamento',
      sortable: true,
      accessor: d => (
        <div>
          <span className="font-semibold text-zinc-100 block">{d.name}</span>
          <span className="text-[11px] text-zinc-400 line-clamp-1">{d.description}</span>
        </div>
      ),
    },
    {
      key: 'manager_name',
      header: 'Gestor Responsável',
      sortable: true,
      accessor: d => (
        <span className="text-zinc-300 font-medium">
          {d.manager_name || 'Não atribuído'}
        </span>
      ),
    },
    {
      key: 'headcount',
      header: 'Quadro',
      sortable: true,
      align: 'right',
      accessor: d => (
        <span className="font-mono tabular-nums text-zinc-200">
          {d.headcount || 0} integrantes
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center',
      accessor: d => <StatusBadge status={d.status} />,
    },
    {
      key: 'actions',
      header: 'Ações',
      align: 'right',
      accessor: d => (
        <div className="flex items-center justify-end gap-1.5" onClick={e => e.stopPropagation()}>
          <button
            onClick={() => openEditModal(d)}
            className="p-1 rounded text-zinc-400 hover:text-amber-400 hover:bg-zinc-800 transition-colors"
            title="Editar departamento"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setDeleteTarget(d)}
            className="p-1 rounded text-zinc-400 hover:text-rose-400 hover:bg-zinc-800 transition-colors"
            title="Excluir departamento"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        kicker="Estrutura Funcional"
        title="Departamentos Corporativos"
        description="Cadastro, hierarquia e vinculação de lideranças e centros de custo da organização."
        actions={
          <button
            onClick={openCreateModal}
            className="px-3.5 py-2 text-xs font-semibold text-zinc-950 bg-amber-400 hover:bg-amber-300 rounded transition-colors flex items-center gap-1.5 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar Departamento</span>
          </button>
        }
      />

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <FilterBar
          options={[
            { id: 'all', label: 'Todos', count: departments.length },
            { id: 'active', label: 'Ativos', count: departments.filter(d => d.status === 'active').length },
            { id: 'inactive', label: 'Inativos', count: departments.filter(d => d.status === 'inactive').length },
          ]}
          activeId={statusFilter}
          onChange={setStatusFilter}
        />

        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Buscar por nome, código ou gestor..."
          className="w-full sm:w-72"
        />
      </div>

      {/* Data Table */}
      <DataTable
        data={filteredDepts}
        columns={columns}
        keyExtractor={d => d.id}
        pageSize={8}
        emptyTitle="Nenhum departamento cadastrado"
        emptyDescription="Cadastre o primeiro departamento corporativo para estruturar equipes e projetos."
        emptyActionLabel="Cadastrar Novo Departamento"
        onEmptyAction={openCreateModal}
      />

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingDept ? 'Editar Departamento' : 'Novo Departamento Corporativo'}
        description="Preencha os dados de identificação e liderança departamental."
        maxWidth="lg"
      >
        <form onSubmit={handleSave} className="space-y-4">
          {formError && (
            <p className="text-xs text-rose-400 bg-rose-950/40 p-2.5 rounded border border-rose-800/40">
              {formError}
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Código de Referência" required helperText="Ex: DEP-TEC">
              <TextInput
                value={code}
                onChange={e => setCode(e.target.value.toUpperCase())}
                placeholder="DEP-XXX"
                required
              />
            </FormField>

            <FormField label="Status Operacional">
              <SelectInput
                value={status}
                onChange={e => setStatus(e.target.value as any)}
                options={[
                  { value: 'active', label: 'Ativo' },
                  { value: 'inactive', label: 'Inativo' },
                ]}
              />
            </FormField>
          </div>

          <FormField label="Nome do Departamento" required>
            <TextInput
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ex: Engenharia & Inteligência Artificial"
              required
            />
          </FormField>

          <FormField label="Descrição das Atividades & Escopo">
            <TextArea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Descreva as responsabilidades estatutárias e operacionais desta unidade..."
              rows={3}
            />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Gestor / Diretor Responsável">
              <SelectInput
                value={managerId}
                onChange={e => setManagerId(e.target.value)}
                options={[
                  { value: '', label: 'Selecione um gestor...' },
                  ...profiles.map(p => ({
                    value: p.id,
                    label: `${p.full_name} (${p.email})`,
                  })),
                ]}
              />
            </FormField>

            <FormField label="Quadro Previsto (Headcount)">
              <TextInput
                type="number"
                min="0"
                value={headcount}
                onChange={e => setHeadcount(Number(e.target.value))}
              />
            </FormField>
          </div>

          <FormActions
            onCancel={() => setIsModalOpen(false)}
            submitLabel={editingDept ? 'Atualizar Departamento' : 'Salvar Departamento'}
          />
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Excluir Departamento"
        message={`Confirma a exclusão do departamento "${deleteTarget?.name}" (${deleteTarget?.code})? Esta operação será registrada na trilha de auditoria corporativa.`}
        confirmLabel="Excluir Definitivamente"
      />
    </div>
  );
};
