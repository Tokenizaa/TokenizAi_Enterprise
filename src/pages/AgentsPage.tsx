/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { agentService } from '../services/agentService';
import { organizationService } from '../services/organizationService';
import { localStore } from '../services/supabaseClient';
import { AIAgent, Department, AgentStatus } from '../types';
import { PageHeader } from '../components/layout/PageHeader';
import { AgentCard } from '../components/organization/AgentCard';
import { SearchInput } from '../components/data/SearchInput';
import { FilterBar } from '../components/data/FilterBar';
import { EmptyState } from '../components/data/EmptyState';
import { Modal } from '../components/forms/Modal';
import { FormField } from '../components/forms/FormField';
import { TextInput } from '../components/forms/TextInput';
import { SelectInput } from '../components/forms/SelectInput';
import { TextArea } from '../components/forms/TextArea';
import { FormActions } from '../components/forms/FormActions';
import { Bot, Plus, Cpu } from 'lucide-react';

interface AgentsPageProps {
  onNavigate: (route: string) => void;
}

const SUPPORTED_MODELS = [
  'gemini-2.5-pro',
  'gemini-2.5-flash',
  'gemini-2.5-flash-thinking',
];

export const AgentsPage: React.FC<AgentsPageProps> = ({ onNavigate }) => {
  const [agents, setAgents] = useState<AIAgent[]>(agentService.getAgents());
  const [departments, setDepartments] = useState<Department[]>(organizationService.getDepartments());
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [model, setModel] = useState('gemini-2.5-pro');
  const [purpose, setPurpose] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [status, setStatus] = useState<AgentStatus>('standby');
  const [capabilities, setCapabilities] = useState('análise documental, auditoria');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    const handleUpdate = () => {
      setAgents(agentService.getAgents());
      setDepartments(organizationService.getDepartments());
    };
    return localStore.subscribe(handleUpdate);
  }, []);

  const openCreateModal = () => {
    setCode(`AGT-${Math.floor(100 + Math.random() * 900)}`);
    setName('');
    setModel('gemini-2.5-pro');
    setPurpose('');
    setDepartmentId(departments[0]?.id || '');
    setSystemPrompt('Você é um agente corporativo autônomo da NettosCorp.');
    setStatus('standby');
    setCapabilities('análise documental, triagem');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim() || !purpose.trim()) {
      setFormError('Nome, código e finalidade do agente são obrigatórios.');
      return;
    }

    const dept = departments.find(d => d.id === departmentId);
    const parsedCaps = capabilities
      .split(',')
      .map(c => c.trim())
      .filter(Boolean);

    agentService.createAgent({
      code,
      name,
      model,
      purpose,
      status,
      version: '1.0.0',
      assigned_department_id: departmentId || undefined,
      department_name: dept?.name,
      config: {
        temperature: 0.2,
        max_tokens: 4096,
        system_prompt: systemPrompt,
        capabilities: parsedCaps,
      },
    });

    setIsModalOpen(false);
  };

  const handleToggleStatus = (agent: AIAgent) => {
    const nextStatus = agent.status === 'active' ? 'standby' : 'active';
    agentService.toggleStatus(agent.id, nextStatus);
  };

  const filteredAgents = agents.filter(a => {
    const matchesSearch =
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.code.toLowerCase().includes(search.toLowerCase()) ||
      a.model.toLowerCase().includes(search.toLowerCase()) ||
      a.purpose.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        kicker="Inteligência Autônoma"
        title="Parque de Agentes de IA"
        description="Agentes cognitivos dedicados à conformidade estatutária, triagem de tarefas e processamento de documentos corporativos."
        actions={
          <button
            onClick={openCreateModal}
            className="px-3.5 py-2 text-xs font-semibold text-zinc-950 bg-amber-400 hover:bg-amber-300 rounded transition-colors flex items-center gap-1.5 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Homologar Novo Agente</span>
          </button>
        }
      />

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <FilterBar
          options={[
            { id: 'all', label: 'Todos os Agentes', count: agents.length },
            { id: 'active', label: 'Ativos', count: agents.filter(a => a.status === 'active').length },
            { id: 'standby', label: 'Em Espera', count: agents.filter(a => a.status === 'standby').length },
            { id: 'training', label: 'Em Ajuste', count: agents.filter(a => a.status === 'training').length },
          ]}
          activeId={statusFilter}
          onChange={setStatusFilter}
        />

        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Buscar agente, modelo ou capacidade..."
          className="w-full sm:w-72"
        />
      </div>

      {filteredAgents.length === 0 ? (
        <EmptyState
          title="Nenhum agente localizado"
          description="Cadastre novos agentes autônomos para integrar ao fluxo de governança e execução de tarefas."
          actionLabel="Homologar Primeiro Agente"
          onAction={openCreateModal}
          icon={Bot}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAgents.map(agent => (
            <AgentCard
              key={agent.id}
              agent={agent}
              onToggleStatus={handleToggleStatus}
              onViewDetails={a => onNavigate(`/agents/${a.id}`)}
            />
          ))}
        </div>
      )}

      {/* Modal to Register Agent */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Homologar Agente de IA"
        description="Cadastre as credenciais e parâmetros operacionais do modelo."
        maxWidth="lg"
      >
        <form onSubmit={handleSave} className="space-y-4">
          {formError && (
            <p className="text-xs text-rose-400 bg-rose-950/40 p-2.5 rounded border border-rose-800/40">
              {formError}
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Código de Identificação" required helperText="Ex: AGT-GOV-01">
              <TextInput
                value={code}
                onChange={e => setCode(e.target.value.toUpperCase())}
                placeholder="AGT-XXX"
                required
              />
            </FormField>

            <FormField label="Modelo de Linguagem (LLM)">
              <SelectInput
                value={model}
                onChange={e => setModel(e.target.value)}
                options={SUPPORTED_MODELS.map(m => ({ value: m, label: m }))}
              />
            </FormField>
          </div>

          <FormField label="Nome do Agente" required>
            <TextInput
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ex: NettosGov Sentinel"
              required
            />
          </FormField>

          <FormField label="Departamento Vinculado">
            <SelectInput
              value={departmentId}
              onChange={e => setDepartmentId(e.target.value)}
              options={[
                { value: '', label: 'Selecione a unidade...' },
                ...departments.map(d => ({
                  value: d.id,
                  label: `${d.name} (${d.code})`,
                })),
              ]}
            />
          </FormField>

          <FormField label="Finalidade & Responsabilidades" required>
            <TextArea
              value={purpose}
              onChange={e => setPurpose(e.target.value)}
              placeholder="Defina a finalidade institucional e limitações do agente..."
              rows={2}
              required
            />
          </FormField>

          <FormField label="Instruções de Sistema (System Prompt)">
            <TextArea
              value={systemPrompt}
              onChange={e => setSystemPrompt(e.target.value)}
              placeholder="Instruções comportamentais do agente..."
              rows={3}
            />
          </FormField>

          <FormField label="Capacidades & Habilidades (separadas por vírgula)">
            <TextInput
              value={capabilities}
              onChange={e => setCapabilities(e.target.value)}
              placeholder="análise documental, validação de quórum, triagem"
            />
          </FormField>

          <FormActions
            onCancel={() => setIsModalOpen(false)}
            submitLabel="Homologar Agente"
          />
        </form>
      </Modal>
    </div>
  );
};
