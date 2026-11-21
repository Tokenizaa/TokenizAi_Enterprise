/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { UserRole } from '../types';

export type Action = 'create' | 'read' | 'update' | 'delete' | 'manage';
export type Resource =
  | 'organization'
  | 'departments'
  | 'positions'
  | 'agents'
  | 'projects'
  | 'tasks'
  | 'decisions'
  | 'deliberations'
  | 'documents'
  | 'audit'
  | 'users'
  | 'settings';

export const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: 'Super Administrador',
  admin: 'Administrador',
  director: 'Diretor Executivo',
  manager: 'Gerente Operacional',
  member: 'Membro / Especialista',
  viewer: 'Auditor / Visualizador',
};

export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  super_admin: 'Acesso irrestrito a configurações, parametrização estatutária, RLS e dados corporativos.',
  admin: 'Gestão integral de departamentos, usuários, agentes, projetos e documentos.',
  director: 'Emissão e homologação de Decretos (DEC), deliberações de conselho (CNS) e governança.',
  manager: 'Gestão de projetos, atribuição de tarefas a humanos e agentes IA, relatórios de departamento.',
  member: 'Execução de tarefas atribuídas, colaboração em projetos e consulta da base de conhecimento.',
  viewer: 'Acesso estritamente para leitura e fiscalização documental de auditoria e conformidade.',
};

/**
 * Enterprise Role-Based Access Control matrix complying with RLS
 */
export function hasPermission(role: UserRole, resource: Resource, action: Action): boolean {
  if (role === 'super_admin') return true;

  if (role === 'admin') {
    return true;
  }

  if (role === 'director') {
    if (resource === 'users' && (action === 'delete' || action === 'manage')) return false;
    if (resource === 'settings' && action === 'manage') return false;
    return true; // Directors can read and create governance, departments, projects, tasks, audit
  }

  if (role === 'manager') {
    if (resource === 'audit' || resource === 'settings' || resource === 'users') {
      return action === 'read';
    }
    if (resource === 'deliberations' || resource === 'decisions') {
      return action === 'read'; // Managers cannot forge official board deliberations
    }
    return true; // Can create, update, read projects, tasks, agents, documents
  }

  if (role === 'member') {
    if (action === 'read') return true;
    if (resource === 'tasks') {
      return action === 'create' || action === 'update';
    }
    return false;
  }

  if (role === 'viewer') {
    return action === 'read';
  }

  return false;
}
