/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { localStore } from './supabaseClient';
import { StrategicObjective, KeyResult } from '../types';

export const strategyService = {
  getObjectives(): StrategicObjective[] {
    return localStore.getStrategicObjectives();
  },

  getObjectiveById(id: string): StrategicObjective | undefined {
    return localStore.getStrategicObjectives().find(o => o.id === id);
  },

  getKeyResults(objectiveId?: string): KeyResult[] {
    const all = localStore.getKeyResults();
    if (objectiveId) {
      return all.filter(k => k.objective_id === objectiveId);
    }
    return all;
  },

  createObjective(data: Omit<StrategicObjective, 'id' | 'created_at' | 'key_results_count' | 'progress_percent'>): StrategicObjective {
    const newObj: StrategicObjective = {
      ...data,
      id: `obj-${Date.now()}`,
      progress_percent: 0,
      key_results_count: 0,
      created_at: new Date().toISOString(),
    };

    localStore.updateStrategicObjectives(prev => [newObj, ...prev]);
    localStore.logAudit({
      user_id: 'usr-001',
      user_email: 'admin@nettoscorp.com',
      action: 'CREATE',
      resource: 'strategic_objectives',
      resource_id: newObj.id,
      details: { title: newObj.title, pillar: newObj.pillar },
    });

    return newObj;
  },

  createKeyResult(data: Omit<KeyResult, 'id' | 'progress_percent'>): KeyResult {
    const baseline = data.baseline;
    const target = data.target;
    const current = data.current;
    const range = Math.abs(target - baseline);
    const progress_percent = range > 0
      ? Math.min(100, Math.max(0, Math.round((Math.abs(current - baseline) / range) * 100)))
      : 0;

    const newKr: KeyResult = {
      ...data,
      id: `kr-${Date.now()}`,
      progress_percent,
    };

    localStore.updateKeyResults(prev => [...prev, newKr]);
    
    // Recalculate objective progress
    const allKrs = localStore.getKeyResults().filter(k => k.objective_id === data.objective_id);
    const avgProgress = allKrs.length > 0
      ? Math.round(allKrs.reduce((acc, k) => acc + k.progress_percent, 0) / allKrs.length)
      : progress_percent;

    localStore.updateStrategicObjectives(prev =>
      prev.map(o => (o.id === data.objective_id ? { ...o, progress_percent: avgProgress, key_results_count: allKrs.length } : o))
    );

    return newKr;
  },

  updateKeyResultProgress(krId: string, current: number): KeyResult | null {
    let updatedKr: KeyResult | null = null;
    let objId = '';

    localStore.updateKeyResults(prev =>
      prev.map(k => {
        if (k.id === krId) {
          const range = Math.abs(k.target - k.baseline);
          const progress_percent = range > 0
            ? Math.min(100, Math.max(0, Math.round((Math.abs(current - k.baseline) / range) * 100)))
            : 0;
          updatedKr = { ...k, current, progress_percent };
          objId = k.objective_id;
          return updatedKr;
        }
        return k;
      })
    );

    if (objId) {
      const allKrs = localStore.getKeyResults().filter(k => k.objective_id === objId);
      const avgProgress = allKrs.length > 0
        ? Math.round(allKrs.reduce((acc, k) => acc + k.progress_percent, 0) / allKrs.length)
        : 0;

      localStore.updateStrategicObjectives(prev =>
        prev.map(o => (o.id === objId ? { ...o, progress_percent: avgProgress } : o))
      );
    }

    return updatedKr;
  },
};
