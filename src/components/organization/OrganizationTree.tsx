/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Department, Position, Organization, AIAgent, Project } from '../../types';
import { StatusBadge } from './StatusBadge';
import { localStore } from '../../services/supabaseClient';
import {
  Building2,
  Layers,
  Briefcase,
  Users,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Bot,
  User,
  ArrowRight,
  Shield,
  FolderGit2,
  Network,
  ListTree,
  Search,
  Maximize2,
  Minimize2,
  SlidersHorizontal,
  ExternalLink,
  Cpu,
  CheckCircle2,
  Sparkles,
  Zap,
  Clock,
  X
} from 'lucide-react';

interface OrganizationTreeProps {
  organization: Organization;
  departments: Department[];
  positions: Position[];
  onSelectDepartment?: (dept: Department) => void;
  onNavigate?: (route: string) => void;
}

type SelectedEntity =
  | { type: 'org'; data: Organization }
  | { type: 'department'; data: Department }
  | { type: 'agent'; data: AIAgent }
  | { type: 'position'; data: Position }
  | { type: 'project'; data: Project }
  | null;

export const OrganizationTree: React.FC<OrganizationTreeProps> = ({
  organization,
  departments,
  positions,
  onSelectDepartment,
  onNavigate,
}) => {
  const [viewFormat, setViewFormat] = useState<'chart' | 'list'>('chart');
  const [searchQuery, setSearchQuery] = useState('');

  // Expand / collapse states
  const [rootExpanded, setRootExpanded] = useState<boolean>(true);
  const [expandedDepts, setExpandedDepts] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    departments.forEach(d => {
      initial[d.id] = true;
    });
    return initial;
  });

  const [expandedAgentGroups, setExpandedAgentGroups] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    departments.forEach(d => {
      initial[d.id] = true;
    });
    return initial;
  });

  const [expandedPositionGroups, setExpandedPositionGroups] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    departments.forEach(d => {
      initial[d.id] = true;
    });
    return initial;
  });

  const [expandedProjectGroups, setExpandedProjectGroups] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    departments.forEach(d => {
      initial[d.id] = false;
    });
    return initial;
  });

  const [expandedAgentDetails, setExpandedAgentDetails] = useState<Record<string, boolean>>({});

  // Filters for sub-branches
  const [showAgents, setShowAgents] = useState(true);
  const [showPositions, setShowPositions] = useState(true);
  const [showProjects, setShowProjects] = useState(true);

  // Inspector panel
  const [selectedEntity, setSelectedEntity] = useState<SelectedEntity>(() =>
    departments[0] ? { type: 'department', data: departments[0] } : null
  );

  const allAgents = localStore.getAgents();
  const allProjects = localStore.getProjects();
  const allMembers = localStore.getProfiles();

  // Search matching computation
  const matchesSearch = useMemo(() => {
    if (!searchQuery.trim()) return () => false;
    const q = searchQuery.toLowerCase();
    return (text?: string) => Boolean(text && text.toLowerCase().includes(q));
  }, [searchQuery]);

  // Bulk expansion controls
  const handleExpandAll = () => {
    setRootExpanded(true);
    const newDepts: Record<string, boolean> = {};
    const newAgents: Record<string, boolean> = {};
    const newPos: Record<string, boolean> = {};
    const newPrj: Record<string, boolean> = {};
    departments.forEach(d => {
      newDepts[d.id] = true;
      newAgents[d.id] = true;
      newPos[d.id] = true;
      newPrj[d.id] = true;
    });
    setExpandedDepts(newDepts);
    setExpandedAgentGroups(newAgents);
    setExpandedPositionGroups(newPos);
    setExpandedProjectGroups(newPrj);
  };

  const handleCollapseAll = () => {
    setRootExpanded(false);
  };

  const handleCollapseToDepts = () => {
    setRootExpanded(true);
    const newDepts: Record<string, boolean> = {};
    const newAgents: Record<string, boolean> = {};
    const newPos: Record<string, boolean> = {};
    const newPrj: Record<string, boolean> = {};
    departments.forEach(d => {
      newDepts[d.id] = false;
      newAgents[d.id] = false;
      newPos[d.id] = false;
      newPrj[d.id] = false;
    });
    setExpandedDepts(newDepts);
    setExpandedAgentGroups(newAgents);
    setExpandedPositionGroups(newPos);
    setExpandedProjectGroups(newPrj);
  };

  const toggleDept = (deptId: string) => {
    setExpandedDepts(prev => ({ ...prev, [deptId]: !prev[deptId] }));
  };

  const toggleAgentGroup = (deptId: string) => {
    setExpandedAgentGroups(prev => ({ ...prev, [deptId]: !prev[deptId] }));
  };

  const togglePositionGroup = (deptId: string) => {
    setExpandedPositionGroups(prev => ({ ...prev, [deptId]: !prev[deptId] }));
  };

  const toggleProjectGroup = (deptId: string) => {
    setExpandedProjectGroups(prev => ({ ...prev, [deptId]: !prev[deptId] }));
  };

  const toggleAgentDetails = (agentId: string) => {
    setExpandedAgentDetails(prev => ({ ...prev, [agentId]: !prev[agentId] }));
  };

  return (
    <div className="space-y-4">
      {/* Control Bar: View Format, Search & Branch Toggles */}
      <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-lg flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Left: Search input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Buscar por departamento, agente IA, cargo ou gestor..."
            className="w-full pl-9 pr-8 py-1.5 text-xs bg-zinc-950 border border-zinc-800 rounded text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-700 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-2 p-0.5 text-zinc-500 hover:text-zinc-300"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Center: Branch Filters */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <label className="flex items-center gap-1.5 cursor-pointer text-zinc-400 hover:text-zinc-200 select-none">
            <input
              type="checkbox"
              checked={showAgents}
              onChange={e => setShowAgents(e.target.checked)}
              className="rounded bg-zinc-950 border-zinc-800 text-amber-400 focus:ring-0 w-3.5 h-3.5"
            />
            <span className="flex items-center gap-1">
              <Bot className="w-3.5 h-3.5 text-amber-400" /> Agentes IA ({allAgents.length})
            </span>
          </label>

          <span className="text-zinc-700">·</span>

          <label className="flex items-center gap-1.5 cursor-pointer text-zinc-400 hover:text-zinc-200 select-none">
            <input
              type="checkbox"
              checked={showPositions}
              onChange={e => setShowPositions(e.target.checked)}
              className="rounded bg-zinc-950 border-zinc-800 text-amber-400 focus:ring-0 w-3.5 h-3.5"
            />
            <span className="flex items-center gap-1">
              <Briefcase className="w-3.5 h-3.5 text-zinc-400" /> Cargos ({positions.length})
            </span>
          </label>

          <span className="text-zinc-700">·</span>

          <label className="flex items-center gap-1.5 cursor-pointer text-zinc-400 hover:text-zinc-200 select-none">
            <input
              type="checkbox"
              checked={showProjects}
              onChange={e => setShowProjects(e.target.checked)}
              className="rounded bg-zinc-950 border-zinc-800 text-amber-400 focus:ring-0 w-3.5 h-3.5"
            />
            <span className="flex items-center gap-1">
              <FolderGit2 className="w-3.5 h-3.5 text-zinc-400" /> Projetos ({allProjects.length})
            </span>
          </label>
        </div>

        {/* Right: Expand/Collapse Bulk Actions & View Switcher */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-[11px] font-mono">
            <button
              onClick={handleExpandAll}
              className="px-2 py-1 bg-zinc-950 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 rounded border border-zinc-800 transition-colors"
              title="Expandir todos os ramos e nós"
            >
              Expandir Tudo
            </button>
            <button
              onClick={handleCollapseToDepts}
              className="px-2 py-1 bg-zinc-950 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 rounded border border-zinc-800 transition-colors"
              title="Recolher nós filhos mantendo unidades"
            >
              Recolher Filhos
            </button>
            <button
              onClick={handleCollapseAll}
              className="px-2 py-1 bg-zinc-950 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 rounded border border-zinc-800 transition-colors"
              title="Recolher toda a árvore para a raiz"
            >
              Recolher Raiz
            </button>
          </div>

          <div className="flex items-center bg-zinc-950 border border-zinc-800 rounded p-0.5">
            <button
              onClick={() => setViewFormat('chart')}
              className={`p-1.5 rounded transition-colors ${
                viewFormat === 'chart'
                  ? 'bg-zinc-800 text-amber-400 shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
              title="Organograma Gráfico"
            >
              <Network className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewFormat('list')}
              className={`p-1.5 rounded transition-colors ${
                viewFormat === 'list'
                  ? 'bg-zinc-800 text-amber-400 shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
              title="Outliner Hierárquico"
            >
              <ListTree className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Container: Tree Canvas + Inspector Panel */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Left: Tree Canvas (3 cols) */}
        <div className="xl:col-span-3 bg-zinc-900/60 border border-zinc-800 rounded-lg p-6 overflow-x-auto min-h-[640px]">
          {viewFormat === 'chart' ? (
            /* Visual Hierarchical Tree */
            <div className="flex flex-col items-center min-w-[760px] pb-8">
              {/* Level 0: Root Organization Node */}
              <div
                onClick={() => setSelectedEntity({ type: 'org', data: organization })}
                className={`p-4 bg-zinc-950 rounded-xl border-2 transition-all cursor-pointer select-none text-center relative max-w-sm w-full shadow-2xl ${
                  selectedEntity?.type === 'org'
                    ? 'border-amber-400 ring-2 ring-amber-400/20'
                    : 'border-amber-500/50 hover:border-amber-400'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-400 text-zinc-950 font-black text-xs flex items-center justify-center mx-auto shadow-md">
                    N
                  </div>
                </div>

                <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-tight">
                  {organization.name}
                </h3>
                <p className="text-[11px] font-mono text-zinc-400 mt-0.5">
                  Conselho de Administração & Diretoria Executiva
                </p>

                <div className="mt-2.5 pt-2 border-t border-zinc-800/80 flex items-center justify-center gap-3 text-[11px] font-mono text-zinc-400">
                  <span>{departments.length} Unidades</span>
                  <span>·</span>
                  <span className="text-amber-400">🤖 {allAgents.length} Agentes IA</span>
                  <span>·</span>
                  <span>{positions.length} Cargos</span>
                </div>

                {/* Root Expand/Collapse Toggle */}
                <button
                  onClick={e => {
                    e.stopPropagation();
                    setRootExpanded(!rootExpanded);
                  }}
                  className="mt-3 px-3 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded text-[11px] font-mono text-zinc-300 hover:text-amber-300 transition-colors flex items-center justify-center gap-1.5 mx-auto"
                >
                  {rootExpanded ? (
                    <>
                      <ChevronUp className="w-3.5 h-3.5" />
                      <span>Recolher Departamentos</span>
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-3.5 h-3.5" />
                      <span>Expandir {departments.length} Departamentos</span>
                    </>
                  )}
                </button>
              </div>

              {/* Vertical stem from root */}
              {rootExpanded && (
                <>
                  <div className="w-0.5 h-8 bg-zinc-700/80" />

                  {/* Horizontal distributor rail */}
                  <div className="w-11/12 h-0.5 bg-zinc-700/80 relative">
                    <div className="absolute -top-1 left-0 w-2 h-2 rounded-full bg-zinc-600" />
                    <div className="absolute -top-1 right-0 w-2 h-2 rounded-full bg-zinc-600" />
                  </div>

                  {/* Departments Grid (Level 1) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full mt-4 items-start">
                    {departments.map(dept => {
                      const isDeptExpanded = Boolean(expandedDepts[dept.id]);
                      const isAgentsExpanded = Boolean(expandedAgentGroups[dept.id]);
                      const isPositionsExpanded = Boolean(expandedPositionGroups[dept.id]);
                      const isProjectsExpanded = Boolean(expandedProjectGroups[dept.id]);

                      const deptAgents = allAgents.filter(a => a.assigned_department_id === dept.id);
                      const deptPositions = positions.filter(p => p.department_id === dept.id);
                      const deptProjects = allProjects.filter(p => p.department_id === dept.id);

                      const isSelected =
                        selectedEntity?.type === 'department' && selectedEntity.data.id === dept.id;

                      const isDeptMatch =
                        matchesSearch(dept.name) ||
                        matchesSearch(dept.code) ||
                        matchesSearch(dept.manager_name);

                      return (
                        <div key={dept.id} className="flex flex-col items-center">
                          {/* Vertical connector drop from rail to department */}
                          <div className="w-0.5 h-4 bg-zinc-700/80 mb-0" />

                          {/* Department Card */}
                          <div
                            onClick={() => setSelectedEntity({ type: 'department', data: dept })}
                            className={`p-3.5 rounded-lg border w-full text-left transition-all cursor-pointer relative select-none ${
                              isSelected
                                ? 'bg-zinc-900 border-amber-400 ring-1 ring-amber-400/30 shadow-lg'
                                : isDeptMatch
                                ? 'bg-zinc-900 border-amber-500/80 shadow-md ring-1 ring-amber-500/20'
                                : 'bg-zinc-950/80 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/60'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-1 mb-1.5">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <Layers className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-amber-400' : 'text-zinc-500'}`} />
                                <span className="text-[10px] font-mono text-zinc-500">{dept.code}</span>
                              </div>
                              <StatusBadge status={dept.status} />
                            </div>

                            <h4 className="text-xs font-bold text-zinc-100 truncate mb-1">
                              {dept.name}
                            </h4>

                            <div className="text-[11px] text-zinc-400 truncate mb-2">
                              Gestor: <span className="text-zinc-200">{dept.manager_name || 'Liderança Aberta'}</span>
                            </div>

                            <div className="pt-2 border-t border-zinc-850 flex items-center justify-between text-[10px] font-mono text-zinc-400">
                              <span>Quadro: {dept.headcount || 0}</span>
                              <span className="text-amber-400">🤖 {deptAgents.length}</span>
                              <span>💼 {deptPositions.length}</span>
                            </div>

                            {/* Department Expansion Button */}
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                toggleDept(dept.id);
                              }}
                              className="mt-2.5 w-full py-1 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 rounded text-[10px] font-mono text-zinc-400 hover:text-zinc-200 flex items-center justify-center gap-1 transition-colors"
                            >
                              {isDeptExpanded ? (
                                <>
                                  <ChevronUp className="w-3 h-3" />
                                  <span>Recolher Nós Filhos</span>
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="w-3 h-3" />
                                  <span>
                                    Expandir ({deptAgents.length} IA · {deptPositions.length} Cargos)
                                  </span>
                                </>
                              )}
                            </button>
                          </div>

                          {/* Expanded Department Sub-Tree Branches */}
                          {isDeptExpanded && (
                            <div className="w-full flex flex-col items-center mt-0">
                              {/* Connector stem downwards to child nodes */}
                              <div className="w-0.5 h-4 bg-zinc-800" />

                              <div className="w-full space-y-3 p-2 bg-zinc-950/60 border border-zinc-800/80 rounded-lg">
                                {/* 1. AI AGENTS BRANCH */}
                                {showAgents && (
                                  <div className="space-y-1.5">
                                    <div
                                      onClick={() => toggleAgentGroup(dept.id)}
                                      className="flex items-center justify-between p-1.5 rounded bg-amber-950/20 border border-amber-900/30 cursor-pointer hover:bg-amber-950/30 transition-colors"
                                    >
                                      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-300">
                                        <Bot className="w-3.5 h-3.5 text-amber-400" />
                                        <span>Agentes de IA ({deptAgents.length})</span>
                                      </div>
                                      <button className="text-amber-400/80">
                                        {isAgentsExpanded ? (
                                          <ChevronUp className="w-3.5 h-3.5" />
                                        ) : (
                                          <ChevronDown className="w-3.5 h-3.5" />
                                        )}
                                      </button>
                                    </div>

                                    {isAgentsExpanded && (
                                      <div className="space-y-1.5 pl-2 border-l border-amber-500/30 ml-2">
                                        {deptAgents.length === 0 ? (
                                          <div className="py-2 text-[10px] text-zinc-500 italic font-mono text-center">
                                            Nenhum agente vinculado
                                          </div>
                                        ) : (
                                          deptAgents.map(agent => {
                                            const isAgentSelected =
                                              selectedEntity?.type === 'agent' &&
                                              selectedEntity.data.id === agent.id;
                                            const isAgentMatch =
                                              matchesSearch(agent.name) ||
                                              matchesSearch(agent.code) ||
                                              matchesSearch(agent.model);
                                            const isDetailsOpen = Boolean(expandedAgentDetails[agent.id]);

                                            return (
                                              <div
                                                key={agent.id}
                                                onClick={e => {
                                                  e.stopPropagation();
                                                  setSelectedEntity({ type: 'agent', data: agent });
                                                }}
                                                className={`p-2 rounded border text-left transition-all cursor-pointer ${
                                                  isAgentSelected
                                                    ? 'bg-zinc-900 border-amber-400 shadow-sm'
                                                    : isAgentMatch
                                                    ? 'bg-zinc-900 border-amber-500/80 ring-1 ring-amber-500/30'
                                                    : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
                                                }`}
                                              >
                                                <div className="flex items-start justify-between gap-1 mb-1">
                                                  <div className="min-w-0 pr-1">
                                                    <span className="text-[10px] font-mono text-amber-400 block">
                                                      {agent.code}
                                                    </span>
                                                    <h6 className="text-[11px] font-semibold text-zinc-100 truncate">
                                                      {agent.name}
                                                    </h6>
                                                  </div>
                                                  <StatusBadge status={agent.status} />
                                                </div>

                                                <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 mb-1">
                                                  <span>{agent.model}</span>
                                                  <span>{agent.version}</span>
                                                </div>

                                                {/* Agent Expand Details Trigger */}
                                                <div className="pt-1 border-t border-zinc-850 flex items-center justify-between text-[10px] font-mono">
                                                  <button
                                                    onClick={e => {
                                                      e.stopPropagation();
                                                      toggleAgentDetails(agent.id);
                                                    }}
                                                    className="text-zinc-500 hover:text-zinc-300 flex items-center gap-0.5"
                                                  >
                                                    <span>{isDetailsOpen ? 'Ocultar' : 'Capacidades'}</span>
                                                    {isDetailsOpen ? (
                                                      <ChevronUp className="w-2.5 h-2.5" />
                                                    ) : (
                                                      <ChevronDown className="w-2.5 h-2.5" />
                                                    )}
                                                  </button>

                                                  {onNavigate && (
                                                    <button
                                                      onClick={e => {
                                                        e.stopPropagation();
                                                        onNavigate(`/agents/${agent.id}`);
                                                      }}
                                                      className="text-amber-400 hover:text-amber-300 flex items-center gap-0.5"
                                                      title="Abrir detalhes completos e sandbox"
                                                    >
                                                      <span>Console</span>
                                                      <ArrowRight className="w-2.5 h-2.5" />
                                                    </button>
                                                  )}
                                                </div>

                                                {/* In-tree Agent Expanded Details */}
                                                {isDetailsOpen && (
                                                  <div className="mt-2 pt-2 border-t border-zinc-850/80 space-y-1.5 text-[10px] font-mono text-zinc-400">
                                                    <p className="line-clamp-2 text-zinc-300 font-sans leading-tight">
                                                      {agent.purpose}
                                                    </p>
                                                    {agent.config.capabilities && agent.config.capabilities.length > 0 && (
                                                      <div className="flex flex-wrap gap-1 pt-1">
                                                        {agent.config.capabilities.map((c, idx) => (
                                                          <span
                                                            key={idx}
                                                            className="px-1 py-0.2 bg-zinc-900 border border-zinc-800 rounded text-[9px] text-zinc-300"
                                                          >
                                                            {c}
                                                          </span>
                                                        ))}
                                                      </div>
                                                    )}
                                                  </div>
                                                )}
                                              </div>
                                            );
                                          })
                                        )}
                                      </div>
                                    )}
                                  </div>
                                )}

                                {/* 2. POSITIONS BRANCH */}
                                {showPositions && (
                                  <div className="space-y-1.5">
                                    <div
                                      onClick={() => togglePositionGroup(dept.id)}
                                      className="flex items-center justify-between p-1.5 rounded bg-zinc-900/60 border border-zinc-800 cursor-pointer hover:bg-zinc-900 transition-colors"
                                    >
                                      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-zinc-300">
                                        <Briefcase className="w-3.5 h-3.5 text-zinc-500" />
                                        <span>Cargos & Liderança ({deptPositions.length})</span>
                                      </div>
                                      <button className="text-zinc-500">
                                        {isPositionsExpanded ? (
                                          <ChevronUp className="w-3.5 h-3.5" />
                                        ) : (
                                          <ChevronDown className="w-3.5 h-3.5" />
                                        )}
                                      </button>
                                    </div>

                                    {isPositionsExpanded && (
                                      <div className="space-y-1 pl-2 border-l border-zinc-800 ml-2">
                                        {deptPositions.map(pos => {
                                          const isPosSelected =
                                            selectedEntity?.type === 'position' &&
                                            selectedEntity.data.id === pos.id;
                                          return (
                                            <div
                                              key={pos.id}
                                              onClick={e => {
                                                e.stopPropagation();
                                                setSelectedEntity({ type: 'position', data: pos });
                                              }}
                                              className={`p-1.5 rounded border text-left cursor-pointer transition-colors ${
                                                isPosSelected
                                                  ? 'bg-zinc-900 border-amber-400/80 text-zinc-100'
                                                  : 'bg-zinc-950 border-zinc-850 hover:border-zinc-750 text-zinc-300'
                                              }`}
                                            >
                                              <div className="flex items-center justify-between gap-1">
                                                <span className="text-[10px] font-medium truncate">
                                                  {pos.title}
                                                </span>
                                                <span className="text-[9px] font-mono text-zinc-500 shrink-0">
                                                  {pos.level}
                                                </span>
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    )}
                                  </div>
                                )}

                                {/* 3. PROJECTS BRANCH */}
                                {showProjects && deptProjects.length > 0 && (
                                  <div className="space-y-1.5">
                                    <div
                                      onClick={() => toggleProjectGroup(dept.id)}
                                      className="flex items-center justify-between p-1.5 rounded bg-zinc-900/60 border border-zinc-800 cursor-pointer hover:bg-zinc-900 transition-colors"
                                    >
                                      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-zinc-300">
                                        <FolderGit2 className="w-3.5 h-3.5 text-zinc-500" />
                                        <span>Projetos ({deptProjects.length})</span>
                                      </div>
                                      <button className="text-zinc-500">
                                        {isProjectsExpanded ? (
                                          <ChevronUp className="w-3.5 h-3.5" />
                                        ) : (
                                          <ChevronDown className="w-3.5 h-3.5" />
                                        )}
                                      </button>
                                    </div>

                                    {isProjectsExpanded && (
                                      <div className="space-y-1 pl-2 border-l border-zinc-800 ml-2">
                                        {deptProjects.map(proj => (
                                          <div
                                            key={proj.id}
                                            onClick={e => {
                                              e.stopPropagation();
                                              setSelectedEntity({ type: 'project', data: proj });
                                            }}
                                            className="p-1.5 rounded bg-zinc-950 border border-zinc-850 flex items-center justify-between text-[10px] cursor-pointer hover:border-zinc-700"
                                          >
                                            <span className="text-zinc-200 truncate">{proj.name}</span>
                                            <StatusBadge status={proj.status} />
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          ) : (
            /* Nested Hierarchical Outline (List View) */
            <div className="space-y-3">
              <div className="p-3 bg-zinc-950 border border-amber-500/40 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-amber-400 text-zinc-950 font-bold text-xs flex items-center justify-center">
                    N
                  </div>
                  <div>
                    <span className="text-xs font-bold text-zinc-100">{organization.name}</span>
                    <span className="text-[10px] font-mono text-zinc-500 block">
                      Conselho de Administração
                    </span>
                  </div>
                </div>
                <div className="text-xs font-mono text-zinc-400">
                  {departments.length} Departamentos · {allAgents.length} Agentes
                </div>
              </div>

              {departments.map(dept => {
                const isExpanded = Boolean(expandedDepts[dept.id]);
                const deptAgents = allAgents.filter(a => a.assigned_department_id === dept.id);
                const deptPositions = positions.filter(p => p.department_id === dept.id);

                return (
                  <div key={dept.id} className="border border-zinc-800 rounded-lg bg-zinc-950/40 overflow-hidden">
                    <div
                      onClick={() => toggleDept(dept.id)}
                      className="flex items-center justify-between p-3 hover:bg-zinc-900/60 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <button className="text-zinc-500 hover:text-zinc-200">
                          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </button>
                        <Layers className="w-4 h-4 text-amber-400" />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-zinc-100">{dept.name}</span>
                            <span className="text-[10px] font-mono text-zinc-500 bg-zinc-900 px-1.5 py-0.2 rounded border border-zinc-800">
                              {dept.code}
                            </span>
                          </div>
                          <span className="text-[11px] text-zinc-400">
                            Gestor: {dept.manager_name || 'Liderança não atribuída'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono text-amber-400">
                          🤖 {deptAgents.length} Agentes
                        </span>
                        <span className="text-xs font-mono text-zinc-400">
                          💼 {deptPositions.length} Cargos
                        </span>
                        <StatusBadge status={dept.status} />
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="px-6 py-4 border-t border-zinc-800/80 bg-zinc-900/30 space-y-4">
                        {/* Agents Section */}
                        {deptAgents.length > 0 && (
                          <div>
                            <span className="text-[10px] font-semibold uppercase text-amber-400 tracking-wider block mb-2 flex items-center gap-1.5">
                              <Bot className="w-3.5 h-3.5 text-amber-400" /> Agentes de IA Homologados ({deptAgents.length})
                            </span>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {deptAgents.map(ag => (
                                <div
                                  key={ag.id}
                                  onClick={() => setSelectedEntity({ type: 'agent', data: ag })}
                                  className="p-2.5 rounded bg-zinc-950 border border-zinc-800 hover:border-zinc-700 flex items-center justify-between text-xs cursor-pointer"
                                >
                                  <div>
                                    <span className="text-zinc-200 font-semibold block">{ag.name}</span>
                                    <span className="text-[10px] font-mono text-zinc-500">
                                      {ag.code} · {ag.model}
                                    </span>
                                  </div>
                                  <StatusBadge status={ag.status} />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Positions Section */}
                        <div>
                          <span className="text-[10px] font-semibold uppercase text-zinc-400 tracking-wider block mb-2">
                            Cargos & Posições Estruturadas ({deptPositions.length})
                          </span>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {deptPositions.map(pos => (
                              <div
                                key={pos.id}
                                onClick={() => setSelectedEntity({ type: 'position', data: pos })}
                                className="p-2 rounded bg-zinc-950 border border-zinc-800 flex items-center justify-between text-xs cursor-pointer"
                              >
                                <span className="text-zinc-200 font-medium">{pos.title}</span>
                                <span className="text-[10px] font-mono text-zinc-400 bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800">
                                  {pos.level}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Inspector Details Panel (1 col) */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-lg p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="pb-3 border-b border-zinc-800 flex items-center justify-between">
              <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider block">
                Inspetor de Entidade
              </span>
              {selectedEntity && (
                <span className="text-[10px] font-mono text-zinc-500 uppercase bg-zinc-950 px-1.5 py-0.5 rounded border border-zinc-800">
                  {selectedEntity.type}
                </span>
              )}
            </div>

            {selectedEntity ? (
              selectedEntity.type === 'department' ? (
                /* Department Details */
                <div className="space-y-4 text-xs">
                  <div>
                    <span className="text-[10px] font-mono text-zinc-500">{selectedEntity.data.code}</span>
                    <h4 className="text-sm font-bold text-zinc-100">{selectedEntity.data.name}</h4>
                    <p className="text-zinc-400 mt-1 leading-relaxed">{selectedEntity.data.description}</p>
                  </div>

                  <div className="p-3 bg-zinc-950 rounded border border-zinc-800 space-y-2 font-mono text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Gestor Titular:</span>
                      <span className="text-zinc-200">{selectedEntity.data.manager_name || 'Não atribuído'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Quadro Alocado:</span>
                      <span className="text-zinc-200">{selectedEntity.data.headcount || 0} integrantes</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Status Operacional:</span>
                      <span className="text-emerald-400 capitalize">{selectedEntity.data.status}</span>
                    </div>
                  </div>

                  {/* Quick Agents preview */}
                  <div>
                    <span className="text-[10px] font-mono uppercase text-zinc-500 block mb-1.5">
                      Agentes IA Nesta Unidade:
                    </span>
                    <div className="space-y-1">
                      {allAgents
                        .filter(a => a.assigned_department_id === selectedEntity.data.id)
                        .map(a => (
                          <div
                            key={a.id}
                            onClick={() => setSelectedEntity({ type: 'agent', data: a })}
                            className="p-1.5 rounded bg-zinc-950 border border-zinc-850 hover:border-zinc-700 flex items-center justify-between cursor-pointer"
                          >
                            <span className="text-zinc-200 font-medium">🤖 {a.name}</span>
                            <span className="text-[10px] font-mono text-amber-400">{a.model}</span>
                          </div>
                        ))}
                    </div>
                  </div>

                  {onSelectDepartment && (
                    <button
                      onClick={() => onSelectDepartment(selectedEntity.data)}
                      className="w-full py-2 px-3 text-xs font-semibold text-zinc-950 bg-amber-400 hover:bg-amber-300 rounded transition-colors flex items-center justify-center gap-1.5 mt-2"
                    >
                      <span>Gerenciar Unidade</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ) : selectedEntity.type === 'agent' ? (
                /* Agent Details */
                <div className="space-y-4 text-xs">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-mono text-amber-400">{selectedEntity.data.code}</span>
                      <StatusBadge status={selectedEntity.data.status} />
                    </div>
                    <h4 className="text-sm font-bold text-zinc-100">{selectedEntity.data.name}</h4>
                    <span className="text-[10px] font-mono text-zinc-400 block mt-0.5">
                      Versão: {selectedEntity.data.version} · {selectedEntity.data.department_name}
                    </span>
                  </div>

                  <div className="p-3 bg-zinc-950 rounded border border-zinc-800 space-y-2 font-mono text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Modelo LLM:</span>
                      <span className="text-amber-400 font-semibold">{selectedEntity.data.model}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Max Tokens:</span>
                      <span className="text-zinc-200">{selectedEntity.data.config.max_tokens || 4096}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Temperatura:</span>
                      <span className="text-zinc-200">{selectedEntity.data.config.temperature ?? 0.2}</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono uppercase text-zinc-500 block mb-1">
                      Propósito Constitucional:
                    </span>
                    <p className="p-2.5 bg-zinc-950 rounded border border-zinc-850 text-zinc-300 text-[11px] leading-relaxed">
                      {selectedEntity.data.purpose}
                    </p>
                  </div>

                  {selectedEntity.data.config.capabilities && (
                    <div>
                      <span className="text-[10px] font-mono uppercase text-zinc-500 block mb-1.5">
                        Capacidades Homologadas:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {selectedEntity.data.config.capabilities.map((c, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 bg-zinc-950 border border-zinc-800 rounded text-[10px] font-mono text-zinc-300"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {onNavigate && (
                    <button
                      onClick={() => onNavigate(`/agents/${selectedEntity.data.id}`)}
                      className="w-full py-2 px-3 text-xs font-semibold text-zinc-950 bg-amber-400 hover:bg-amber-300 rounded transition-colors flex items-center justify-center gap-1.5 mt-2"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>Abrir Console do Agente</span>
                    </button>
                  )}
                </div>
              ) : selectedEntity.type === 'position' ? (
                /* Position Details */
                <div className="space-y-4 text-xs">
                  <div>
                    <span className="text-[10px] font-mono text-zinc-500">{selectedEntity.data.code}</span>
                    <h4 className="text-sm font-bold text-zinc-100">{selectedEntity.data.title}</h4>
                    <span className="text-[10px] font-mono text-amber-400 block mt-0.5">
                      Nível: {selectedEntity.data.level}
                    </span>
                  </div>

                  <p className="text-zinc-400 leading-relaxed bg-zinc-950 p-3 rounded border border-zinc-800">
                    {selectedEntity.data.description}
                  </p>

                  <div className="p-3 bg-zinc-950 rounded border border-zinc-800 space-y-2 font-mono text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Departamento:</span>
                      <span className="text-zinc-200">{selectedEntity.data.department_name || 'Associado'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Regime:</span>
                      <span className="text-zinc-200">Estatutário / CLT</span>
                    </div>
                  </div>

                  {onNavigate && (
                    <button
                      onClick={() => onNavigate('/organization/positions')}
                      className="w-full py-2 px-3 text-xs font-semibold text-zinc-100 bg-zinc-800 hover:bg-zinc-700 rounded transition-colors flex items-center justify-center gap-1.5 mt-2"
                    >
                      <span>Ver Quadro Geral de Cargos</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ) : selectedEntity.type === 'project' ? (
                /* Project Details */
                <div className="space-y-4 text-xs">
                  <div>
                    <span className="text-[10px] font-mono text-zinc-500">{selectedEntity.data.code}</span>
                    <h4 className="text-sm font-bold text-zinc-100">{selectedEntity.data.name}</h4>
                    <StatusBadge status={selectedEntity.data.status} />
                  </div>

                  <p className="text-zinc-400 leading-relaxed bg-zinc-950 p-3 rounded border border-zinc-800">
                    {selectedEntity.data.description}
                  </p>

                  {onNavigate && (
                    <button
                      onClick={() => onNavigate(`/projects/${selectedEntity.data.id}`)}
                      className="w-full py-2 px-3 text-xs font-semibold text-zinc-950 bg-amber-400 hover:bg-amber-300 rounded transition-colors flex items-center justify-center gap-1.5"
                    >
                      <span>Abrir Painel do Projeto</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ) : (
                /* Org Details */
                <div className="space-y-4 text-xs">
                  <div>
                    <h4 className="text-sm font-bold text-zinc-100">{organization.name}</h4>
                    <span className="text-[10px] font-mono text-zinc-500">{organization.domain}</span>
                  </div>

                  <p className="text-zinc-400 leading-relaxed bg-zinc-950 p-3 rounded border border-zinc-800">
                    Matriz administrativa e corporativa da NettosCorp Enterprise, integrando unidades estatutárias e forças autônomas de trabalho.
                  </p>
                </div>
              )
            ) : (
              <div className="py-12 text-center text-xs text-zinc-500">
                Selecione um nó no organograma para inspecionar atributos e ações.
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-zinc-800 text-[10px] font-mono text-zinc-500 text-center">
            Hierarquia Organizacional NettosCorp V1
          </div>
        </div>
      </div>
    </div>
  );
};
