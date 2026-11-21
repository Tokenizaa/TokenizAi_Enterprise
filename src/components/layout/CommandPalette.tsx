/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  X,
  Layers,
  Bot,
  FolderGit2,
  CheckSquare,
  Scale,
  Gavel,
  FileText,
  DollarSign,
  TrendingUp,
  Activity,
  Compass,
  BookOpen,
  ArrowRight,
  ShieldAlert,
  Settings,
  User,
  BrainCircuit
} from 'lucide-react';
import { localStore } from '../../services/supabaseClient';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (route: string) => void;
}

interface SearchItem {
  id: string;
  category: string;
  title: string;
  subtitle?: string;
  route: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Global navigation shortcuts
  const baseNavigationItems: SearchItem[] = [
    { id: 'nav-dash', category: 'Navegação', title: 'Dashboard Executivo', subtitle: 'Cockpit geral da empresa', route: '/dashboard', icon: Layers },
    { id: 'nav-strat', category: 'Navegação', title: 'Estratégia & OKRs', subtitle: 'Metas corporativas 2026', route: '/strategy', icon: Compass },
    { id: 'nav-org', category: 'Navegação', title: 'Estrutura Organizacional', subtitle: 'Organograma e hierarquia', route: '/organization', icon: Layers },
    { id: 'nav-agents', category: 'Navegação', title: 'Agentes de IA', subtitle: 'Catálogo de agentes autônomos', route: '/agents', icon: Bot },
    { id: 'nav-agency-intel', category: 'Navegação', title: 'Biblioteca e Inteligência de Agentes', subtitle: '283 perfis especializados, compositor de equipes e roteiros', route: '/agency-intelligence', icon: BrainCircuit },
    { id: 'nav-hermes', category: 'Navegação', title: 'Hermes AI Runtime', subtitle: 'Telemetria de nós e sessões de inferência', route: '/ai', icon: Activity },
    { id: 'nav-proj', category: 'Navegação', title: 'Portfólio de Projetos', subtitle: 'Roadmaps e entregas', route: '/projects', icon: FolderGit2 },
    { id: 'nav-tasks', category: 'Navegação', title: 'Tarefas & Atividades', subtitle: 'Quadro Kanban e atribuições', route: '/tasks', icon: CheckSquare },
    { id: 'nav-ops', category: 'Navegação', title: 'Central de Operações', subtitle: 'Aprovações corporativas e produtividade', route: '/operations', icon: Activity },
    { id: 'nav-fin', category: 'Navegação', title: 'Gestão Financeira (DEMO)', subtitle: 'Fluxo de caixa e orçamentos', route: '/financial', icon: DollarSign },
    { id: 'nav-com', category: 'Navegação', title: 'Comercial & CRM Pipeline', subtitle: 'Leads e contratos ativos', route: '/commercial', icon: TrendingUp },
    { id: 'nav-gov', category: 'Navegação', title: 'Portal de Governança', subtitle: 'Rito deliberativo e integridade', route: '/governance', icon: Compass },
    { id: 'nav-dec', category: 'Navegação', title: 'Registro DEC', subtitle: 'Decisões da diretoria', route: '/decisions', icon: Gavel },
    { id: 'nav-delib', category: 'Navegação', title: 'Deliberações CNS', subtitle: 'Atas do Conselho', route: '/deliberations', icon: Scale },
    { id: 'nav-docs', category: 'Navegação', title: 'Documentos DELIB', subtitle: 'Repositório institucional', route: '/documents', icon: FileText },
    { id: 'nav-pop', category: 'Navegação', title: 'Base de Conhecimento & POPs', subtitle: 'Procedimentos padronizados', route: '/knowledge', icon: BookOpen },
    { id: 'nav-audit', category: 'Navegação', title: 'Trilha de Auditoria', subtitle: 'Logs de conformidade', route: '/audit', icon: ShieldAlert },
    { id: 'nav-set', category: 'Navegação', title: 'Configurações & APIs', subtitle: 'Integrações Supabase e segurança', route: '/settings', icon: Settings },
    { id: 'nav-prof', category: 'Navegação', title: 'Perfil do Usuário', subtitle: 'Dados e papéis RBAC', route: '/profile', icon: User },
  ];

  // Search across live datasets
  const allProjects = localStore.getProjects();
  const allTasks = localStore.getTasks();
  const allAgents = localStore.getAgents();
  const allDecisions = localStore.getDecisions();
  const allDeliberations = localStore.getDeliberations();
  const allLeads = localStore.getCommercialLeads();
  const allObjectives = localStore.getStrategicObjectives();
  const allArticles = localStore.getKnowledgeArticles();

