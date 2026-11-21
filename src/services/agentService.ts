/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { localStore } from './supabaseClient';
import { AIAgent, AgentStatus } from '../types';

export const agentService = {
  getAgents(): AIAgent[] {
    return localStore.getAgents();
  },

  getAgentById(id: string): AIAgent | undefined {
    return localStore.getAgents().find(a => a.id === id);
  },

  createAgent(data: Omit<AIAgent, 'id' | 'created_at' | 'updated_at' | 'organization_id'>): AIAgent {
    const user = localStore.getSessionUser();
    const orgId = user?.organization_id || 'org-nettos-001';

    const newAgent: AIAgent = {
      id: `agt-${Date.now()}`,
      organization_id: orgId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...data,
    };

    localStore.updateAgents(prev => [newAgent, ...prev]);

    localStore.logAudit({
      user_id: user?.id || 'system',
      user_email: user?.email || 'system',
      action: 'CREATE',
      resource: 'agents',
      resource_id: newAgent.id,
      details: { code: newAgent.code, name: newAgent.name, model: newAgent.model },
    });

    return newAgent;
  },

  updateAgent(id: string, updates: Partial<AIAgent>): AIAgent {
    const user = localStore.getSessionUser();
    let updated: AIAgent | null = null;

    localStore.updateAgents(prev =>
      prev.map(a => {
        if (a.id === id) {
          updated = { ...a, ...updates, updated_at: new Date().toISOString() };
          return updated;
        }
        return a;
      })
    );

    if (!updated) throw new Error('Agente não encontrado.');

    localStore.logAudit({
      user_id: user?.id || 'system',
      user_email: user?.email || 'system',
      action: 'UPDATE',
      resource: 'agents',
      resource_id: id,
      details: updates,
    });

    return updated;
  },

  toggleStatus(id: string, newStatus: AgentStatus): AIAgent {
    const user = localStore.getSessionUser();
    const updated = this.updateAgent(id, { status: newStatus });

    localStore.logAudit({
      user_id: user?.id || 'system',
      user_email: user?.email || 'system',
      action: 'STATUS_CHANGE',
      resource: 'agents',
      resource_id: id,
      details: { status: newStatus },
    });

    return updated;
  },

  deleteAgent(id: string): void {
    const user = localStore.getSessionUser();
    const agent = this.getAgentById(id);
    if (!agent) return;

    localStore.updateAgents(prev => prev.filter(a => a.id !== id));

    localStore.logAudit({
      user_id: user?.id || 'system',
      user_email: user?.email || 'system',
      action: 'DELETE',
      resource: 'agents',
      resource_id: id,
      details: { code: agent.code, name: agent.name },
    });
  },
};
