/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { organizationService } from '../services/organizationService';
import { localStore } from '../services/supabaseClient';
import { Position, Department } from '../types';
import { PageHeader } from '../components/layout/PageHeader';
import { DataTable, Column } from '../components/data/DataTable';
import { SearchInput } from '../components/data/SearchInput';
import { FilterBar } from '../components/data/FilterBar';
import { Modal } from '../components/forms/Modal';
import { FormField } from '../components/forms/FormField';
import { TextInput } from '../components/forms/TextInput';
import { SelectInput } from '../components/forms/SelectInput';
import { TextArea } from '../components/forms/TextArea';
import { FormActions } from '../components/forms/FormActions';
import { ConfirmDialog } from '../components/forms/ConfirmDialog';
import { Plus, Edit2, Trash2, Briefcase } from 'lucide-react';

interface PositionsPageProps {
  onNavigate: (route: string) => void;
}

const POSITION_LEVELS = [
  'C-Level',
  'Diretoria',
  'Gerência',
  'Especialista',
  'Operacional',
];

export const PositionsPage: React.FC<PositionsPageProps> = ({ onNavigate }) => {
  const [positions, setPositions] = useState<Position[]>(organizationService.getPositions());
  const [departments, setDepartments] = useState<Department[]>(organizationService.getDepartments());
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPos, setEditingPos] = useState<Position | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Position | null>(null);

  // Form fields
  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [level, setLevel] = useState('Especialista');
  const [departmentId, setDepartmentId] = useState('');
  const [description, setDescription] = useState('');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    const handleUpdate = () => {
      setPositions(organizationService.getPositions());
      setDepartments(organizationService.getDepartments());
    };
    return localStore.subscribe(handleUpdate);
  }, []);

  const openCreateModal = () => {
    setEditingPos(null);
    setCode(`POS-${Math.floor(100 + Math.random() * 900)}`);
    setTitle('');
    setLevel('Especialista');
    setDepartmentId(departments[0]?.id || '');
    setDescription('');
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (pos: Position) => {
    setEditingPos(pos);
    setCode(pos.code);
    setTitle(pos.title);
    setLevel(pos.level);
    setDepartmentId(pos.department_id);
    setDescription(pos.description);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !code.trim() || !departmentId) {
      setFormError('Título, código e departamento são obrigatórios.');
      return;
    }

    const dept = departments.find(d => d.id === departmentId);

    if (editingPos) {
      organizationService.updatePosition(editingPos.id, {
        code,
        title,
        level,
        department_id: departmentId,
        department_name: dept?.name,
        description,
      });
    } else {
      organizationService.createPosition({
        code,
        title,
        level,
        department_id: departmentId,
        department_name: dept?.name,
        description,
      });
    }

    setIsModalOpen(false);
  };

  const handleDelete = () => {
    if (deleteTarget) {
      organizationService.deletePosition(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  const filteredPositions = positions.filter(p => {
    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.code.toLowerCase().includes(search.toLowerCase()) ||
      (p.department_name && p.department_name.toLowerCase().includes(search.toLowerCase()));

    const matchesLevel = levelFilter === 'all' || p.level === levelFilter;
    return matchesSearch && matchesLevel;
  });

  const columns: Column<Position>[] = [
    {
      key: 'code',
      header: 'Código',
      sortable: true,
      width: '120px',
      accessor: p => <span className="font-mono text-zinc-400 font-medium">{p.code}</span>,
    },
    {
      key: 'title',
      header: 'Cargo / Posição',
      sortable: true,
      accessor: p => (
        <div>
          <span className="font-semibold text-zinc-100 block">{p.title}</span>
          <span className="text-[11px] text-zinc-400 line-clamp-1">{p.description}</span>
        </div>
      ),
    },
    {
      key: 'department_name',
      header: 'Departamento',
      sortable: true,
      accessor: p => (
        <span className="text-zinc-300 font-medium">
          {p.department_name || 'Geral'}
        </span>
      ),
    },
    {
      key: 'level',
      header: 'Nível Hierárquico',
      sortable: true,
      align: 'center',
      accessor: p => (
        <span className="font-mono text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700/60">
          {p.level}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Ações',
      align: 'right',
      accessor: p => (
        <div className="flex items-center justify-end gap-1.5" onClick={e => e.stopPropagation()}>
          <button
            onClick={() => openEditModal(p)}
            className="p-1 rounded text-zinc-400 hover:text-amber-400 hover:bg-zinc-800 transition-colors"
            title="Editar cargo"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setDeleteTarget(p)}
            className="p-1 rounded text-zinc-400 hover:text-rose-400 hover:bg-zinc-800 transition-colors"
            title="Excluir cargo"
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
        kicker="Estrutura de Cargos"
        title="Quadro de Cargos & Posições"
        description="Definição de níveis de responsabilidade estatutária, cargos técnicos e alocação departamental."
        actions={
          <button
            onClick={openCreateModal}
            className="px-3.5 py-2 text-xs font-semibold text-zinc-950 bg-amber-400 hover:bg-amber-300 rounded transition-colors flex items-center gap-1.5 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar Cargo</span>
          </button>
        }
      />

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <FilterBar
          options={[
            { id: 'all', label: 'Todos os Níveis', count: positions.length },
            ...POSITION_LEVELS.map(lvl => ({
              id: lvl,
              label: lvl,
              count: positions.filter(p => p.level === lvl).length,
            })),
          ]}
          activeId={levelFilter}
          onChange={setLevelFilter}
        />

        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Buscar cargo, código ou divisão..."
          className="w-full sm:w-72"
        />
      </div>

      <DataTable
        data={filteredPositions}
        columns={columns}
        keyExtractor={p => p.id}
        pageSize={8}
        emptyTitle="Nenhum cargo encontrado"
        emptyDescription="Cadastre os cargos corporativos para vincular às atribuições e quadro de funcionários."
        emptyActionLabel="Cadastrar Novo Cargo"
        onEmptyAction={openCreateModal}
      />

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingPos ? 'Editar Cargo' : 'Novo Cargo Corporativo'}
        description="Defina as qualificações, código e departamento correspondente."
        maxWidth="lg"
      >
        <form onSubmit={handleSave} className="space-y-4">
          {formError && (
            <p className="text-xs text-rose-400 bg-rose-950/40 p-2.5 rounded border border-rose-800/40">
              {formError}
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Código do Cargo" required helperText="Ex: POS-CTO-01">
              <TextInput
                value={code}
                onChange={e => setCode(e.target.value.toUpperCase())}
                placeholder="POS-XXX"
                required
              />
            </FormField>

            <FormField label="Nível Hierárquico">
              <SelectInput
                value={level}
                onChange={e => setLevel(e.target.value)}
                options={POSITION_LEVELS.map(lvl => ({ value: lvl, label: lvl }))}
              />
            </FormField>
          </div>

          <FormField label="Título do Cargo" required>
            <TextInput
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Ex: Engenheiro de IA Sênior"
              required
            />
          </FormField>

          <FormField label="Departamento Vinculado" required>
            <SelectInput
              value={departmentId}
              onChange={e => setDepartmentId(e.target.value)}
              options={[
                { value: '', label: 'Selecione um departamento...' },
                ...departments.map(d => ({
                  value: d.id,
                  label: `${d.name} (${d.code})`,
                })),
              ]}
            />
          </FormField>

          <FormField label="Descrição de Atribuições">
            <TextArea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Descreva o escopo de atuação e requisitos para a função..."
              rows={3}
            />
          </FormField>

          <FormActions
            onCancel={() => setIsModalOpen(false)}
            submitLabel={editingPos ? 'Atualizar Cargo' : 'Salvar Cargo'}
          />
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Excluir Cargo"
        message={`Confirma a exclusão do cargo "${deleteTarget?.title}" (${deleteTarget?.code})?`}
        confirmLabel="Excluir Definitivamente"
      />
    </div>
  );
};