  const dynamicItems: SearchItem[] = [
    ...allProjects.map(p => ({
      id: p.id,
      category: 'Projetos',
      title: `${p.code} · ${p.name}`,
      subtitle: `${p.department_name || 'Departamento'} · Orçamento R$ ${p.budget.toLocaleString('pt-BR')}`,
      route: `/projects/${p.id}`,
      icon: FolderGit2,
    })),
    ...allTasks.map(t => ({
      id: t.id,
      category: 'Tarefas',
      title: `${t.code} · ${t.title}`,
      subtitle: `Status: ${t.status} · Prioridade: ${t.priority}`,
      route: '/tasks',
      icon: CheckSquare,
    })),
    ...allAgents.map(a => ({
      id: a.id,
      category: 'Agentes IA',
      title: `${a.code} · ${a.name}`,
      subtitle: `Modelo ${a.model} · ${a.status}`,
      route: `/agents/${a.id}`,
      icon: Bot,
    })),
    ...allObjectives.map(o => ({
      id: o.id,
      category: 'Estratégia',
      title: `${o.code} · ${o.title}`,
      subtitle: `Pilar: ${o.pillar} · Progresso: ${o.progress_percent}%`,
      route: '/strategy',
      icon: Compass,
    })),
    ...allLeads.map(l => ({
      id: l.id,
      category: 'Comercial CRM',
      title: l.company_name,
      subtitle: `Fase: ${l.stage} · R$ ${l.deal_value.toLocaleString('pt-BR')}`,
      route: '/commercial',
      icon: TrendingUp,
    })),
    ...allDecisions.map(d => ({
      id: d.id,
      category: 'Decisões DEC',
      title: `${d.dec_code} · ${d.title}`,
      subtitle: `Decidido por: ${d.decided_by_name || d.decided_by}`,
      route: '/decisions',
      icon: Gavel,
    })),
    ...allDeliberations.map(d => ({
      id: d.id,
      category: 'Deliberações CNS',
      title: `${d.cns_code} · ${d.title}`,
      subtitle: `Sessão: ${d.session_date} · Status: ${d.status}`,
      route: '/deliberations',
      icon: Scale,
    })),
    ...allArticles.map(art => ({
      id: art.id,
      category: 'POPs & Conhecimento',
      title: `${art.code} · ${art.title}`,
      subtitle: art.category,
      route: '/knowledge',
      icon: BookOpen,
    })),
  ];

  const filteredItems = query.trim()
    ? [...dynamicItems, ...baseNavigationItems].filter(item => {
        const q = query.toLowerCase();
        return (
          item.title.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          (item.subtitle && item.subtitle.toLowerCase().includes(q))
        );
      }).slice(0, 10)
    : baseNavigationItems.slice(0, 8);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Keyboard navigation inside palette
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < filteredItems.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : filteredItems.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        onNavigate(filteredItems[selectedIndex].route);
        onClose();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-zinc-950/80 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[70vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header Search Input */}
        <div className="flex items-center px-4 py-3 border-b border-zinc-800 gap-3">
          <Search className="w-4 h-4 text-zinc-500 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Digite para buscar páginas, projetos, tarefas, agentes, DEC, CNS ou POPs..."
            className="w-full bg-transparent text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-zinc-500 hover:text-zinc-300 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-zinc-500 bg-zinc-800 border border-zinc-700 rounded">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-2 divide-y divide-zinc-800/40">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-xs text-zinc-500">
              Nenhum resultado encontrado para "{query}".
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.route);
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-lg text-left transition-colors ${
                    isSelected ? 'bg-amber-400/10 border border-amber-400/30' : 'hover:bg-zinc-800/50 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 pr-3">
                    <div
                      className={`w-8 h-8 rounded flex items-center justify-center shrink-0 border ${
                        isSelected
                          ? 'bg-amber-400/20 text-amber-300 border-amber-400/40'
                          : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-semibold truncate ${isSelected ? 'text-amber-200' : 'text-zinc-100'}`}>
                          {item.title}
                        </span>
                        <span className="text-[10px] font-mono text-zinc-500 uppercase shrink-0">
                          {item.category}
                        </span>
                      </div>
                      {item.subtitle && (
                        <p className="text-[11px] text-zinc-400 truncate mt-0.5 font-mono">
                          {item.subtitle}
                        </p>
                      )}
                    </div>
                  </div>

                  <ArrowRight
                    className={`w-3.5 h-3.5 shrink-0 transition-transform ${
                      isSelected ? 'text-amber-400 translate-x-1' : 'text-zinc-600'
                    }`}
                  />
                </button>
              );
            })
          )}
        </div>

        {/* Footer shortcuts hint */}
        <div className="px-4 py-2 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
          <div className="flex items-center gap-3">
            <span>↑↓ navegar</span>
            <span>↵ selecionar</span>
            <span>esc fechar</span>
          </div>
          <span>NettosCorp Enterprise Quick Access</span>
        </div>
      </div>
    </div>
  );
};
