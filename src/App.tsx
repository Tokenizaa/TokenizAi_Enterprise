/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { authService } from './services/authService';
import { localStore } from './services/supabaseClient';
import { UserProfile } from './types';
import { AppShell } from './components/layout/AppShell';

// Pages
import { LoginPage } from './pages/LoginPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { DashboardPage } from './pages/DashboardPage';
import { OrganizationPage } from './pages/OrganizationPage';
import { DepartmentsPage } from './pages/DepartmentsPage';
import { PositionsPage } from './pages/PositionsPage';
import { AgentsPage } from './pages/AgentsPage';
import { AgentDetailsPage } from './pages/AgentDetailsPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { ProjectDetailsPage } from './pages/ProjectDetailsPage';
import { TasksPage } from './pages/TasksPage';
import { GovernancePage } from './pages/GovernancePage';
import { DecisionsPage } from './pages/DecisionsPage';
import { DeliberationsPage } from './pages/DeliberationsPage';
import { DocumentsPage } from './pages/DocumentsPage';
import { AuditPage } from './pages/AuditPage';
import { SettingsPage } from './pages/SettingsPage';
import { UsersPage } from './pages/UsersPage';
import { ProfilePage } from './pages/ProfilePage';
import { StrategyPage } from './pages/StrategyPage';
import { OperationsPage } from './pages/OperationsPage';
import { HermesAIPage } from './pages/HermesAIPage';
import { FinancialPage } from './pages/FinancialPage';
import { CommercialPage } from './pages/CommercialPage';
import { KnowledgePage } from './pages/KnowledgePage';
import { AgencyIntelligencePage } from './pages/AgencyIntelligencePage';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(authService.getCurrentUser());
  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    const path = window.location.pathname;
    return path && path !== '/' ? path : '/dashboard';
  });

  useEffect(() => {
    const unsub = authService.onAuthStateChange(user => {
      setCurrentUser(user);
    });
    return unsub;
  }, []);

  // Listen to popstate for browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      setCurrentRoute(path && path !== '/' ? path : '/dashboard');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (route: string) => {
    try {
      window.history.pushState({}, '', route);
    } catch {
      // ignore
    }
    setCurrentRoute(route);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Route protection
  const isAuthRoute = currentRoute === '/login' || currentRoute === '/forgot-password';
  if (!currentUser && !isAuthRoute) {
    return (
      <LoginPage
        onNavigate={navigateTo}
        onLoginSuccess={() => setCurrentUser(authService.getCurrentUser())}
      />
    );
  }

  // Render Auth Routes
  if (currentRoute === '/login') {
    return (
      <LoginPage
        onNavigate={navigateTo}
        onLoginSuccess={() => {
          setCurrentUser(authService.getCurrentUser());
          navigateTo('/dashboard');
        }}
      />
    );
  }

  if (currentRoute === '/forgot-password') {
    return <ForgotPasswordPage onNavigate={navigateTo} />;
  }

  // Render Page Content based on route
  const renderContent = () => {
    // Dynamic Subroutes
    if (currentRoute.startsWith('/agents/')) {
      const agentId = currentRoute.replace('/agents/', '');
      return <AgentDetailsPage agentId={agentId} onNavigate={navigateTo} />;
    }

    if (currentRoute.startsWith('/projects/')) {
      const projectId = currentRoute.replace('/projects/', '');
      return <ProjectDetailsPage projectId={projectId} onNavigate={navigateTo} />;
    }

    switch (currentRoute) {
      case '/dashboard':
        return <DashboardPage onNavigate={navigateTo} />;
      case '/strategy':
        return <StrategyPage onNavigate={navigateTo} />;
      case '/organization':
        return <OrganizationPage onNavigate={navigateTo} />;
      case '/organization/departments':
        return <DepartmentsPage onNavigate={navigateTo} />;
      case '/organization/positions':
        return <PositionsPage onNavigate={navigateTo} />;
      case '/operations':
        return <OperationsPage onNavigate={navigateTo} />;
      case '/agents':
        return <AgentsPage onNavigate={navigateTo} />;
      case '/ai':
        return <HermesAIPage onNavigate={navigateTo} />;
      case '/projects':
        return <ProjectsPage onNavigate={navigateTo} />;
      case '/tasks':
        return <TasksPage onNavigate={navigateTo} />;
      case '/financial':
        return <FinancialPage onNavigate={navigateTo} />;
      case '/commercial':
        return <CommercialPage onNavigate={navigateTo} />;
      case '/governance':
        return <GovernancePage onNavigate={navigateTo} />;
      case '/decisions':
        return <DecisionsPage onNavigate={navigateTo} />;
      case '/deliberations':
        return <DeliberationsPage onNavigate={navigateTo} />;
      case '/documents':
        return <DocumentsPage onNavigate={navigateTo} />;
      case '/knowledge':
        return <KnowledgePage onNavigate={navigateTo} />;
      case '/audit':
        return <AuditPage onNavigate={navigateTo} />;
      case '/settings':
        return <SettingsPage onNavigate={navigateTo} />;
      case '/settings/users':
        return <UsersPage onNavigate={navigateTo} />;
      case '/profile':
        return <ProfilePage onNavigate={navigateTo} />;
      case '/agency-catalog':
      case '/agency-intelligence':
        return <AgencyIntelligencePage onNavigate={navigateTo} />;
      default:
        return <DashboardPage onNavigate={navigateTo} />;
    }
  };

  return (
    <AppShell
      currentRoute={currentRoute}
      onNavigate={navigateTo}
      user={currentUser}
    >
      {renderContent()}
    </AppShell>
  );
}
