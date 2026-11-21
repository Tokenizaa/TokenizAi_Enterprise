/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { localStore } from './supabaseClient';
import { ApprovalRequest } from '../types';

export const operationsService = {
  getApprovalRequests(): ApprovalRequest[] {
    return localStore.getApprovalRequests();
  },

  resolveApproval(id: string, status: 'approved' | 'rejected'): ApprovalRequest | null {
    let resolvedItem: ApprovalRequest | null = null;
    localStore.updateApprovalRequests(prev =>
      prev.map(a => {
        if (a.id === id) {
          resolvedItem = {
            ...a,
            status,
            resolved_at: new Date().toISOString(),
          };
          return resolvedItem;
        }
        return a;
      })
    );

    if (resolvedItem) {
      localStore.logAudit({
        user_id: 'usr-001',
        user_email: 'admin@nettoscorp.com',
        action: 'STATUS_CHANGE',
        resource: 'approval_requests',
        resource_id: id,
        details: { status },
      });
    }

    return resolvedItem;
  },

  createApprovalRequest(data: Omit<ApprovalRequest, 'id' | 'status' | 'created_at' | 'resolved_at'>): ApprovalRequest {
    const newReq: ApprovalRequest = {
      ...data,
      id: `app-${Date.now()}`,
      status: 'pending',
      created_at: new Date().toISOString(),
    };

    localStore.updateApprovalRequests(prev => [newReq, ...prev]);
    localStore.logAudit({
      user_id: 'usr-001',
      user_email: 'admin@nettoscorp.com',
      action: 'CREATE',
      resource: 'approval_requests',
      resource_id: newReq.id,
      details: { title: newReq.title, category: newReq.category },
    });

    return newReq;
  },

  getOperationalStats() {
    const tasks = localStore.getTasks();
    const approvals = localStore.getApprovalRequests();
    const agents = localStore.getAgents();

    const pendingApprovals = approvals.filter(a => a.status === 'pending').length;
    const blockedTasks = tasks.filter(t => t.status === 'blocked').length;
    const humanTasks = tasks.filter(t => t.assignee_type === 'user').length;
    const agentTasks = tasks.filter(t => t.assignee_type === 'agent').length;
    const doneTasks = tasks.filter(t => t.status === 'done').length;
    const totalTasks = tasks.length;

    const completionRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;
    const agentDelegationPercent = totalTasks > 0 ? Math.round((agentTasks / totalTasks) * 100) : 0;

    return {
      pendingApprovals,
      blockedTasks,
      humanTasks,
      agentTasks,
      doneTasks,
      totalTasks,
      completionRate,
      agentDelegationPercent,
      activeAgentsCount: agents.filter(a => a.status === 'active').length,
    };
  },
};
