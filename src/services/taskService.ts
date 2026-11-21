/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { localStore } from './supabaseClient';
import { Task, TaskStatus } from '../types';

export const taskService = {
  getTasks(): Task[] {
    return localStore.getTasks();
  },

  getTaskById(id: string): Task | undefined {
    return localStore.getTasks().find(t => t.id === id);
  },

  createTask(data: Omit<Task, 'id' | 'created_at' | 'updated_at' | 'organization_id'>): Task {
    const user = localStore.getSessionUser();
    const orgId = user?.organization_id || 'org-nettos-001';

    const newTask: Task = {
      id: `tsk-${Date.now()}`,
      organization_id: orgId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...data,
    };

    localStore.updateTasks(prev => [newTask, ...prev]);

    localStore.logAudit({
      user_id: user?.id || 'system',
      user_email: user?.email || 'system',
      action: 'CREATE',
      resource: 'tasks',
      resource_id: newTask.id,
      details: { code: newTask.code, title: newTask.title, project_id: newTask.project_id },
    });

    return newTask;
  },

  updateTask(id: string, updates: Partial<Task>): Task {
    const user = localStore.getSessionUser();
    let updated: Task | null = null;

    localStore.updateTasks(prev =>
      prev.map(t => {
        if (t.id === id) {
          const completed_at = updates.status === 'done' ? (t.completed_at || new Date().toISOString()) : (updates.status ? undefined : t.completed_at);
          updated = {
            ...t,
            ...updates,
            completed_at,
            updated_at: new Date().toISOString(),
          };
          return updated;
        }
        return t;
      })
    );

    if (!updated) throw new Error('Tarefa não encontrada.');

    localStore.logAudit({
      user_id: user?.id || 'system',
      user_email: user?.email || 'system',
      action: 'UPDATE',
      resource: 'tasks',
      resource_id: id,
      details: updates,
    });

    return updated;
  },

  updateTaskStatus(id: string, status: TaskStatus): Task {
    const task = this.getTaskById(id);
    const updated = this.updateTask(id, { status });

    localStore.logAudit({
      user_id: localStore.getSessionUser()?.id || 'system',
      user_email: localStore.getSessionUser()?.email || 'system',
      action: 'STATUS_CHANGE',
      resource: 'tasks',
      resource_id: id,
      details: { previous_status: task?.status, new_status: status },
    });

    return updated;
  },

  deleteTask(id: string): void {
    const user = localStore.getSessionUser();
    const task = this.getTaskById(id);
    if (!task) return;

    localStore.updateTasks(prev => prev.filter(t => t.id !== id));

    localStore.logAudit({
      user_id: user?.id || 'system',
      user_email: user?.email || 'system',
      action: 'DELETE',
      resource: 'tasks',
      resource_id: id,
      details: { code: task.code, title: task.title },
    });
  },
};
