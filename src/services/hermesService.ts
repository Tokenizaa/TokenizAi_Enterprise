/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { localStore } from './supabaseClient';
import { HermesRuntimeNode, HermesAgentSession, HermesSkill } from '../types';

export const hermesService = {
  getNodes(): HermesRuntimeNode[] {
    return localStore.getHermesNodes();
  },

  getSessions(): HermesAgentSession[] {
    return localStore.getHermesSessions();
  },

  getSkills(): HermesSkill[] {
    return localStore.getHermesSkills();
  },

  toggleSkill(id: string, enabled: boolean): HermesSkill | null {
    let updatedSkill: HermesSkill | null = null;
    localStore.updateHermesSkills(prev =>
      prev.map(s => {
        if (s.id === id) {
          updatedSkill = { ...s, enabled };
          return updatedSkill;
        }
        return s;
      })
    );

    if (updatedSkill) {
      localStore.logAudit({
        user_id: 'usr-001',
        user_email: 'admin@nettoscorp.com',
        action: 'UPDATE',
        resource: 'hermes_skills',
        resource_id: id,
        details: { enabled },
      });
    }

    return updatedSkill;
  },

  restartNode(nodeId: string): HermesRuntimeNode | null {
    let updatedNode: HermesRuntimeNode | null = null;
    localStore.updateHermesNodes(prev =>
      prev.map(n => {
        if (n.node_id === nodeId) {
          updatedNode = {
            ...n,
            status: 'online',
            cpu_percent: Math.floor(20 + Math.random() * 25),
            last_heartbeat: new Date().toISOString(),
          };
          return updatedNode;
        }
        return n;
      })
    );

    if (updatedNode) {
      localStore.logAudit({
        user_id: 'usr-001',
        user_email: 'admin@nettoscorp.com',
        action: 'UPDATE',
        resource: 'hermes_runtime_nodes',
        resource_id: nodeId,
        details: { action: 'NODE_RESTART', status: 'online' },
      });
    }

    return updatedNode;
  },

  getMetricsSummary() {
    const nodes = localStore.getHermesNodes();
    const sessions = localStore.getHermesSessions();
    const skills = localStore.getHermesSkills();

    const totalActiveSessions = sessions.filter(s => s.status === 'active').length;
    const totalTokens = sessions.reduce((acc, s) => acc + s.prompt_tokens + s.completion_tokens, 0);
    const totalCostUsd = sessions.reduce((acc, s) => acc + s.cost_usd, 0);
    const avgLatency = sessions.length > 0
      ? Math.round(sessions.reduce((acc, s) => acc + s.latency_ms, 0) / sessions.length)
      : 0;

    const onlineNodes = nodes.filter(n => n.status === 'online').length;
    const enabledSkillsCount = skills.filter(s => s.enabled).length;

    return {
      totalNodes: nodes.length,
      onlineNodes,
      totalActiveSessions,
      totalTokens,
      totalCostUsd: Number(totalCostUsd.toFixed(4)),
      avgLatency,
      totalSkills: skills.length,
      enabledSkillsCount,
      source: 'HERMES_CORE_RUNTIME' as const,
    };
  },
};
