/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { dashboardService } from '../services/dashboardService';
import { localStore } from '../services/supabaseClient';
import { DashboardMetrics } from '../types';
import { PageHeader } from '../components/layout/PageHeader';
import { StatCard } from '../components/data/StatCard';
import { ActivityTimeline } from '../components/organization/ActivityTimeline';
import { StatusBadge } from '../components/organization/StatusBadge';
import {
  FolderGit2,
  Bot,
  CheckSquare,
  Gavel,
  Scale,
  FileText,
  Users,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  TrendingUp
} from 'lucide-react';

interface DashboardPageProps {
  onNavigate: (route: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const [metrics, setMetrics] = useState<DashboardMetrics>(dashboardService.getMetrics());

  useEffect(() => {
    const handleUpdate = () => {
      setMetrics(dashboardService.getMetrics());
    };
    return localStore.subscribe(handleUpdate);
  }, []);

  const projects = localStore.getProjects().slice(0, 3);
  const tasks = localStore.getTasks().slice(0, 4);
  const decisions = localStore.getDecisions().slice(0, 3);
  const deliberations = localStore.getDeliberations().slice(0, 2);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        kicker="Visão Executiva S.A."
        title="Painel Estratégico Corporativo"
        description="Monitoramento centralizado de projetos, capacidade autônoma de IA, cumprimento de tarefas e conformidade com deliberações estatutárias."
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('/agency-intelligence')}
              className="px-3 py-1.5 text-xs font-medium text-zinc-300 hover:text-zinc-100 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded transition-colors whitespace-nowrap"
            >
              Biblioteca de Agentes
            </button>
            <button
              onClick={() => onNavigate('/governance')}
              className="px-3 py-1.5 text-xs font-medium text-zinc-300 hover:text-zinc-100 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded transition-colors whitespace-nowrap"
            >
              Portal de Governança
            </button>
            <button
              onClick={() => onNavigate('/projects')}
              className="px-3 py-1.5 text-xs font-semibold text-zinc-950 bg-amber-400 hover:bg-amber-300 rounded transition-colors whitespace-nowrap"
            >
              Gerenciar Portfólio
            </button>
          </div>
        }
      />

      {/* Primary KPI Grid (All computed from real state) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Total de Projetos"
          value={metrics.total_projects}
          subValue={`${metrics.in_progress_projects} em andamento`}
          icon={FolderGit2}
          onClick={() => onNavigate('/projects')}
          trend={{ direction: 'up', text: '100% sob controle de cronograma' }}
        />

        <StatCard
          label="Agentes de IA Ativos"
          value={metrics.active_agents}
          subValue={`de ${metrics.total_agents} cadastrados`}
          icon={Bot}
          onClick={() => onNavigate('/agents')}
          trend={{ direction: 'neutral', text: 'Modelos Gemini 2.5 homologados' }}
        />

        <StatCard
          label="Tarefas Concluídas"
          value={metrics.completed_tasks}
          subValue={`${metrics.pending_tasks} pendentes`}
          icon={CheckSquare}
          onClick={() => onNavigate('/tasks')}
          trend={{ direction: 'up', text: 'Atribuições mistas (humanos e IA)' }}
        />

        <StatCard
          label="Decisões DEC"
          value={metrics.total_decisions}
          subValue={`${metrics.total_deliberations} deliberações CNS`}
          icon={Gavel}
          onClick={() => onNavigate('/decisions')}
          trend={{ direction: 'neutral', text: 'Conformidade regimental ativa' }}
        />
      </div>

      {/* Executive Cockpit: Enterprise Integration Modules */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div
          onClick={() => onNavigate('/strategy')}
          className="p-3 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-lg cursor-pointer transition-colors"
        >
          <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 mb-1">
            <span>Estratégia & OKRs</span>
            <span className="text-amber-400">68%</span>
          </div>
          <span className="text-xs font-semibold text-zinc-100 block">4 Pilares 2026</span>
          <span className="text-[10px] text-zinc-500 font-mono">6 Key Results ativos</span>
        </div>

        <div
          onClick={() => onNavigate('/operations')}
          className="p-3 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-lg cursor-pointer transition-colors"
        >
          <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 mb-1">
            <span>Operações & Alçadas</span>
            <span className="text-amber-400">58% IA</span>
          </div>
          <span className="text-xs font-semibold text-zinc-100 block">3 Pendências</span>
          <span className="text-[10px] text-zinc-500 font-mono">Orçamentos & Versões</span>
        </div>

        <div
          onClick={() => onNavigate('/ai')}
          className="p-3 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-lg cursor-pointer transition-colors"
        >
          <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 mb-1">
            <span>Hermes Runtime</span>
            <span className="text-emerald-400">Cluster 3/3</span>
          </div>
          <span className="text-xs font-semibold text-zinc-100 block">403 ms Latência</span>
          <span className="text-[10px] text-zinc-500 font-mono">25 sessões paralelas</span>
        </div>

        <div
          onClick={() => onNavigate('/commercial')}
          className="p-3 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-lg cursor-pointer transition-colors"
        >
          <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 mb-1">
            <span>Comercial CRM</span>
            <span className="text-emerald-400">R$ 1.68M</span>
          </div>
          <span className="text-xs font-semibold text-zinc-100 block">5 Oportunidades</span>
          <span className="text-[10px] text-zinc-500 font-mono">R$ 515k ARR ativo</span>
        </div>

        <div
          onClick={() => onNavigate('/financial')}
          className="p-3 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-lg cursor-pointer transition-colors"
        >
          <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 mb-1">
            <span>Financeiro (DEMO)</span>
            <span className="text-amber-400/90 bg-amber-400/10 px-1 py-0.2 rounded border border-amber-400/20 text-[9px]">DEMO</span>
          </div>
          <span className="text-xs font-semibold text-zinc-100 block">R$ 41.2k Cloud/IA</span>
          <span className="text-[10px] text-zinc-500 font-mono">Orçamentos sob gestão</span>
        </div>
      </div>

      {/* Main Grid: Projects & Tasks on left, Governance & Audit on right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Projects & Operations */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Projects Summary */}
          <div className="p-5 bg-zinc-900/60 border border-zinc-800 rounded-lg">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <FolderGit2 className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-semibold text-zinc-100">Projetos Prioritários</h3>
              </div>
              <button
                onClick={() => onNavigate('/projects')}
                className="text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1"
              >
                <span>Ver todos ({metrics.total_projects})</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {projects.map(p => (
                <div
                  key={p.id}
                  onClick={() => onNavigate(`/projects/${p.id}`)}
                  className="p-3.5 bg-zinc-950/60 border border-zinc-800/80 rounded hover:border-zinc-700 cursor-pointer transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono text-zinc-500 uppercase">
                        {p.code}
                      </span>
                      <h4 className="text-xs font-semibold text-zinc-200">{p.name}</h4>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <StatusBadge status={p.priority} />
                      <StatusBadge status={p.status} />
                    </div>
                  </div>
                  <div className="mt-2.5 flex items-center justify-between text-[11px] text-zinc-400">
                    <span>Líder: {p.lead_name || 'Não atribuído'}</span>
                    <span className="font-mono tabular-nums">Prazo: {p.due_date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pending Tasks & Activities */}
          <div className="p-5 bg-zinc-900/60 border border-zinc-800 rounded-lg">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-semibold text-zinc-100">Fila de Atividades Recentes</h3>
              </div>
              <button
                onClick={() => onNavigate('/tasks')}
                className="text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1"
              >
                <span>Painel de Tarefas</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2">
              {tasks.map(t => (
                <div
                  key={t.id}
                  onClick={() => onNavigate('/tasks')}
                  className="flex items-center justify-between p-3 bg-zinc-950/40 border border-zinc-800/70 rounded hover:border-zinc-700 text-xs transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-[10px] font-mono text-zinc-500">{t.code}</span>
                    <span className="text-zinc-200 font-medium truncate">{t.title}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] text-zinc-400 font-mono hidden sm:inline">
                      {t.assignee_name || 'Não alocado'}
                    </span>
                    <StatusBadge status={t.status} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Governance, Deliberations & Live Audit */}
        <div className="space-y-6">
          {/* Institutional Decisions & Council Deliberations */}
          <div className="p-5 bg-zinc-900/60 border border-zinc-800 rounded-lg">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Gavel className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-semibold text-zinc-100">Atos do Conselho (DEC/CNS)</h3>
              </div>
              <button
                onClick={() => onNavigate('/decisions')}
                className="text-xs text-amber-400 hover:text-amber-300 font-medium"
              >
                Ver todos
              </button>
            </div>

            <div className="space-y-3">
              {decisions.map(d => (
                <div
                  key={d.id}
                  onClick={() => onNavigate('/decisions')}
                  className="p-3 bg-zinc-950/50 border border-zinc-800/80 rounded hover:border-zinc-700 cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[10px] font-mono text-amber-400 uppercase font-semibold">
                      {d.dec_code}
                    </span>
                    <StatusBadge status={d.status} />
                  </div>
                  <h5 className="text-xs font-semibold text-zinc-200 line-clamp-1">{d.title}</h5>
                  <p className="text-[11px] text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                    {d.summary}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Audit Events Stream */}
          <div className="p-5 bg-zinc-900/60 border border-zinc-800 rounded-lg">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-semibold text-zinc-100">Trilha de Auditoria Recente</h3>
              </div>
              <button
                onClick={() => onNavigate('/audit')}
                className="text-xs text-amber-400 hover:text-amber-300 font-medium"
              >
                Histórico
              </button>
            </div>

            <ActivityTimeline logs={metrics.recent_activities} maxItems={4} />
          </div>
        </div>
      </div>
    </div>
  );
};
