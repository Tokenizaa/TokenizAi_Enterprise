/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { localStore } from './supabaseClient';
import { CommercialLead, CommercialContract, LeadStage } from '../types';

export const LEAD_STAGES: { stage: LeadStage; label: string; color: string }[] = [
  { stage: 'new', label: 'Novo Lead', color: 'text-zinc-400 bg-zinc-900 border-zinc-800' },
  { stage: 'contacted', label: 'Em Contato', color: 'text-sky-400 bg-sky-950/40 border-sky-900/50' },
  { stage: 'discovery', label: 'Diagnóstico', color: 'text-indigo-400 bg-indigo-950/40 border-indigo-900/50' },
  { stage: 'proposal', label: 'Proposta Enviada', color: 'text-amber-400 bg-amber-950/40 border-amber-900/50' },
  { stage: 'negotiation', label: 'Negociação', color: 'text-purple-400 bg-purple-950/40 border-purple-900/50' },
  { stage: 'won', label: 'Ganha / Fechada', color: 'text-emerald-400 bg-emerald-950/40 border-emerald-900/50' },
  { stage: 'lost', label: 'Perdida', color: 'text-rose-400 bg-rose-950/40 border-rose-900/50' },
];

export const commercialService = {
  getLeads(): CommercialLead[] {
    return localStore.getCommercialLeads();
  },

  getContracts(): CommercialContract[] {
    return localStore.getCommercialContracts();
  },

  updateLeadStage(id: string, stage: LeadStage): CommercialLead | null {
    let updatedLead: CommercialLead | null = null;
    localStore.updateCommercialLeads(prev =>
      prev.map(l => {
        if (l.id === id) {
          updatedLead = { ...l, stage };
          return updatedLead;
        }
        return l;
      })
    );

    if (updatedLead) {
      localStore.logAudit({
        user_id: 'usr-001',
        user_email: 'admin@nettoscorp.com',
        action: 'STATUS_CHANGE',
        resource: 'commercial_leads',
        resource_id: id,
        details: { stage },
      });
    }

    return updatedLead;
  },

  createLead(data: Omit<CommercialLead, 'id' | 'created_at'>): CommercialLead {
    const newLead: CommercialLead = {
      ...data,
      id: `lead-${Date.now()}`,
      created_at: new Date().toISOString(),
    };

    localStore.updateCommercialLeads(prev => [newLead, ...prev]);
    localStore.logAudit({
      user_id: 'usr-001',
      user_email: 'admin@nettoscorp.com',
      action: 'CREATE',
      resource: 'commercial_leads',
      resource_id: newLead.id,
      details: { company: newLead.company_name, deal_value: newLead.deal_value },
    });

    return newLead;
  },

  createContract(data: Omit<CommercialContract, 'id'>): CommercialContract {
    const newContract: CommercialContract = {
      ...data,
      id: `ctr-${Date.now()}`,
    };

    localStore.updateCommercialContracts(prev => [newContract, ...prev]);
    localStore.logAudit({
      user_id: 'usr-001',
      user_email: 'admin@nettoscorp.com',
      action: 'CREATE',
      resource: 'commercial_contracts',
      resource_id: newContract.id,
      details: { contract_number: newContract.contract_number, client: newContract.client_name },
    });

    return newContract;
  },

  getPipelineStats() {
    const leads = localStore.getCommercialLeads();
    const contracts = localStore.getCommercialContracts();

    const totalPipelineValue = leads
      .filter(l => l.stage !== 'lost')
      .reduce((sum, l) => sum + l.deal_value, 0);

    const weightedPipelineValue = leads
      .filter(l => l.stage !== 'lost')
      .reduce((sum, l) => {
        let weight = 0.1;
        if (l.stage === 'contacted') weight = 0.2;
        if (l.stage === 'discovery') weight = 0.4;
        if (l.stage === 'proposal') weight = 0.7;
        if (l.stage === 'negotiation') weight = 0.9;
        if (l.stage === 'won') weight = 1.0;
        return sum + l.deal_value * weight;
      }, 0);

    const activeContractsARR = contracts
      .filter(c => c.status === 'active')
      .reduce((sum, c) => sum + c.annual_value, 0);

    return {
      totalLeads: leads.length,
      totalPipelineValue,
      weightedPipelineValue: Math.round(weightedPipelineValue),
      activeContractsCount: contracts.filter(c => c.status === 'active').length,
      activeContractsARR,
    };
  },
};
