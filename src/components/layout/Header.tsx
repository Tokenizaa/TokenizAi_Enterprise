/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { UserProfile, UserRole } from '../../types';
import { ROLE_LABELS } from '../../services/permissionService';
import { authService } from '../../services/authService';
import { localStore } from '../../services/supabaseClient';
import {
  Search,
  Bell,
  LogOut,
  User,
  Shield,
  Layers,
  ChevronDown,
  ExternalLink,
  Check,
  X,
  Command,
  Menu
} from 'lucide-react';
import { CommandPalette } from './CommandPalette';

interface HeaderProps {
  user: UserProfile | null;
  onNavigate: (route: string) => void;
  breadcrumbs: React.ReactNode;
  mobileOpen: boolean;
  onToggleMobile: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  onNavigate,
  breadcrumbs,
  mobileOpen,
  onToggleMobile,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Global Ctrl+K / Cmd+K listener
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Global search items
  const allProjects = localStore.getProjects();
  const allTasks = localStore.getTasks();
  const allAgents = localStore.getAgents();
  const allDecisions = localStore.getDecisions();
  const allDeliberations = localStore.getDeliberations();
  const allDocuments = localStore.getDocuments();

  const searchResults = searchQuery.trim()
    ? [
        ...allProjects
          .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.code.toLowerCase().includes(searchQuery.toLowerCase()))
          .map(p => ({ type: 'Projeto', title: `${p.code} · ${p.name}`, route: `/projects/${p.id}` })),
        ...allTasks
          .filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()) || t.code.toLowerCase().includes(searchQuery.toLowerCase()))
          .map(t => ({ type: 'Tarefa', title: `${t.code} · ${t.title}`, route: '/tasks' })),
        ...allAgents
          .filter(a => a.name.toLowerCase().includes(searchQuery.toLowerCase()) || a.code.toLowerCase().includes(searchQuery.toLowerCase()))
          .map(a => ({ type: 'Agente IA', title: `${a.code} · ${a.name}`, route: `/agents/${a.id}` })),
        ...allDecisions
          .filter(d => d.title.toLowerCase().includes(searchQuery.toLowerCase()) || d.dec_code.toLowerCase().includes(searchQuery.toLowerCase()))
          .map(d => ({ type: 'Decisão DEC', title: `${d.dec_code} · ${d.title}`, route: '/decisions' })),
        ...allDeliberations
          .filter(d => d.title.toLowerCase().includes(searchQuery.toLowerCase()) || d.cns_code.toLowerCase().includes(searchQuery.toLowerCase()))
          .map(d => ({ type: 'Deliberação CNS', title: `${d.cns_code} · ${d.title}`, route: '/deliberations' })),
        ...allDocuments
          .filter(d => d.title.toLowerCase().includes(searchQuery.toLowerCase()) || d.doc_code.toLowerCase().includes(searchQuery.toLowerCase()))
          .map(d => ({ type: 'Documento DELIB', title: `${d.doc_code} · ${d.title}`, route: '/documents' })),
      ].slice(0, 8)
    : [];

  // Notifications from recent audit logs & pending urgent items
  const auditLogs = localStore.getAuditLogs().slice(0, 5);
  const urgentTasks = localStore.getTasks().filter(t => t.priority === 'urgent' && t.status !== 'done');
  const notificationCount = urgentTasks.length + Math.min(auditLogs.length, 3);

  const handleRoleChange = (newRole: UserRole) => {
    authService.switchRole(newRole);
    setIsProfileOpen(false);
  };

  const handleLogout = async () => {
    await authService.logout();
    onNavigate('/login');
  };

  return (
    <header className="h-14 bg-nc-surface border-b border-nc-border px-4 sm:px-6 flex items-center justify-between gap-4 sticky top-0 z-30">
      {/* Zone 1: Contextual Breadcrumb */}
      <div className="flex items-center gap-2 min-w-0">
        <button
          onClick={onToggleMobile}
          className="lg:hidden p-2 text-nc-text-secondary hover:text-nc-text hover:bg-nc-surface-hover rounded border border-transparent hover:border-nc-border transition-colors"
          aria-label={mobileOpen ? 'Fechar menu de navegação' : 'Abrir menu de navegação'}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </button>
        {breadcrumbs}
      </div>

      {/* Zone 2: Global Search */}
      <div className="relative max-w-md w-full hidden md:block">
        <div className="relative flex items-center">
          <Search className="absolute left-3 w-4 h-4 text-zinc-500 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onFocus={() => setIsSearchOpen(true)}
            onChange={e => {
              setSearchQuery(e.target.value);
              setIsSearchOpen(true);
            }}
            placeholder="Buscar projetos, tarefas, agentes, DEC ou CNS..."
            className="w-full pl-9 pr-8 py-1.5 text-xs bg-zinc-900 border border-zinc-800 rounded text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-600 transition-colors"
          />
          {searchQuery ? (
            <button
              onClick={() => {
                setSearchQuery('');
                setIsSearchOpen(false);
              }}
              className="absolute right-2.5 p-0.5 text-zinc-500 hover:text-zinc-300"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={() => setIsCommandPaletteOpen(true)}
              className="absolute right-2 px-1.5 py-0.5 text-[10px] font-mono text-zinc-400 bg-zinc-950 border border-zinc-800 rounded hover:text-amber-300 hover:border-zinc-700 transition-colors"
              title="Abrir Command Palette (Ctrl+K)"
            >
              ⌘K
            </button>
          )}
        </div>

        {/* Search Results Dropdown */}
        {isSearchOpen && searchQuery.trim() && (
          <div className="absolute top-full left-0 right-0 mt-1.5 bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl overflow-hidden z-50">
            <div className="p-2 border-b border-zinc-800 text-[11px] font-semibold uppercase text-zinc-500">
              Resultados da Pesquisa ({searchResults.length})
            </div>
            {searchResults.length === 0 ? (
              <div className="p-4 text-xs text-zinc-400 text-center">
                Nenhum resultado encontrado para "{searchQuery}".
              </div>
            ) : (
              <div className="max-h-64 overflow-y-auto divide-y divide-zinc-800/60">
                {searchResults.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      onNavigate(item.route);
                      setIsSearchOpen(false);
                      setSearchQuery('');
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-zinc-800/50 flex items-center justify-between text-xs transition-colors"
                  >
                    <div className="truncate pr-2">
                      <span className="text-zinc-200 font-medium">{item.title}</span>
                    </div>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-950 text-amber-400/90 border border-zinc-800 whitespace-nowrap">
                      {item.type}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Zone 3: Actions (Notifications & User Profile) */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => {
              setIsNotifOpen(!isNotifOpen);
              setIsProfileOpen(false);
            }}
            className="p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 rounded border border-transparent hover:border-zinc-800 transition-colors relative"
            aria-label="Notificações corporativas"
          >
            <Bell className="w-4 h-4" />
            {notificationCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-400" />
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl overflow-hidden z-50">
              <div className="p-3 border-b border-zinc-800 flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-200 uppercase tracking-wide">
                  Central de Notificações
                </span>
                <span className="text-[10px] font-mono text-zinc-500">
                  {notificationCount} pendências
                </span>
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-zinc-800/60 p-1">
                {urgentTasks.map(t => (
                  <div
                    key={t.id}
                    onClick={() => {
                      onNavigate('/tasks');
                      setIsNotifOpen(false);
                    }}
                    className="p-2.5 hover:bg-zinc-800/50 rounded cursor-pointer transition-colors"
                  >
                    <span className="text-[10px] font-mono text-rose-400 uppercase font-semibold">
                      Urgente · Tarefa
                    </span>
                    <p className="text-xs text-zinc-200 font-medium truncate">{t.title}</p>
                    <span className="text-[10px] text-zinc-500 block font-mono">
                      Vencimento: {t.due_date}
                    </span>
                  </div>
                ))}

                {auditLogs.map(l => (
                  <div
                    key={l.id}
                    onClick={() => {
                      onNavigate('/audit');
                      setIsNotifOpen(false);
                    }}
                    className="p-2.5 hover:bg-zinc-800/50 rounded cursor-pointer transition-colors"
                  >
                    <span className="text-[10px] font-mono text-amber-400/90 uppercase font-semibold">
                      Auditoria · {l.action}
                    </span>
                    <p className="text-xs text-zinc-300 truncate">
                      {l.resource.toUpperCase()} por {l.user_email}
                    </p>
                    <span className="text-[10px] text-zinc-500 block font-mono">
                      {new Date(l.created_at).toLocaleTimeString('pt-BR')}
                    </span>
                  </div>
                ))}
              </div>

              <div className="p-2 bg-zinc-950 border-t border-zinc-800 text-center">
                <button
                  onClick={() => {
                    onNavigate('/audit');
                    setIsNotifOpen(false);
                  }}
                  className="text-[11px] text-amber-400 hover:text-amber-300 font-medium transition-colors"
                >
                  Ver toda a trilha de auditoria
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Profile & Role Switcher Popover */}
        {user ? (
          <div className="relative">
            <button
              onClick={() => {
                setIsProfileOpen(!isProfileOpen);
                setIsNotifOpen(false);
              }}
              className="flex items-center gap-2.5 p-1.5 rounded hover:bg-zinc-900 border border-transparent hover:border-zinc-800 transition-colors text-left"
            >
              <div className="w-7 h-7 rounded bg-zinc-800 border border-zinc-700 flex items-center justify-center text-amber-400 font-semibold text-xs">
                {user.full_name ? user.full_name.charAt(0) : 'U'}
              </div>

              <div className="hidden lg:block">
                <span className="text-xs font-semibold text-zinc-200 block leading-tight">
                  {user.full_name}
                </span>
                <span className="text-[10px] font-mono text-amber-400/90 block">
                  {ROLE_LABELS[user.role]}
                </span>
              </div>

              <ChevronDown className="w-3.5 h-3.5 text-zinc-500 hidden sm:block" />
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl p-2 z-50">
                <div className="px-3 py-2 border-b border-zinc-800 mb-2">
                  <span className="text-xs font-semibold text-zinc-100 block">{user.full_name}</span>
                  <span className="text-[11px] text-zinc-400 font-mono block truncate">{user.email}</span>
                </div>

                {/* Role Switcher for instant permission evaluation */}
                <div className="px-3 py-1.5">
                  <span className="text-[10px] font-semibold uppercase text-zinc-500 tracking-wider block mb-1.5 flex items-center gap-1">
                    <Shield className="w-3 h-3 text-amber-400" /> Alternar Papel de Avaliação
                  </span>
                  <div className="space-y-1">
                    {(
                      [
                        'super_admin',
                        'admin',
                        'director',
                        'manager',
                        'member',
                        'viewer',
                      ] as UserRole[]
                    ).map(r => (
                      <button
                        key={r}
                        onClick={() => handleRoleChange(r)}
                        className={`w-full flex items-center justify-between px-2 py-1 text-xs rounded transition-colors ${
                          user.role === r
                            ? 'bg-amber-400/10 text-amber-400 font-semibold'
                            : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                        }`}
                      >
                        <span>{ROLE_LABELS[r]}</span>
                        {user.role === r && <Check className="w-3.5 h-3.5 text-amber-400" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="border-t border-zinc-800 mt-2 pt-2 space-y-1">
                  <button
                    onClick={() => {
                      onNavigate('/profile');
                      setIsProfileOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800 rounded transition-colors text-left"
                  >
                    <User className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Meu Perfil</span>
                  </button>

                  <button
                    onClick={() => {
                      onNavigate('/settings');
                      setIsProfileOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800 rounded transition-colors text-left"
                  >
                    <Layers className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Configurações & Supabase</span>
                  </button>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-rose-400 hover:bg-rose-950/30 rounded transition-colors text-left font-medium"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Encerrar Sessão</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => onNavigate('/login')}
            className="px-3 py-1.5 text-xs font-medium text-zinc-950 bg-amber-400 hover:bg-amber-300 rounded transition-colors"
          >
            Acessar Plataforma
          </button>
        )}
      </div>

      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigate={onNavigate}
      />
    </header>
  );
};
