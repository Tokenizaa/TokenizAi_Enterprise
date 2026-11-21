/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { localStore } from './supabaseClient';
import { AuditLog } from '../types';

export const auditService = {
  getAuditLogs(): AuditLog[] {
    return localStore.getAuditLogs();
  },

  log(entry: Omit<AuditLog, 'id' | 'organization_id' | 'created_at'>): AuditLog {
    return localStore.logAudit(entry);
  },

  filterLogs(filters: {
    resource?: string;
    action?: string;
    userEmail?: string;
    searchTerm?: string;
  }): AuditLog[] {
    let logs = localStore.getAuditLogs();

    if (filters.resource && filters.resource !== 'all') {
      logs = logs.filter(l => l.resource.toLowerCase() === filters.resource?.toLowerCase());
    }
    if (filters.action && filters.action !== 'all') {
      logs = logs.filter(l => l.action.toLowerCase() === filters.action?.toLowerCase());
    }
    if (filters.userEmail) {
      logs = logs.filter(l => l.user_email.toLowerCase().includes(filters.userEmail!.toLowerCase()));
    }
    if (filters.searchTerm) {
      const q = filters.searchTerm.toLowerCase();
      logs = logs.filter(
        l =>
          l.user_email.toLowerCase().includes(q) ||
          l.resource.toLowerCase().includes(q) ||
          l.action.toLowerCase().includes(q) ||
          JSON.stringify(l.details).toLowerCase().includes(q)
      );
    }

    return logs;
  },
};
