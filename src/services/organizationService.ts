/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { localStore } from './supabaseClient';
import { Department, Position, UserProfile, Organization } from '../types';

export const organizationService = {
  getOrganization(): Organization {
    return localStore.getOrganizations()[0];
  },

  getDepartments(): Department[] {
    return localStore.getDepartments();
  },

  getDepartmentById(id: string): Department | undefined {
    return localStore.getDepartments().find(d => d.id === id);
  },

  createDepartment(data: Omit<Department, 'id' | 'created_at' | 'updated_at' | 'organization_id'>): Department {
    const user = localStore.getSessionUser();
    const orgId = user?.organization_id || 'org-nettos-001';

    const newDept: Department = {
      id: `dept-${Date.now()}`,
      organization_id: orgId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      headcount: 0,
      ...data,
    };

    localStore.updateDepartments(prev => [newDept, ...prev]);

    localStore.logAudit({
      user_id: user?.id || 'system',
      user_email: user?.email || 'system',
      action: 'CREATE',
      resource: 'departments',
      resource_id: newDept.id,
      details: { code: newDept.code, name: newDept.name },
    });

    return newDept;
  },

  updateDepartment(id: string, updates: Partial<Department>): Department {
    const user = localStore.getSessionUser();
    let updated: Department | null = null;

    localStore.updateDepartments(prev =>
      prev.map(dept => {
        if (dept.id === id) {
          updated = { ...dept, ...updates, updated_at: new Date().toISOString() };
          return updated;
        }
        return dept;
      })
    );

    if (!updated) throw new Error('Departamento não encontrado.');

    localStore.logAudit({
      user_id: user?.id || 'system',
      user_email: user?.email || 'system',
      action: 'UPDATE',
      resource: 'departments',
      resource_id: id,
      details: updates,
    });

    return updated;
  },

  deleteDepartment(id: string): void {
    const user = localStore.getSessionUser();
    const dept = this.getDepartmentById(id);
    if (!dept) return;

    localStore.updateDepartments(prev => prev.filter(d => d.id !== id));

    localStore.logAudit({
      user_id: user?.id || 'system',
      user_email: user?.email || 'system',
      action: 'DELETE',
      resource: 'departments',
      resource_id: id,
      details: { code: dept.code, name: dept.name },
    });
  },

  // Positions
  getPositions(): Position[] {
    return localStore.getPositions();
  },

  createPosition(data: Omit<Position, 'id' | 'created_at' | 'updated_at' | 'organization_id'>): Position {
    const user = localStore.getSessionUser();
    const orgId = user?.organization_id || 'org-nettos-001';

    const newPos: Position = {
      id: `pos-${Date.now()}`,
      organization_id: orgId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...data,
    };

    localStore.updatePositions(prev => [newPos, ...prev]);

    localStore.logAudit({
      user_id: user?.id || 'system',
      user_email: user?.email || 'system',
      action: 'CREATE',
      resource: 'positions',
      resource_id: newPos.id,
      details: { code: newPos.code, title: newPos.title, level: newPos.level },
    });

    return newPos;
  },

  updatePosition(id: string, updates: Partial<Position>): Position {
    const user = localStore.getSessionUser();
    let updated: Position | null = null;

    localStore.updatePositions(prev =>
      prev.map(pos => {
        if (pos.id === id) {
          updated = { ...pos, ...updates, updated_at: new Date().toISOString() };
          return updated;
        }
        return pos;
      })
    );

    if (!updated) throw new Error('Cargo não encontrado.');

    localStore.logAudit({
      user_id: user?.id || 'system',
      user_email: user?.email || 'system',
      action: 'UPDATE',
      resource: 'positions',
      resource_id: id,
      details: updates,
    });

    return updated;
  },

  deletePosition(id: string): void {
    const user = localStore.getSessionUser();
    localStore.updatePositions(prev => prev.filter(p => p.id !== id));
    localStore.logAudit({
      user_id: user?.id || 'system',
      user_email: user?.email || 'system',
      action: 'DELETE',
      resource: 'positions',
      resource_id: id,
      details: { id },
    });
  },

  // Users & Members
  getUsers(): UserProfile[] {
    return localStore.getProfiles();
  },

  updateUser(id: string, updates: Partial<UserProfile>): UserProfile {
    const user = localStore.getSessionUser();
    let updated: UserProfile | null = null;

    localStore.updateProfiles(prev =>
      prev.map(p => {
        if (p.id === id) {
          updated = { ...p, ...updates, updated_at: new Date().toISOString() };
          return updated;
        }
        return p;
      })
    );

    if (!updated) throw new Error('Usuário não encontrado.');

    localStore.logAudit({
      user_id: user?.id || 'system',
      user_email: user?.email || 'system',
      action: 'UPDATE',
      resource: 'profiles',
      resource_id: id,
      details: updates,
    });

    return updated;
  },
};
