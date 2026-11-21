/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { StatCard } from '../components/data/StatCard';
import { hermesService } from '../services/hermesService';
import { HermesRuntimeNode, HermesAgentSession, HermesSkill } from '../types';
import {
  Activity,
  Server,
  Cpu,
  Layers,
  Zap,
  RefreshCw,
  Sliders,
  DollarSign,
  Clock,
  Terminal,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';

interface HermesAIPageProps {
  onNavigate: (route: string) => void;
}

export const HermesAIPage: React.FC<HermesAIPageProps> = ({ onNavigate }) => {
  const [nodes, setNodes] = useState<HermesRuntimeNode[]>(() => hermesService.getNodes());
  const [sessions, setSessions] = useState<HermesAgentSession[]>(() => hermesService.getSessions());
  const [skills, setSkills] = useState<HermesSkill[]>(() => hermesService.getSkills());
  const [restartingNodeId, setRestartingNodeId] = useState<string | null>(null);

  const refreshData = () => {
    setNodes(hermesService.getNodes());
    setSessions(hermesService.getSessions());
    setSkills(hermesService.getSkills());
  };

  const handleRestartNode = (nodeId: string) => {
    setRestartingNodeId(nodeId);
    setTimeout(() => {
      hermesService.restartNode(nodeId);
      setRestartingNodeId(null);
      refreshData();
    }, 600);
  };

  const handleToggleSkill = (skillId: string, currentEnabled: boolean) => {
    hermesService.toggleSkill(skillId, !currentEnabled);
    refreshData();
  };

  const metrics = hermesService.getMetricsSummary();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Hermes AI Runtime & Telemetria"
        subtitle="Monitoramento em tempo real dos nós de inferência, sessões ativas de agentes e catálogo de skills."
        primaryAction={{
          label: 'Catálogo de Agentes',
          onClick: () => onNavigate('/agents'),
          icon: Zap,
        }}
      />

      {/* Conceptual Architectural Banner */}
      <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <Server className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="text-xs font-semibold text-zinc-100 uppercase tracking-wide block">
              Topologia de Execução: Hermes Runtime & Paperclip Synchronization
            </span>
            <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
              O <strong className="text-zinc-200">Paperclip</strong> orquestra a força de trabalho e delega tarefas; o <strong className="text-zinc-200">Hermes</strong> executa os runtimes, modelos de inferência e ferramentas constitutionais; a <strong className="text-zinc-200">NettosCorp Enterprise</strong> administra a estratégia, custos e governança corporativa.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/50 border border-emerald-900/60 px-2 py-1 rounded">
            Cluster Hermes: v2.8.4
          </span>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Nós de Runtime"
          value={`${metrics.onlineNodes} / ${metrics.totalNodes}`}
          subtext="Instâncias de inferência ativas"
          icon={Server}
        />
        <StatCard
          label="Sessões Ativas"
          value={metrics.totalActiveSessions}
          subtext="Agentes em execução paralela"
          icon={Activity}
        />
        <StatCard
          label="Latência Média"
          value={`${metrics.avgLatency} ms`}
          subtext="Tempo de resposta dos modelos"
          icon={Clock}
        />
        <StatCard
          label="Custo Acumulado (USD)"
          value={`$ ${metrics.totalCostUsd}`}
          subtext={`${(metrics.totalTokens / 1000).toFixed(1)}k tokens processados`}
          icon={DollarSign}
        />
      </div>

      {/* Nodes Health Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-zinc-100">
            Nós de Inferência do Cluster Hermes ({nodes.length})
          </h3>
          <span className="text-xs font-mono text-zinc-500">
            Último Heartbeat: {new Date().toLocaleTimeString('pt-BR')}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {nodes.map(node => {
            const isOnline = node.status === 'online';
            const isDegraded = node.status === 'degraded';
            const isRestarting = restartingNodeId === node.node_id;

            return (
              <div
                key={node.node_id}
                className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 space-y-3 hover:border-zinc-700 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="min-w-0 pr-2">
                    <span className="font-mono text-xs font-semibold text-zinc-200 block truncate">
                      {node.hostname}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500">
                      {node.version} · {node.source}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded border shrink-0 ${
                      isOnline
                        ? 'text-emerald-400 bg-emerald-950/40 border-emerald-900/50'
                        : isDegraded
                        ? 'text-amber-400 bg-amber-950/40 border-amber-900/50'
                        : 'text-rose-400 bg-rose-950/40 border-rose-900/50'
                    }`}
                  >
                    {node.status.toUpperCase()}
                  </span>
                </div>

                {/* Resource Gauges */}
                <div className="space-y-2 pt-1">
                  <div>
                    <div className="flex justify-between text-[11px] font-mono text-zinc-400 mb-1">
                      <span>Uso de CPU</span>
                      <span>{node.cpu_percent}%</span>
                    </div>
                    <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          node.cpu_percent > 70 ? 'bg-rose-400' : 'bg-amber-400'
                        }`}
                        style={{ width: `${node.cpu_percent}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] font-mono text-zinc-400 mb-1">
                      <span>Memória RAM</span>
                      <span>{(node.memory_used_mb / 1024).toFixed(1)} GB</span>
                    </div>
                    <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-zinc-400 rounded-full"
                        style={{ width: `${Math.min(100, (node.memory_used_mb / 24000) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Models Supported */}
                <div className="pt-2 border-t border-zinc-800/80">
                  <span className="text-[10px] font-mono uppercase text-zinc-500 block mb-1">
                    Model Pool
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {node.model_pool.map(m => (
                      <span
                        key={m}
                        className="text-[10px] font-mono text-zinc-300 bg-zinc-950 px-1.5 py-0.5 rounded border border-zinc-800"
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action Button */}
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => handleRestartNode(node.node_id)}
                    disabled={isRestarting}
                    className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-amber-400 disabled:opacity-50 transition-colors font-mono"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isRestarting ? 'animate-spin text-amber-400' : ''}`} />
                    <span>{isRestarting ? 'Reiniciando...' : 'Reiniciar Nó'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Live Sessions Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-zinc-100">
              Sessões Ativas de Agentes (Hermes Runtime)
            </h3>
            <p className="text-xs text-zinc-500 font-mono mt-0.5">
              Consumo de tokens e latência aferidos por chamada
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-500 font-mono text-[11px] uppercase">
                <th className="py-2.5 px-3">Agente</th>
                <th className="py-2.5 px-3">Modelo</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Tokens Prompt</th>
                <th className="py-2.5 px-3 text-right">Tokens Conclusão</th>
                <th className="py-2.5 px-3 text-right">Latência</th>
                <th className="py-2.5 px-3 text-right">Custo USD</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-mono">
              {sessions.map(s => (
                <tr key={s.id} className="hover:bg-zinc-850/50 transition-colors">
                  <td className="py-2.5 px-3">
                    <span className="text-zinc-200 font-semibold">{s.agent_name}</span>
                    <span className="text-[10px] text-zinc-500 block">{s.agent_code}</span>
                  </td>
                  <td className="py-2.5 px-3 text-zinc-300">{s.model}</td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded border ${
                        s.status === 'active'
                          ? 'text-emerald-400 bg-emerald-950/40 border-emerald-900/50'
                          : 'text-zinc-400 bg-zinc-950 border-zinc-800'
                      }`}
                    >
                      {s.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right text-zinc-300">
                    {s.prompt_tokens.toLocaleString('pt-BR')}
                  </td>
                  <td className="py-2.5 px-3 text-right text-zinc-300">
                    {s.completion_tokens.toLocaleString('pt-BR')}
                  </td>
                  <td className="py-2.5 px-3 text-right text-amber-400">
                    {s.latency_ms} ms
                  </td>
                  <td className="py-2.5 px-3 text-right text-emerald-400">
                    ${s.cost_usd.toFixed(4)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Skills Catalog */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-zinc-100">
              Catálogo de Skills & Ferramentas Hermes ({skills.length})
            </h3>
            <p className="text-xs text-zinc-500 font-mono mt-0.5">
              Habilitadores de ambiente, vetores RAG, sandbox e guardrails
            </p>
          </div>
          <span className="text-xs font-mono text-zinc-400">
            {metrics.enabledSkillsCount} de {skills.length} habilitadas
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {skills.map(skill => (
            <div
              key={skill.id}
              className="bg-zinc-950 border border-zinc-800 rounded-lg p-3.5 flex flex-col justify-between hover:border-zinc-700 transition-colors"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <span className="text-xs font-semibold text-zinc-200">{skill.name}</span>
                  <button
                    onClick={() => handleToggleSkill(skill.id, skill.enabled)}
                    className={`text-[10px] font-mono px-2 py-0.5 rounded border transition-colors ${
                      skill.enabled
                        ? 'text-emerald-400 bg-emerald-950/40 border-emerald-900/50'
                        : 'text-zinc-500 bg-zinc-900 border-zinc-800'
                    }`}
                  >
                    {skill.enabled ? 'HABILITADA' : 'DESABILITADA'}
                  </button>
                </div>

                <span className="text-[10px] font-mono text-amber-400/90 block mb-1">
                  {skill.code}
                </span>

                <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                  {skill.description}
                </p>
              </div>

              <div className="border-t border-zinc-800/80 pt-2 mt-3 flex items-center justify-between text-[10px] font-mono text-zinc-500">
                <span>Binding: {skill.runtime_binding}</span>
                <span>{skill.category}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
