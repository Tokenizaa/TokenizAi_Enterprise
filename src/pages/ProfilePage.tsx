/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { authService } from '../services/authService';
import { localStore } from '../services/supabaseClient';
import { UserProfile, UserRole } from '../types';
import { ROLE_LABELS, ROLE_DESCRIPTIONS, hasPermission } from '../services/permissionService';
import { PageHeader } from '../components/layout/PageHeader';
import { FormField } from '../components/forms/FormField';
import { TextInput } from '../components/forms/TextInput';
import { FormActions } from '../components/forms/FormActions';
import { User, Shield, Key, Building2, Layers, Check } from 'lucide-react';

interface ProfilePageProps {
  onNavigate: (route: string) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onNavigate }) => {
  const currentUser = localStore.getSessionUser();
  const [fullName, setFullName] = useState(currentUser?.full_name || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Password reset request state
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  if (!currentUser) {
    return (
      <div className="p-8 text-center bg-zinc-900 border border-zinc-800 rounded-lg">
        <p className="text-xs text-zinc-400">Usuário não autenticado.</p>
        <button
          onClick={() => onNavigate('/login')}
          className="mt-3 px-3 py-1.5 text-xs text-amber-400 bg-zinc-800 rounded"
        >
          Ir para Login
        </button>
      </div>
    );
  }

  const handleUpdateName = (e: React.FormEvent) => {
    e.preventDefault();
    authService.updateProfile({ full_name: fullName });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handlePasswordReset = async () => {
    await authService.requestPasswordReset(currentUser.email);
    setPasswordSuccess(true);
    setTimeout(() => setPasswordSuccess(false), 3000);
  };

  const departments = localStore.getDepartments();
  const userDept = departments.find(d => d.id === currentUser.department_id);

  return (
    <div className="space-y-6">
      <PageHeader
        kicker="Identidade Corporativa"
        title="Perfil do Usuário"
        description="Credenciais de autenticação, alocação funcional e privilégios de acesso concedidos."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Identity Card) */}
        <div className="space-y-6">
          <div className="p-6 bg-zinc-900/60 border border-zinc-800 rounded-lg text-center">
            <div className="w-16 h-16 rounded-full bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 font-bold text-xl mx-auto mb-3">
              {currentUser.full_name ? currentUser.full_name.charAt(0) : 'U'}
            </div>

            <h3 className="text-base font-bold text-zinc-100">{currentUser.full_name}</h3>
            <p className="text-xs font-mono text-zinc-400 mt-0.5">{currentUser.email}</p>

            <div className="mt-4 pt-4 border-t border-zinc-800 space-y-2 text-xs text-left">
              <div className="flex justify-between items-center">
                <span className="text-zinc-500">Papel Institucional:</span>
                <span className="font-mono text-amber-400 font-medium">
                  {ROLE_LABELS[currentUser.role]}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-500">Unidade:</span>
                <span className="text-zinc-300">{userDept?.name || 'Administração Central'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-500">Status da Conta:</span>
                <span className="text-emerald-400 font-medium uppercase font-mono text-[11px]">
                  {currentUser.status}
                </span>
              </div>
            </div>
          </div>

          {/* Role Privileges Quick Matrix */}
          <div className="p-5 bg-zinc-900/60 border border-zinc-800 rounded-lg space-y-2.5 text-xs">
            <div className="flex items-center gap-1.5 pb-2 border-b border-zinc-800 text-zinc-200 font-semibold">
              <Shield className="w-4 h-4 text-amber-400" />
              <span>Privilégios do Papel Atual</span>
            </div>

            <div className="space-y-1.5 text-zinc-400 font-mono text-[11px]">
              <div className="flex justify-between">
                <span>Gestão de Projetos:</span>
                <span className={hasPermission(currentUser.role, 'projects', 'create') ? 'text-emerald-400' : 'text-zinc-600'}>
                  {hasPermission(currentUser.role, 'projects', 'create') ? '✓ Concedido' : 'Restrito'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Atribuição de Tarefas:</span>
                <span className={hasPermission(currentUser.role, 'tasks', 'create') ? 'text-emerald-400' : 'text-zinc-600'}>
                  {hasPermission(currentUser.role, 'tasks', 'create') ? '✓ Concedido' : 'Restrito'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Emissão de Decretos (DEC):</span>
                <span className={hasPermission(currentUser.role, 'decisions', 'create') ? 'text-emerald-400' : 'text-zinc-600'}>
                  {hasPermission(currentUser.role, 'decisions', 'create') ? '✓ Concedido' : 'Restrito'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Lavratura de Atas (CNS):</span>
                <span className={hasPermission(currentUser.role, 'deliberations', 'create') ? 'text-emerald-400' : 'text-zinc-600'}>
                  {hasPermission(currentUser.role, 'deliberations', 'create') ? '✓ Concedido' : 'Restrito'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Acesso a Trilha de Auditoria:</span>
                <span className={hasPermission(currentUser.role, 'audit', 'read') ? 'text-emerald-400' : 'text-zinc-600'}>
                  {hasPermission(currentUser.role, 'audit', 'read') ? '✓ Concedido' : 'Restrito'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Edit Profile & Security */}
        <div className="lg:col-span-2 space-y-6">
          {/* Update Name Form */}
          <div className="p-6 bg-zinc-900/60 border border-zinc-800 rounded-lg">
            <h4 className="text-sm font-semibold text-zinc-100 mb-4 pb-2 border-b border-zinc-800 flex items-center justify-between">
              <span>Dados Cadastrais</span>
              {savedSuccess && (
                <span className="text-xs text-emerald-400 font-mono font-normal">
                  ✓ Dados salvos com sucesso
                </span>
              )}
            </h4>

            <form onSubmit={handleUpdateName} className="space-y-4">
              <FormField label="Nome Completo">
                <TextInput
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  required
                />
              </FormField>

              <FormField label="E-mail Institucional (Imutável)">
                <TextInput
                  value={currentUser.email}
                  disabled
                  className="bg-zinc-950 text-zinc-500 font-mono cursor-not-allowed"
                />
              </FormField>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-zinc-950 bg-amber-400 hover:bg-amber-300 rounded transition-colors"
                >
                  Atualizar Dados
                </button>
              </div>
            </form>
          </div>

          {/* Security & Password Reset */}
          <div className="p-6 bg-zinc-900/60 border border-zinc-800 rounded-lg">
            <h4 className="text-sm font-semibold text-zinc-100 mb-4 pb-2 border-b border-zinc-800 flex items-center gap-2">
              <Key className="w-4 h-4 text-amber-400" />
              <span>Segurança da Credencial & Senha</span>
            </h4>

            <p className="text-xs text-zinc-400 leading-relaxed mb-4">
              As senhas institucionais são criptografadas e validadas pela infraestrutura Supabase Auth com proteção contra força bruta e rotação periódica.
            </p>

            {passwordSuccess && (
              <div className="mb-4 p-3 rounded bg-emerald-950/40 border border-emerald-800/40 text-emerald-300 text-xs">
                ✓ Solicitação despachada para o e-mail cadastrado.
              </div>
            )}

            <button
              onClick={handlePasswordReset}
              className="px-4 py-2 text-xs font-medium text-zinc-300 hover:text-zinc-100 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded transition-colors"
            >
              Solicitar Redefinição de Senha
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
