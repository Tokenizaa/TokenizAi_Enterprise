/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { localStore } from './supabaseClient';
import { DashboardMetrics } from '../types';

export const dashboardService = {
  getMetrics(): DashboardMetrics {
    const projects = localStore.getProjects();
    const agents = localStore.getAgents();
    const tasks = localStore.getTasks();
    const decisions = localStore.getDecisions();
    const deliberations = localStore.getDeliberations();
    const documents = localStore.getDocuments();
    const departments = localStore.getDepartments();
    const members = localStore.getProfiles();
    const auditLogs = localStore.getAuditLogs();

    const inProgressProjects = projects.filter(p => p.status === 'in_progress').length;
    const activeAgents = agents.filter(a => a.status === 'active').length;
    const pendingTasks = tasks.filter(t => t.status === 'todo' || t.status === 'in_progress' || t.status === 'in_review').length;
    const completedTasks = tasks.filter(t => t.status === 'done').length;

    return {
      total_projects: projects.length,
      in_progress_projects: inProgressProjects,
      total_agents: agents.length,
      active_agents: activeAgents,
      pending_tasks: pendingTasks,
      completed_tasks: completedTasks,
      total_decisions: decisions.length,
      total_deliberations: deliberations.length,
      total_documents: documents.length,
      total_departments: departments.length,
      total_members: members.length,
      recent_activities: auditLogs.slice(0, 8),
    };
  },
};
