/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Breadcrumb, BreadcrumbItem } from './Breadcrumb';
import { UserProfile } from '../../types';
import { localStore } from '../../services/supabaseClient';

interface AppShellProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  user: UserProfile | null;
  children: React.ReactNode;
}

const ROUTE_LABELS: Record<string, string> = {
  '/dashboard': 'Dashboard Executivo',
  '/strategy': 'Estratégia & OKRs',
  '/organization': 'Estrutura Organizacional',
  '/organization/departments': 'Departamentos',
  '/organization/positions': 'Cargos e Posições',
  '/operations': 'Central de Operações',
  '/agents': 'Agentes de IA',
  '/agency-catalog': 'Biblioteca e Inteligência de Agentes',
  '/agency-intelligence': 'Biblioteca e Inteligência de Agentes',
  '/ai': 'Hermes AI Runtime',
  '/projects': 'Portfólio de Projetos',
  '/tasks': 'Tarefas e Atividades',
  '/financial': 'Gestão Financeira (DEMO)',
  '/commercial': 'Comercial & CRM',
  '/governance': 'Governança Corporativa',
  '/decisions': 'Registro DEC',
  '/deliberations': 'Deliberações CNS',
  '/documents': 'Documentação Institucional',
  '/knowledge': 'Base de Conhecimento & POPs',
  '/audit': 'Histórico de Auditoria',
  '/settings': 'Configurações do Sistema',
  '/settings/users': 'Usuários e Permissões',
  '/profile': 'Perfil do Usuário',
};

export const AppShell: React.FC<AppShellProps> = ({
  currentRoute,
  onNavigate,
  user,
  children,
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [metrics, setMetrics] = useState({
    tasks: 0,
    agents: 0,
    decisions: 0,
  });

  useEffect(() => {
    const updateCounts = () => {
      const tasks = localStore.getTasks().filter(t => t.status !== 'done').length;
      const agents = localStore.getAgents().filter(a => a.status === 'active').length;
      const decisions = localStore.getDecisions().length;
      setMetrics({ tasks, agents, decisions });
    };

    updateCounts();
    return localStore.subscribe(updateCounts);
  }, []);

  // Close mobile drawer when navigating to a new route
  useEffect(() => {
    if (mobileOpen) setMobileOpen(false);
  }, [currentRoute]);

  // Compute breadcrumbs
  const getBreadcrumbs = (): BreadcrumbItem[] => {
    const items: BreadcrumbItem[] = [
      { label: 'NettosCorp', onClick: () => onNavigate('/dashboard') },
    ];

    if (currentRoute === '/dashboard') {
      items.push({ label: 'Visão Executiva' });
      return items;
    }

    if (currentRoute.startsWith('/organization')) {
      items.push({
        label: 'Organização',
        onClick: currentRoute !== '/organization' ? () => onNavigate('/organization') : undefined,
      });
      if (currentRoute === '/organization/departments') {
        items.push({ label: 'Departamentos' });
      } else if (currentRoute === '/organization/positions') {
        items.push({ label: 'Cargos e Posições' });
      }
      return items;
    }

    if (currentRoute.startsWith('/agency-')) {
      items.push({ label: 'Biblioteca e Inteligência de Agentes' });
      return items;
    }

    if (currentRoute.startsWith('/agents')) {
      items.push({
        label: 'Agentes de IA',
        onClick: currentRoute !== '/agents' ? () => onNavigate('/agents') : undefined,
      });
      if (currentRoute !== '/agents') {
        items.push({ label: 'Configurações de Agente' });
      }
      return items;
    }

    if (currentRoute.startsWith('/projects')) {
      items.push({
        label: 'Projetos',
        onClick: currentRoute !== '/projects' ? () => onNavigate('/projects') : undefined,
      });
      if (currentRoute !== '/projects') {
        items.push({ label: 'Detalhes do Projeto' });
      }
      return items;
    }

    if (currentRoute === '/tasks') {
      items.push({ label: 'Tarefas e Atividades' });
      return items;
    }

    if (currentRoute.startsWith('/governance') || currentRoute === '/decisions' || currentRoute === '/deliberations' || currentRoute === '/documents') {
      items.push({
        label: 'Governança',
        onClick: currentRoute !== '/governance' ? () => onNavigate('/governance') : undefined,
      });
      if (currentRoute === '/decisions') items.push({ label: 'Registro DEC' });
      if (currentRoute === '/deliberations') items.push({ label: 'Deliberações CNS' });
      if (currentRoute === '/documents') items.push({ label: 'Documentos' });
      return items;
    }

    if (currentRoute.startsWith('/settings')) {
      items.push({
        label: 'Configurações',
        onClick: currentRoute !== '/settings' ? () => onNavigate('/settings') : undefined,
      });
      if (currentRoute === '/settings/users') {
        items.push({ label: 'Usuários e Acessos' });
      }
      return items;
    }

    if (currentRoute === '/audit') {
      items.push({ label: 'Trilha de Auditoria' });
      return items;
    }

    if (currentRoute === '/profile') {
      items.push({ label: 'Perfil' });
      return items;
    }

    items.push({ label: ROUTE_LABELS[currentRoute] || 'Plataforma' });
    return items;
  };

  return (
    <div
      className={`flex h-screen bg-nc-surface text-nc-text overflow-hidden font-sans ${
        mobileOpen ? 'overflow-hidden' : ''
      }`}
    >
      {/* Sidebar Navigation */}
      <Sidebar
        currentRoute={currentRoute}
        onNavigate={onNavigate}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
        mobileOpen={mobileOpen}
        onToggleMobile={() => setMobileOpen(!mobileOpen)}
        counts={metrics}
      />

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-[45] bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Main Viewport */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header Bar */}
        <Header
          user={user}
          onNavigate={onNavigate}
          breadcrumbs={<Breadcrumb items={getBreadcrumbs()} />}
          onToggleMobile={() => setMobileOpen(!mobileOpen)}
          mobileOpen={mobileOpen}
        />

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
