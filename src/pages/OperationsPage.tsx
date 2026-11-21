/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { StatCard } from '../components/data/StatCard';
import { Modal } from '../components/forms/Modal';
import { FormField } from '../components/forms/FormField';
import { TextInput } from '../components/forms/TextInput';
import { SelectInput } from '../components/forms/SelectInput';
import { FormActions } from '../components/forms/FormActions';
import { DetailDrawer } from '../components/layout/DetailDrawer';
import { operationsService } from '../services/operationsService';
import { ApprovalRequest, UserRole } from '../types';
import {
  Activity,
  CheckCircle,
  XCircle,
  Clock,
  Bot,
  User,
  AlertTriangle,
  Plus,
  ShieldCheck,
  Check,
  FileCheck2
} from 'lucide-react';

interface OperationsPageProps {
  onNavigate: (route: string) => void;
}

export const OperationsPage: React.FC<OperationsPageProps> = ({ onNavigate }) => {
  const [approvals, setApprovals] = useState<ApprovalRequest[]>(() => operationsService.getApprovalRequests());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedApproval, setSelectedApproval] = useState<ApprovalRequest | null>(null);

  // New Approval Form
  const [formData, setFormData] = useState({
    code: `APP-2026-0${approvals.length + 1}`,
    title: '',
    category: 'Orçamento' as ApprovalRequest['category'],
    requester_name: 'Dr. Orlando Netto',
    approver_role: 'director' as UserRole,
    amount: '',
    justification: '',
  });

  const refreshData = () => {
    setApprovals(operationsService.getApprovalRequests());
  };

  const handleResolve = (id: string, status: 'approved' | 'rejected') => {
    operationsService.resolveApproval(id, status);
    refreshData();
    if (selectedApproval && selectedApproval.id === id) {
      setSelectedApproval({ ...selectedApproval, status, resolved_at: new Date().toISOString() });
    }
  };

  const handleCreateApproval = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.justification) return;

    operationsService.createApprovalRequest({
      code: formData.code,
      title: formData.title,
      category: formData.category,
      requester_name: formData.requester_name,
      approver_role: formData.approver_role,
      amount: formData.amount ? Number(formData.amount) : undefined,
      justification: formData.justification,
    });

    setIsModalOpen(false);
    setFormData({
      code: `APP-2026-0${approvals.length + 2}`,
      title: '',
      category: 'Orçamento',
      requester_name: 'Dr. Orlando Netto',
      approver_role: 'director',
      amount: '',
      justification: '',
    });
    refreshData();
  };

  const stats = operationsService.getOperationalStats();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Central de Operações & Aprovações"
        subtitle="Workflows decisórios, alçadas de aprovação, delegação homem-máquina e produtividade."
        primaryAction={{
          label: 'Nova Solicitação',
          onClick: () => setIsModalOpen(true),
          icon: Plus,
        }}
      />

      {/* Operational Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Aprovações Pendentes"
          value={stats.pendingApprovals}
          subtext="Requerem parecer executivo"
          icon={Clock}
        />
        <StatCard
          label="Autonomia da Força (IA)"
          value={`${stats.agentDelegationPercent}%`}
          subtext={`${stats.agentTasks} tarefas delegadas a agentes`}
          icon={Bot}
        />
        <StatCard
          label="Tarefas Concluídas"
          value={stats.doneTasks}
          subtext={`Taxa de finalização de ${stats.completionRate}%`}
          icon={CheckCircle}
        />
        <StatCard
          label="Gargalos / Bloqueios"
          value={stats.blockedTasks}
          subtext={stats.blockedTasks > 0 ? 'Tarefas com impedimento ativo' : 'Fluxo operacional sem bloqueios'}
          icon={AlertTriangle}
        />
      </div>

      {/* Workload Delegation Bar */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-zinc-100 uppercase tracking-wide">
            Distribuição de Execução Operacional: Homens vs. Agentes Autônomos
          </span>
          <span className="text-zinc-400 font-mono">
            {stats.totalTasks} tarefas no portfólio
          </span>
        </div>

        <div className="w-full h-3 bg-zinc-800 rounded-full overflow-hidden flex">
          <div
            className="h-full bg-amber-400 transition-all duration-300"
            style={{ width: `${stats.agentDelegationPercent}%` }}
            title={`Agentes IA: ${stats.agentDelegationPercent}%`}
          />
          <div
            className="h-full bg-sky-500 transition-all duration-300"
            style={{ width: `${100 - stats.agentDelegationPercent}%` }}
            title={`Equipe Humana: ${100 - stats.agentDelegationPercent}%`}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 pt-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span>Agentes IA ({stats.agentTasks} tarefas · {stats.agentDelegationPercent}%)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
            <span>Equipe Humana ({stats.humanTasks} tarefas · {100 - stats.agentDelegationPercent}%)</span>
          </div>
        </div>
      </div>

      {/* Approvals Queue */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-zinc-100">
            Fila de Solicitações & Alçadas de Decisão ({approvals.length})
          </h3>
          <span className="text-xs text-zinc-500 font-mono">
            Orçamentos, homologações e políticas de segurança
          </span>
        </div>

        <div className="space-y-3">
          {approvals.map(req => {
            const isPending = req.status === 'pending';
            const isApproved = req.status === 'approved';

            return (
              <div
                key={req.id}
                className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-zinc-700 transition-colors"
              >
                <div className="space-y-1.5 flex-1 min-w-0 pr-4">
                  <div className="flex items-center gap-2.5 text-xs text-zinc-500 font-mono">
                    <span className="text-amber-400 font-medium">{req.code}</span>
                    <span>·</span>
                    <span>{req.category}</span>
                    <span>·</span>
                    <span>Alçada: {req.approver_role.toUpperCase()}</span>
                  </div>

                  <h4 className="text-sm font-semibold text-zinc-100 truncate">{req.title}</h4>

                  <p className="text-xs text-zinc-400 line-clamp-1">{req.justification}</p>

                  <div className="flex items-center gap-4 text-[11px] font-mono text-zinc-500 pt-1">
                    <span>Solicitante: {req.requester_name}</span>
                    {req.amount && (
                      <span>Valor: R$ {req.amount.toLocaleString('pt-BR')}</span>
                    )}
                    <span>Data: {new Date(req.created_at).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>

                {/* Status & Action Buttons */}
                <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                  {isPending ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleResolve(req.id, 'approved')}
                        className="px-3 py-1.5 text-xs font-medium text-emerald-950 bg-emerald-400 hover:bg-emerald-300 rounded transition-colors flex items-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Aprovar</span>
                      </button>
                      <button
                        onClick={() => handleResolve(req.id, 'rejected')}
                        className="px-3 py-1.5 text-xs font-medium text-rose-300 bg-rose-950/50 hover:bg-rose-900/60 border border-rose-800/60 rounded transition-colors flex items-center gap-1.5"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Rejeitar</span>
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-mono px-2 py-0.5 rounded border ${
                          isApproved
                            ? 'text-emerald-400 bg-emerald-950/40 border-emerald-900/50'
                            : 'text-rose-400 bg-rose-950/40 border-rose-900/50'
                        }`}
                      >
                        {isApproved ? 'Aprovado' : 'Rejeitado'}
                      </span>
                    </div>
                  )}

                  <button
                    onClick={() => setSelectedApproval(req)}
                    className="p-1.5 text-zinc-500 hover:text-zinc-200 transition-colors"
                    title="Ver detalhes da solicitação"
                  >
                    <FileCheck2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Drawer: Approval Details */}
      <DetailDrawer
        isOpen={Boolean(selectedApproval)}
        onClose={() => setSelectedApproval(null)}
        title={selectedApproval?.title || 'Detalhes da Solicitação'}
        subtitle={`${selectedApproval?.code} · Categoria: ${selectedApproval?.category}`}
      >
        {selectedApproval && (
          <div className="space-y-6">
            <div className="bg-zinc-950 p-4 rounded-lg border border-zinc-800 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400">Situação Atual</span>
                <span className="font-mono text-zinc-200 capitalize">{selectedApproval.status}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400">Solicitante</span>
                <span className="text-zinc-200">{selectedApproval.requester_name}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400">Alçada Exigida</span>
                <span className="text-zinc-200 font-mono uppercase">{selectedApproval.approver_role}</span>
              </div>
              {selectedApproval.amount && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-400">Impacto Orçamentário</span>
                  <span className="text-amber-400 font-mono font-semibold">
                    R$ {selectedApproval.amount.toLocaleString('pt-BR')}
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <span className="text-xs font-semibold text-zinc-300 block uppercase tracking-wider">
                Justificativa Operacional
              </span>
              <div className="p-3 bg-zinc-950 rounded border border-zinc-800 text-xs text-zinc-300 leading-relaxed font-mono">
                {selectedApproval.justification}
              </div>
            </div>

            {selectedApproval.status === 'pending' && (
              <div className="pt-4 border-t border-zinc-800 flex items-center justify-end gap-3">
                <button
                  onClick={() => handleResolve(selectedApproval.id, 'rejected')}
                  className="px-4 py-2 text-xs font-medium text-rose-300 bg-rose-950/60 hover:bg-rose-900/70 border border-rose-800/80 rounded transition-colors"
                >
                  Rejeitar Solicitação
                </button>
                <button
                  onClick={() => handleResolve(selectedApproval.id, 'approved')}
                  className="px-4 py-2 text-xs font-medium text-zinc-950 bg-amber-400 hover:bg-amber-300 rounded transition-colors"
                >
                  Homologar & Aprovar
                </button>
              </div>
            )}
          </div>
        )}
      </DetailDrawer>

      {/* Modal: New Approval Request */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Submeter Solicitação de Aprovação"
        subtitle="Encaminhe pedidos orçamentários, novas versões de agentes ou alterações de segurança."
      >
        <form onSubmit={handleCreateApproval} className="space-y-4">
          <FormField label="Código de Acompanhamento" required>
            <TextInput
              value={formData.code}
              onChange={e => setFormData({ ...formData, code: e.target.value })}
              required
            />
          </FormField>

          <FormField label="Título da Solicitação" required>
            <TextInput
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              placeholder="Ex: Alocação emergencial de GPUs para fine-tuning"
              required
            />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Categoria" required>
              <SelectInput
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value as ApprovalRequest['category'] })}
                options={[
                  { value: 'Orçamento', label: 'Orçamento' },
                  { value: 'Homologação de Agente', label: 'Homologação de Agente' },
                  { value: 'Política de Acesso', label: 'Política de Acesso' },
                  { value: 'Contratação', label: 'Contratação' },
                  { value: 'Lançamento de Versão', label: 'Lançamento de Versão' },
                ]}
              />
            </FormField>

            <FormField label="Alçada Decisória Mínima" required>
              <SelectInput
                value={formData.approver_role}
                onChange={e => setFormData({ ...formData, approver_role: e.target.value as UserRole })}
                options={[
                  { value: 'manager', label: 'Gerente (Manager)' },
                  { value: 'director', label: 'Diretoria (Director)' },
                  { value: 'admin', label: 'Administrador (Admin)' },
                  { value: 'super_admin', label: 'Super Admin (Conselho)' },
                ]}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Solicitante Executivo" required>
              <TextInput
                value={formData.requester_name}
                onChange={e => setFormData({ ...formData, requester_name: e.target.value })}
                required
              />
            </FormField>

            <FormField label="Impacto Financeiro (Opcional)">
              <TextInput
                type="number"
                value={formData.amount}
                onChange={e => setFormData({ ...formData, amount: e.target.value })}
                placeholder="Ex: 45000"
              />
            </FormField>
          </div>

          <FormField label="Justificativa Operacional e Risco" required>
            <TextInput
              value={formData.justification}
              onChange={e => setFormData({ ...formData, justification: e.target.value })}
              placeholder="Descreva a finalidade, impactos e conformidade com diretrizes CNS"
              required
            />
          </FormField>

          <FormActions
            onCancel={() => setIsModalOpen(false)}
            submitLabel="Submeter para Alçada"
          />
        </form>
      </Modal>
    </div>
  );
};
