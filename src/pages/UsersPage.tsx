/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { organizationService } from '../services/organizationService';
import { localStore } from '../services/supabaseClient';
import { UserProfile, UserRole } from '../types';
import { ROLE_LABELS, ROLE_DESCRIPTIONS } from '../services/permissionService';
import { PageHeader } from '../components/layout/PageHeader';
import { DataTable, Column } from '../components/data/DataTable';
import { SearchInput } from '../components/data/SearchInput';
import { FilterBar } from '../components/data/FilterBar';
import { StatusBadge } from '../components/organization/StatusBadge';
import { Modal } from '../components/forms/Modal';
import { FormField } from '../components/forms/FormField';
import { SelectInput } from '../components/forms/SelectInput';
import { FormActions } from '../components/forms/FormActions';
import { Users, Shield, Edit2, Ban, CheckCircle2 } from 'lucide-react';

interface UsersPageProps {
  onNavigate: (route: string) => void;
}

const ROLES: UserRole[] = [
  'super_admin',
  'admin',
  'director',
  'manager',
  'member',
  'viewer',
];

export const UsersPage: React.FC<UsersPageProps> = ({ onNavigate }) => {
  const [users, setUsers] = useState<UserProfile[]>(organizationService.getUsers());
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  // Edit Role Modal
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole>('member');

  useEffect(() => {
    const handleUpdate = () => {
      setUsers(organizationService.getUsers());
    };
    return localStore.subscribe(handleUpdate);
  }, []);

  const openEditModal = (u: UserProfile) => {
    setEditingUser(u);
    setSelectedRole(u.role);
  };

  const handleSaveRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      organizationService.updateUser(editingUser.id, { role: selectedRole });
      localStore.logAudit({
        user_id: localStore.getSessionUser()?.id || 'usr-001',
        user_email: localStore.getSessionUser()?.email || 'admin@nettoscorp.com',
        action: 'PERM_CHANGE',
        resource: 'profiles',
        resource_id: editingUser.id,
        details: { target_email: editingUser.email, new_role: selectedRole },
      });
      setEditingUser(null);
    }
  };

  const handleToggleStatus = (u: UserProfile) => {
    const nextStatus = u.status === 'active' ? 'suspended' : 'active';
    organizationService.updateUser(u.id, { status: nextStatus });
    localStore.logAudit({
      user_id: localStore.getSessionUser()?.id || 'usr-001',
      user_email: localStore.getSessionUser()?.email || 'admin@nettoscorp.com',
      action: 'STATUS_CHANGE',
      resource: 'profiles',
      resource_id: u.id,
      details: { target_email: u.email, status: nextStatus },
    });
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch =
      u.full_name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());

    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const columns: Column<UserProfile>[] = [
    {
      key: 'full_name',
      header: 'Colaborador',
      sortable: true,
      accessor: u => (
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded bg-zinc-800 border border-zinc-700/60 flex items-center justify-center text-amber-400 font-semibold text-xs">
            {u.full_name.charAt(0)}
          </div>
          <div>
            <span className="font-semibold text-zinc-100 block">{u.full_name}</span>
            <span className="text-[11px] font-mono text-zinc-400">{u.email}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Papel Corporativo',
      sortable: true,
      accessor: u => (
        <div>
          <span className="font-mono text-xs px-2 py-0.5 rounded bg-zinc-800 text-amber-400 border border-zinc-700/60 font-medium">
            {ROLE_LABELS[u.role]}
          </span>
          <span className="text-[10px] text-zinc-500 block mt-0.5 max-w-xs truncate">
            {ROLE_DESCRIPTIONS[u.role]}
          </span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status de Acesso',
      align: 'center',
      accessor: u => <StatusBadge status={u.status} />,
    },
    {
      key: 'created_at',
      header: 'Membro Desde',
      sortable: true,
      align: 'center',
      accessor: u => (
        <span className="font-mono tabular-nums text-zinc-500 text-xs">
          {new Date(u.created_at).toLocaleDateString('pt-BR')}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Ações',
      align: 'right',
      accessor: u => (
        <div className="flex items-center justify-end gap-1.5" onClick={e => e.stopPropagation()}>
          <button
            onClick={() => openEditModal(u)}
            className="p-1 rounded text-zinc-400 hover:text-amber-400 hover:bg-zinc-800 transition-colors"
            title="Alterar papel e permissões"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleToggleStatus(u)}
            className={`p-1 rounded transition-colors ${
              u.status === 'active'
                ? 'text-zinc-500 hover:text-rose-400 hover:bg-zinc-800'
                : 'text-emerald-400 hover:bg-emerald-950/40'
            }`}
            title={u.status === 'active' ? 'Suspender acesso' : 'Reativar acesso'}
          >
            {u.status === 'active' ? <Ban className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        kicker="Segurança & Contas"
        title="Usuários & Controle de Acesso"
        description="Gestão de identidades, atribuição de privilégios e governança de acessos via políticas PostgreSQL RLS."
      />

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <FilterBar
          options={[
            { id: 'all', label: 'Todos', count: users.length },
            ...ROLES.map(r => ({
              id: r,
              label: ROLE_LABELS[r].split(' ')[0],
              count: users.filter(u => u.role === r).length,
            })),
          ]}
          activeId={roleFilter}
          onChange={setRoleFilter}
        />

        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Buscar por nome ou e-mail..."
          className="w-full sm:w-72"
        />
      </div>

      <DataTable
        data={filteredUsers}
        columns={columns}
        keyExtractor={u => u.id}
        pageSize={8}
      />

      {/* Edit Role Modal */}
      {editingUser && (
        <Modal
          isOpen={Boolean(editingUser)}
          onClose={() => setEditingUser(null)}
          title={`Alterar Papel: ${editingUser.full_name}`}
          description={`Definição de privilégios para ${editingUser.email}`}
          maxWidth="md"
        >
          <form onSubmit={handleSaveRole} className="space-y-4">
            <FormField label="Papel Institucional">
              <SelectInput
                value={selectedRole}
                onChange={e => setSelectedRole(e.target.value as UserRole)}
                options={ROLES.map(r => ({
                  value: r,
                  label: `${ROLE_LABELS[r]} — ${ROLE_DESCRIPTIONS[r].substring(0, 50)}...`,
                }))}
              />
            </FormField>

            <div className="p-3 bg-zinc-950 rounded border border-zinc-800 text-xs space-y-1">
              <span className="text-zinc-400 font-semibold block">Efeito da Alteração no Banco:</span>
              <p className="text-zinc-400 text-[11px] leading-relaxed">
                A alteração atualiza a claim de autorização no Supabase Auth e revalida as regras de Row Level Security (RLS) nas consultas imediatas.
              </p>
            </div>

            <FormActions
              onCancel={() => setEditingUser(null)}
              submitLabel="Atualizar Privilégios"
            />
          </form>
        </Modal>
      )}
    </div>
  );
};
