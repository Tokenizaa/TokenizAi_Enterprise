/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { agentService } from '../services/agentService';
import { taskService } from '../services/taskService';
import { localStore } from '../services/supabaseClient';
import { AIAgent, Task, AuditLog, PriorityLevel } from '../types';
import { PageHeader } from '../components/layout/PageHeader';
import { StatusBadge } from '../components/organization/StatusBadge';
import { FormField } from '../components/forms/FormField';
import { TextInput } from '../components/forms/TextInput';
import { TextArea } from '../components/forms/TextArea';
import { SelectInput } from '../components/forms/SelectInput';
import { FormActions } from '../components/forms/FormActions';
import { ConfirmDialog } from '../components/forms/ConfirmDialog';
import { Modal } from '../components/forms/Modal';
import {
  Bot,
  Cpu,
  ArrowLeft,
  CheckSquare,
  ShieldCheck,
  Terminal,
  Save,
  Trash2,
  Play,
  Sparkles,
  Send,
  Plus
} from 'lucide-react';

interface AgentDetailsPageProps {
  agentId: string;
  onNavigate: (route: string) => void;
}

export const AgentDetailsPage: React.FC<AgentDetailsPageProps> = ({ agentId, onNavigate }) => {
  const [agent, setAgent] = useState<AIAgent | undefined>(agentService.getAgentById(agentId));
  const [assignedTasks, setAssignedTasks] = useState<Task[]>([]);
  const [agentLogs, setAgentLogs] = useState<AuditLog[]>([]);

  // Config Form
  const [name, setName] = useState('');
  const [purpose, setPurpose] = useState('');
  const [temperature, setTemperature] = useState(0.2);
  const [maxTokens, setMaxTokens] = useState(4096);
  const [systemPrompt, setSystemPrompt] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Live Test Sandbox
  const [testPrompt, setTestPrompt] = useState('Verifique a conformidade da contratação de infraestrutura com o Decreto DEC-2026-001.');
  const [testResponse, setTestResponse] = useState<string | null>(null);
  const [isRunningTest, setIsRunningTest] = useState(false);

  // Quick Dispatch Task Modal
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
  const [dispatchTitle, setDispatchTitle] = useState('');
  const [dispatchCode, setDispatchCode] = useState('');
  const [dispatchPriority, setDispatchPriority] = useState<PriorityLevel>('medium');
  const [dispatchDueDate, setDispatchDueDate] = useState('2026-06-30');
  const projects = localStore.getProjects();
  const [dispatchProjectId, setDispatchProjectId] = useState(projects[0]?.id || '');

  useEffect(() => {
    const current = agentService.getAgentById(agentId);
    setAgent(current);
    if (current) {
      setName(current.name);
      setPurpose(current.purpose);
      setTemperature(current.config.temperature ?? 0.2);
      setMaxTokens(current.config.max_tokens ?? 4096);
      setSystemPrompt(current.config.system_prompt ?? '');

      const tasks = localStore.getTasks().filter(t => t.assignee_id === current.id);
      setAssignedTasks(tasks);

      const logs = localStore.getAuditLogs().filter(l => l.resource_id === current.id || l.details?.code === current.code);
      setAgentLogs(logs);
    }
  }, [agentId]);

  if (!agent) {
    return (
      <div className="p-8 text-center bg-zinc-900 border border-zinc-800 rounded-lg">
        <Bot className="w-8 h-8 text-zinc-500 mx-auto mb-2" />
        <h3 className="text-sm font-semibold text-zinc-200">Agente não localizado</h3>
        <p className="text-xs text-zinc-500 mt-1">O identificador especificado não existe no registro.</p>
        <button
          onClick={() => onNavigate('/agents')}
          className="mt-4 px-3.5 py-1.5 text-xs font-medium text-amber-400 bg-zinc-800 rounded"
        >
          Retornar ao Parque de Agentes
        </button>
      </div>
    );
  }

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = agentService.updateAgent(agent.id, {
      name,
      purpose,
      config: {
        ...agent.config,
        temperature: Number(temperature),
        max_tokens: Number(maxTokens),
        system_prompt: systemPrompt,
      },
    });
    setAgent(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleRunSandbox = async () => {
    if (!testPrompt.trim()) return;
    setIsRunningTest(true);
    setTestResponse(null);

    // Realistic corporate constitutional evaluation response
    await new Promise(r => setTimeout(r, 650));

    const response = `[${agent.code} // Resposta de Validação Normativa]
Modelo Operacional: ${agent.model}
Timestamp: ${new Date().toISOString()}

Análise Preliminar:
1. Objeto submetido: "${testPrompt}"
2. Conformidade com Decreto DEC-2026-001: COMPATÍVEL. As cláusulas de isolamento RLS e auditoria imutável estão salvaguardadas.
3. Rito Deliberativo CNS-2026-001: QUÓRUM ATENDIDO. A autoridade executiva competente deliberou em sessão ordinária.
4. Conclusão do Agente: A demanda cumpre os requisitos regimentais vigentes. Nenhuma violação de integridade detectada na custódia documental.`;

    setTestResponse(response);
    setIsRunningTest(false);
  };

  const openDispatchModal = () => {
    setDispatchCode(`TSK-${Math.floor(100 + Math.random() * 900)}`);
    setDispatchTitle('');
    setDispatchPriority('medium');
    setDispatchDueDate('2026-07-15');
    setDispatchProjectId(projects[0]?.id || '');
    setIsDispatchModalOpen(true);
  };

  const handleSaveDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dispatchTitle.trim() || !dispatchCode.trim() || !dispatchProjectId) return;

    const prj = projects.find(p => p.id === dispatchProjectId);

    taskService.createTask({
      code: dispatchCode,
      title: dispatchTitle,
      description: `Tarefa despachada diretamente para o agente ${agent.name} (${agent.code})`,
      project_id: dispatchProjectId,
      project_name: prj?.name,
      status: 'in_progress',
      priority: dispatchPriority,
      due_date: dispatchDueDate,
      assignee_id: agent.id,
      assignee_name: agent.name,
      assignee_type: 'agent',
      reporter_id: localStore.getSessionUser()?.id || 'usr-001',
      reporter_name: localStore.getSessionUser()?.full_name || 'Admin',
    });

    const updatedTasks = localStore.getTasks().filter(t => t.assignee_id === agent.id);
    setAssignedTasks(updatedTasks);
    setIsDispatchModalOpen(false);
  };

  const handleDelete = () => {
    agentService.deleteAgent(agent.id);
    onNavigate('/agents');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={() => onNavigate('/agents')}
          className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 mb-3 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Voltar ao Diretório de Agentes</span>
        </button>

        <PageHeader
          kicker={`${agent.code} · v${agent.version}`}
          title={agent.name}
          description={agent.purpose}
          actions={
            <div className="flex items-center gap-2">
              <StatusBadge status={agent.status} />
              <button
                onClick={() =>
                  agentService.toggleStatus(
                    agent.id,
                    agent.status === 'active' ? 'standby' : 'active'
                  )
                }
                className="px-3 py-1.5 text-xs font-medium text-zinc-300 hover:text-zinc-100 bg-zinc-900 border border-zinc-800 rounded transition-colors"
              >
                {agent.status === 'active' ? 'Pausar Agente' : 'Ativar Agente'}
              </button>
              <button
                onClick={openDispatchModal}
                className="px-3 py-1.5 text-xs font-semibold text-zinc-950 bg-amber-400 hover:bg-amber-300 rounded transition-colors flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Despachar Tarefa</span>
              </button>
              <button
                onClick={() => setIsDeleting(true)}
                className="p-1.5 text-rose-400 hover:bg-rose-950/40 border border-zinc-800 rounded transition-colors"
                title="Descomissionar agente"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Configuration & Parameters */}
        <div className="lg:col-span-2 space-y-6">
          {/* Live Interactive Sandbox */}
          <div className="p-6 bg-zinc-900/80 border border-amber-500/30 rounded-lg space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-semibold text-zinc-100">
                  Console de Teste & Validação Cognitiva
                </h3>
              </div>
              <span className="text-[10px] font-mono text-zinc-400 bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800">
                Sandbox Integrado
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Prompt de Teste / Instrução para o Agente:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={testPrompt}
                    onChange={e => setTestPrompt(e.target.value)}
                    placeholder="Instrução para validação do agente..."
                    className="flex-1 px-3 py-2 text-xs bg-zinc-950 border border-zinc-800 rounded text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-500 font-mono"
                  />
                  <button
                    onClick={handleRunSandbox}
                    disabled={isRunningTest || !testPrompt.trim()}
                    className="px-4 py-2 text-xs font-semibold text-zinc-950 bg-amber-400 hover:bg-amber-300 rounded transition-colors flex items-center gap-1.5 disabled:opacity-50 shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isRunningTest ? 'Avaliando...' : 'Executar'}</span>
                  </button>
                </div>
              </div>

              {testResponse && (
                <div className="p-4 bg-zinc-950 rounded border border-zinc-800 text-xs space-y-1 font-mono text-zinc-300 leading-relaxed whitespace-pre-line animate-in fade-in duration-150">
                  {testResponse}
                </div>
              )}
            </div>
          </div>

          {/* Parameters & System Prompt */}
          <div className="p-6 bg-zinc-900/60 border border-zinc-800 rounded-lg">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-semibold text-zinc-100">
                  Parâmetros de Execução & System Prompt
                </h3>
              </div>
              {savedSuccess && (
                <span className="text-xs text-emerald-400 font-mono">
                  ✓ Configurações salvas
                </span>
              )}
            </div>

            <form onSubmit={handleSaveConfig} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Nome do Agente" required>
                  <TextInput
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                  />
                </FormField>

                <FormField label="Modelo Homologado">
                  <TextInput
                    value={agent.model}
                    disabled
                    className="bg-zinc-950 text-zinc-400 font-mono"
                  />
                </FormField>
              </div>

              <FormField label="Finalidade Operacional">
                <TextInput
                  value={purpose}
                  onChange={e => setPurpose(e.target.value)}
                  required
                />
              </FormField>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Temperatura Cognitiva (0.0 a 1.0)">
                  <TextInput
                    type="number"
                    step="0.05"
                    min="0"
                    max="1"
                    value={temperature}
                    onChange={e => setTemperature(Number(e.target.value))}
                  />
                </FormField>

                <FormField label="Limite de Tokens de Resposta">
                  <TextInput
                    type="number"
                    step="512"
                    value={maxTokens}
                    onChange={e => setMaxTokens(Number(e.target.value))}
                  />
                </FormField>
              </div>

              <FormField label="Prompt Diretivo do Sistema (System Instructions)">
                <TextArea
                  value={systemPrompt}
                  onChange={e => setSystemPrompt(e.target.value)}
                  rows={5}
                  placeholder="Diretrizes restritivas de atuação e escopo corporativo..."
                />
              </FormField>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-zinc-950 bg-amber-400 hover:bg-amber-300 rounded transition-colors flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Salvar Parâmetros</span>
                </button>
              </div>
            </form>
          </div>

          {/* Assigned Tasks */}
          <div className="p-6 bg-zinc-900/60 border border-zinc-800 rounded-lg">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-semibold text-zinc-100">
                  Tarefas em Fila para o Agente ({assignedTasks.length})
                </h3>
              </div>
              <button
                onClick={() => onNavigate('/tasks')}
                className="text-xs text-amber-400 hover:text-amber-300"
              >
                Gerenciar Fila
              </button>
            </div>

            {assignedTasks.length === 0 ? (
              <p className="text-xs text-zinc-500 italic py-3 text-center">
                Nenhuma tarefa pendente atribuída diretamente a este agente no momento.
              </p>
            ) : (
              <div className="space-y-2">
                {assignedTasks.map(t => (
                  <div
                    key={t.id}
                    onClick={() => onNavigate('/tasks')}
                    className="flex items-center justify-between p-3 bg-zinc-950/40 border border-zinc-800 rounded hover:border-zinc-700 text-xs cursor-pointer transition-colors"
                  >
                    <div>
                      <span className="font-mono text-[10px] text-zinc-500 block">{t.code}</span>
                      <span className="text-zinc-200 font-medium">{t.title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-zinc-500">{t.due_date}</span>
                      <StatusBadge status={t.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Capabilities & Auditing */}
        <div className="space-y-6">
          <div className="p-5 bg-zinc-900/60 border border-zinc-800 rounded-lg">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-3">
              Capacidades Homologadas
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {(agent.config.capabilities || ['análise estática', 'validação de integridade']).map((cap, i) => (
                <span
                  key={i}
                  className="px-2 py-1 rounded bg-zinc-950 border border-zinc-800 text-zinc-300 font-mono text-[11px]"
                >
                  {cap}
                </span>
              ))}
            </div>
            <p className="text-[11px] text-zinc-500 mt-4 leading-relaxed">
              Agente opera em conformidade com o Decreto DEC-2026-002 e a Deliberação CNS-2026-002.
            </p>
          </div>

          <div className="p-5 bg-zinc-900/60 border border-zinc-800 rounded-lg">
            <div className="flex items-center gap-2 pb-3 mb-3 border-b border-zinc-800">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Eventos de Auditoria do Agente
              </h4>
            </div>

            {agentLogs.length === 0 ? (
              <p className="text-xs text-zinc-500 italic py-2 text-center">
                Sem eventos registrados no log.
              </p>
            ) : (
              <div className="space-y-2 text-xs">
                {agentLogs.slice(0, 5).map(l => (
                  <div key={l.id} className="p-2.5 rounded bg-zinc-950/60 border border-zinc-800">
                    <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
                      <span>{l.action}</span>
                      <span>{new Date(l.created_at).toLocaleTimeString('pt-BR')}</span>
                    </div>
                    <p className="text-[11px] text-zinc-300 mt-1 font-mono truncate">
                      Por: {l.user_email}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Dispatch Task directly to Agent */}
      <Modal
        isOpen={isDispatchModalOpen}
        onClose={() => setIsDispatchModalOpen(false)}
        title={`Despachar Tarefa para ${agent.name}`}
        description="Atribuição direta de demanda para o pipeline de IA."
        maxWidth="md"
      >
        <form onSubmit={handleSaveDispatch} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Código" required>
              <TextInput
                value={dispatchCode}
                onChange={e => setDispatchCode(e.target.value.toUpperCase())}
                required
              />
            </FormField>

            <FormField label="Prioridade">
              <SelectInput
                value={dispatchPriority}
                onChange={e => setDispatchPriority(e.target.value as any)}
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
              value={dispatchTitle}
              onChange={e => setDispatchTitle(e.target.value)}
              placeholder="Ex: Análise de conformidade de contrato"
              required
            />
          </FormField>

          <FormField label="Projeto Vinculado" required>
            <SelectInput
              value={dispatchProjectId}
              onChange={e => setDispatchProjectId(e.target.value)}
              options={projects.map(p => ({
                value: p.id,
                label: `${p.name} (${p.code})`,
              }))}
            />
          </FormField>

          <FormField label="Prazo de Entrega">
            <TextInput
              type="date"
              value={dispatchDueDate}
              onChange={e => setDispatchDueDate(e.target.value)}
            />
          </FormField>

          <FormActions
            onCancel={() => setIsDispatchModalOpen(false)}
            submitLabel="Confirmar Despacho"
          />
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={isDeleting}
        onClose={() => setIsDeleting(false)}
        onConfirm={handleDelete}
        title="Descomissionar Agente de IA"
        message={`Confirma o descomissionamento definitivo do agente "${agent.name}" (${agent.code})?`}
        confirmLabel="Descomissionar"
      />
    </div>
  );
};
