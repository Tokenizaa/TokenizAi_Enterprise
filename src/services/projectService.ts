/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { localStore } from './supabaseClient';
import { Project, Task } from '../types';

export const projectService = {
  getProjects(): Project[] {
    return localStore.getProjects();
  },

  getProjectById(id: string): Project | undefined {
    return localStore.getProjects().find(p => p.id === id);
  },

  getProjectTasks(projectId: string): Task[] {
    return localStore.getTasks().filter(t => t.project_id === projectId);
  },

  getProjectProgress(projectId: string): { total: number; completed: number; percentage: number } {
    const tasks = this.getProjectTasks(projectId);
    if (tasks.length === 0) return { total: 0, completed: 0, percentage: 0 };
    const completed = tasks.filter(t => t.status === 'done').length;
    return {
      total: tasks.length,
      completed,
      percentage: Math.round((completed / tasks.length) * 100),
    };
  },

  createProject(data: Omit<Project, 'id' | 'created_at' | 'updated_at' | 'organization_id'>): Project {
    const user = localStore.getSessionUser();
    const orgId = user?.organization_id || 'org-nettos-001';

    const newProject: Project = {
      id: `prj-${Date.now()}`,
      organization_id: orgId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...data,
    };

    localStore.updateProjects(prev => [newProject, ...prev]);

    localStore.logAudit({
      user_id: user?.id || 'system',
      user_email: user?.email || 'system',
      action: 'CREATE',
      resource: 'projects',
      resource_id: newProject.id,
      details: { code: newProject.code, name: newProject.name, budget: newProject.budget },
    });

    return newProject;
  },

  updateProject(id: string, updates: Partial<Project>): Project {
    const user = localStore.getSessionUser();
    let updated: Project | null = null;

    localStore.updateProjects(prev =>
      prev.map(p => {
        if (p.id === id) {
          updated = { ...p, ...updates, updated_at: new Date().toISOString() };
          return updated;
        }
        return p;
      })
    );

    if (!updated) throw new Error('Projeto não encontrado.');

    localStore.logAudit({
      user_id: user?.id || 'system',
      user_email: user?.email || 'system',
      action: 'UPDATE',
      resource: 'projects',
      resource_id: id,
      details: updates,
    });

    return updated;
  },

  deleteProject(id: string): void {
    const user = localStore.getSessionUser();
    const project = this.getProjectById(id);
    if (!project) return;

    localStore.updateProjects(prev => prev.filter(p => p.id !== id));

    localStore.logAudit({
      user_id: user?.id || 'system',
      user_email: user?.email || 'system',
      action: 'DELETE',
      resource: 'projects',
      resource_id: id,
      details: { code: project.code, name: project.name },
    });
  },
};
