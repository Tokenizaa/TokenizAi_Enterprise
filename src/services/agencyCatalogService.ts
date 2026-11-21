/** @license SPDX-License-Identifier: Apache-2.0 */

import { supabase, isLiveSupabaseConfigured, localStore } from './supabaseClient';
import {
  AgencyAgentProfile,
  AgencyAgentSelection,
  AgencyAgentHomologation,
  AgencyAgentCategory,
  AgencyAgentStatus,
} from '../types';

const DEFAULT_ORG_ID = 'd3c6760f-f734-4154-837e-34898849f040';

// Asset público com os 283 perfis do catálogo Agency Agents (copiado para dist/ pelo Vite).
// Serve como fonte de dados do catálogo quando o Supabase ao vivo não está configurado,
// garantindo que o catálogo apresente os registros mesmo sem integração Supabase ativa.
const PUBLIC_CATALOG_URL = '/agency-profiles-import.json';

function now(): string {
  return new Date().toISOString();
}

/**
 * Carrega os 283 perfis do asset público para o localStore apenas quando ainda não há
 * perfis persistidos. Não sobrescreve dados existentes (evita duplicar registros).
 * Retorna true se importou algo.
 */
async function ensureCatalogFromPublicAsset(): Promise<boolean> {
  const existing = localStore.getAgencyAgentProfiles();
  if (existing && existing.length > 0) {
    return false;
  }
  try {
    const response = await fetch(PUBLIC_CATALOG_URL);
    if (!response.ok) {
      return false;
    }
    const rawProfiles = (await response.json()) as any[];
    if (!Array.isArray(rawProfiles) || rawProfiles.length === 0) {
      return false;
    }
    const timestamp = now();
    const profiles: AgencyAgentProfile[] = rawProfiles.map((p, idx) => ({
      ...p,
      id: p.id || `aap-${p.code || idx}`,
      organization_id: p.organization_id || DEFAULT_ORG_ID,
      created_at: p.created_at || timestamp,
      updated_at: p.updated_at || timestamp,
    }));
    localStore.setAgencyAgentProfiles(() => profiles);
    localStore.logAudit({
      user_id: 'system',
      user_email: 'system',
      action: 'CREATE',
      resource: 'agencyAgentProfiles',
      details: { count: profiles.length, source: PUBLIC_CATALOG_URL },
    });
    return true;
  } catch {
    return false;
  }
}

function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
}

/** Verifica se o Supabase está configurado e disponível */
function useSupabase(): boolean {
  return isLiveSupabaseConfigured && supabase !== null;
}

/** Converte UUID do Supabase para string, se necessário */
function toUuid(value: string | null): string | null {
  return value;
}

/** ── Perfis ── */

export const agencyCatalogService = {
  listProfiles(): AgencyAgentProfile[] {
    if (useSupabase()) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      return [];
    }
    return localStore.getAgencyAgentProfiles().filter(p => p.organization_id === DEFAULT_ORG_ID);
  },

  async listProfilesAsync(): Promise<AgencyAgentProfile[]> {
    if (!useSupabase()) {
      // Sem Supabase ao vivo: carrega os 283 perfis do catálogo a partir do asset
      // público antes de ler o armazenamento local, para que o catálogo apresente
      // os registros mesmo sem integração Supabase configurada.
      await ensureCatalogFromPublicAsset();
      return this.listProfiles();
    }
    const user = localStore.getSessionUser();
    const orgId = DEFAULT_ORG_ID;
    const { data, error } = await supabase!
      .from('agency_agent_profiles')
      .select('*')
      .eq('organization_id', orgId)
      .order('code', { ascending: true });
    if (error) {
      console.error('Erro ao listar perfis no Supabase:', error);
      throw error;
    }
    return (data || []).map((row: any) => this.rowToProfile(row));
  },

  listProfilesByCategory(category: AgencyAgentCategory): AgencyAgentProfile[] {
    return this.listProfiles().filter(p => p.category === category);
  },

  async listProfilesByCategoryAsync(category: AgencyAgentCategory): Promise<AgencyAgentProfile[]> {
    const all = await this.listProfilesAsync();
    return all.filter(p => p.category === category);
  },

  listProfilesByStatus(status: AgencyAgentStatus): AgencyAgentProfile[] {
    return this.listProfiles().filter(p => p.status === status);
  },

  async listProfilesByStatusAsync(status: AgencyAgentStatus): Promise<AgencyAgentProfile[]> {
    const all = await this.listProfilesAsync();
    return all.filter(p => p.status === status);
  },

  searchProfiles(query: string): AgencyAgentProfile[] {
    const q = query.toLowerCase();
    return this.listProfiles().filter(
      p =>
        p.name.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q) ||
        p.identity.toLowerCase().includes(q) ||
        p.specialty_description.toLowerCase().includes(q) ||
        p.competencies.some(c => c.toLowerCase().includes(q)) ||
        p.responsibilities.some(r => r.toLowerCase().includes(q))
    );
  },

  async searchProfilesAsync(query: string): Promise<AgencyAgentProfile[]> {
    const all = await this.listProfilesAsync();
    const q = query.trim().toLocaleLowerCase();
    if (!q) return all;
    return all.filter(profile =>
      [profile.name, profile.code, profile.identity, profile.specialty_description,
        ...(profile.competencies || []), ...(profile.responsibilities || [])]
        .some(value => String(value || '').toLocaleLowerCase().includes(q))
    );
  },

  getProfileById(id: string): AgencyAgentProfile | undefined {
    return localStore.getAgencyAgentProfileById(id);
  },

  async getProfileByIdAsync(id: string): Promise<AgencyAgentProfile | undefined> {
    if (!useSupabase()) {
      return this.getProfileById(id);
    }
    const { data, error } = await supabase!
      .from('agency_agent_profiles')
      .select('*')
      .eq('id', id)
      .single();
    if (error || !data) {
      return this.getProfileById(id);
    }
    return this.rowToProfile(data);
  },

  getProfileByCode(code: string): AgencyAgentProfile | undefined {
    return localStore.getAgencyAgentProfileByCode(code);
  },

  async getProfileByCodeAsync(code: string): Promise<AgencyAgentProfile | undefined> {
    if (!useSupabase()) {
      return this.getProfileByCode(code);
    }
    const { data, error } = await supabase!
      .from('agency_agent_profiles')
      .select('*')
      .eq('code', code)
      .single();
    if (error || !data) {
      return this.getProfileByCode(code);
    }
    return this.rowToProfile(data);
  },

  upsertProfile(data: {
    category: AgencyAgentCategory;
    specialty: string;
    name: string;
    code: string;
    identity: string;
    specialty_description: string;
    competencies: string[];
    personality: string;
    responsibilities: string[];
    methodology: string;
    status: AgencyAgentStatus;
    source_file: string;
    source_hash: string;
  }): AgencyAgentProfile {
    const user = localStore.getSessionUser();
    const orgId = DEFAULT_ORG_ID;
    const nowStr = now();

    const existing = localStore.getAgencyAgentProfileByCode(data.code);

    const profile: AgencyAgentProfile = existing
      ? {
          ...existing,
          ...data,
          organization_id: existing.organization_id,
          id: existing.id,
          created_at: existing.created_at,
          updated_at: nowStr,
        }
      : {
          id: generateId('agt'),
          organization_id: orgId,
          created_at: nowStr,
          updated_at: nowStr,
          ...data,
        };

    localStore.setAgencyAgentProfiles(prev => {
      if (existing) {
        return prev.map(p => (p.id === profile.id ? profile : p));
      }
      return [profile, ...prev];
    });

    localStore.logAudit({
      user_id: user?.id || 'system',
      user_email: user?.email || 'system',
      action: existing ? 'UPDATE' : 'CREATE',
      resource: 'agencyAgentProfiles',
      resource_id: profile.id,
      details: {
        code: profile.code,
        name: profile.name,
        category: profile.category,
        status: profile.status,
      },
    });

    return profile;
  },

  async upsertProfileAsync(data: {
    category: AgencyAgentCategory;
    specialty: string;
    name: string;
    code: string;
    identity: string;
    specialty_description: string;
    competencies: string[];
    personality: string;
    responsibilities: string[];
    methodology: string;
    status: AgencyAgentStatus;
    source_file: string;
    source_hash: string;
  }): Promise<AgencyAgentProfile> {
    if (!useSupabase()) {
      return this.upsertProfile(data);
    }
    const user = localStore.getSessionUser();
    const orgId = DEFAULT_ORG_ID;
    const nowStr = now();

    const { data: existing } = await supabase!
      .from('agency_agent_profiles')
      .select('*')
      .eq('code', data.code)
      .eq('organization_id', orgId)
      .single();

    const row: any = {
      category: data.category,
      specialty: data.specialty,
      name: data.name,
      code: data.code,
      identity: data.identity,
      specialty_description: data.specialty_description,
      competencies: data.competencies,
      personality: data.personality,
      responsibilities: data.responsibilities,
      methodology: data.methodology,
      status: data.status,
      source_file: data.source_file,
      source_hash: data.source_hash,
      organization_id: orgId,
      updated_at: nowStr,
    };

    if (existing) {
      row.id = existing.id;
      row.created_at = existing.created_at;
      const { error } = await supabase!
        .from('agency_agent_profiles')
        .update(row)
        .eq('id', existing.id);
      if (error) {
        console.error('Erro ao atualizar perfil no Supabase:', error);
        return this.upsertProfile(data);
      }
    } else {
      row.id = generateId('agt');
      row.created_at = nowStr;
      const { error } = await supabase!
        .from('agency_agent_profiles')
        .insert(row);
      if (error) {
        console.error('Erro ao inserir perfil no Supabase:', error);
        return this.upsertProfile(data);
      }
    }

    const profile: AgencyAgentProfile = {
      ...row,
      id: row.id,
      organization_id: orgId,
      created_at: row.created_at,
      updated_at: nowStr,
      competencies: Array.isArray(row.competencies) ? row.competencies : [],
      responsibilities: Array.isArray(row.responsibilities) ? row.responsibilities : [],
    } as AgencyAgentProfile;

    localStore.logAudit({
      user_id: user?.id || 'system',
      user_email: user?.email || 'system',
      action: existing ? 'UPDATE' : 'CREATE',
      resource: 'agencyAgentProfiles',
      resource_id: profile.id,
      details: {
        code: profile.code,
        name: profile.name,
        category: profile.category,
        status: profile.status,
      },
    });

    return profile;
  },

  importProfiles(profiles: {
    category: AgencyAgentCategory;
    specialty: string;
    name: string;
    code: string;
    identity: string;
    specialty_description: string;
    competencies: string[];
    personality: string;
    responsibilities: string[];
    methodology: string;
    status: AgencyAgentStatus;
    source_file: string;
    source_hash: string;
  }[]): AgencyAgentProfile[] {
    const user = localStore.getSessionUser();
    const orgId = DEFAULT_ORG_ID;
    const nowStr = now();

    const imported: AgencyAgentProfile[] = profiles.map(data => {
      const existing = localStore.getAgencyAgentProfileByCode(data.code);
      if (existing) {
        return {
          ...existing,
          ...data,
          organization_id: existing.organization_id,
          id: existing.id,
          created_at: existing.created_at,
          updated_at: nowStr,
        };
      }
      return {
        id: generateId('agt'),
        organization_id: orgId,
        created_at: nowStr,
        updated_at: nowStr,
        ...data,
      };
    });

    localStore.setAgencyAgentProfiles(prev => {
      const byCode = new Map(imported.map(p => [p.code, p]));
      const kept = prev.filter(p => !byCode.has(p.code));
      return [...imported, ...kept];
    });

    localStore.logAudit({
      user_id: user?.id || 'system',
      user_email: user?.email || 'system',
      action: 'CREATE',
      resource: 'agencyAgentProfiles',
      details: { count: imported.length, codes: imported.map(p => p.code) },
    });

    return imported;
  },

  async importProfilesAsync(profiles: {
    category: AgencyAgentCategory;
    specialty: string;
    name: string;
    code: string;
    identity: string;
    specialty_description: string;
    competencies: string[];
    personality: string;
    responsibilities: string[];
    methodology: string;
    status: AgencyAgentStatus;
    source_file: string;
    source_hash: string;
  }[]): Promise<AgencyAgentProfile[]> {
    if (!useSupabase()) {
      return this.importProfiles(profiles);
    }
    const user = localStore.getSessionUser();
    const orgId = DEFAULT_ORG_ID;
    const nowStr = now();

    const imported: AgencyAgentProfile[] = [];

    for (const data of profiles) {
      const { data: existing } = await supabase!
        .from('agency_agent_profiles')
        .select('*')
        .eq('code', data.code)
        .eq('organization_id', orgId)
        .single();

      const row: any = {
        category: data.category,
        specialty: data.specialty,
        name: data.name,
        code: data.code,
        identity: data.identity,
        specialty_description: data.specialty_description,
        competencies: data.competencies,
        personality: data.personality,
        responsibilities: data.responsibilities,
        methodology: data.methodology,
        status: data.status,
        source_file: data.source_file,
        source_hash: data.source_hash,
        organization_id: orgId,
        updated_at: nowStr,
      };

      if (existing) {
        row.id = existing.id;
        row.created_at = existing.created_at;
        await supabase!.from('agency_agent_profiles').update(row).eq('id', existing.id);
      } else {
        row.id = generateId('agt');
        row.created_at = nowStr;
        await supabase!.from('agency_agent_profiles').insert(row);
      }

      imported.push({
        ...row,
        id: row.id,
        organization_id: orgId,
        created_at: row.created_at,
        updated_at: nowStr,
        competencies: Array.isArray(row.competencies) ? row.competencies : [],
        responsibilities: Array.isArray(row.responsibilities) ? row.responsibilities : [],
      } as AgencyAgentProfile);
    }

    localStore.logAudit({
      user_id: user?.id || 'system',
      user_email: user?.email || 'system',
      action: 'CREATE',
      resource: 'agencyAgentProfiles',
      details: { count: imported.length, codes: imported.map(p => p.code) },
    });

    return imported;
  },

  // ── Seleções ──

  listSelections(): AgencyAgentSelection[] {
    const user = localStore.getSessionUser();
    const orgId = DEFAULT_ORG_ID;
    return localStore.getAgencyAgentSelections().filter(s => s.organization_id === orgId);
  },

  async listSelectionsAsync(): Promise<AgencyAgentSelection[]> {
    if (!useSupabase()) {
      return this.listSelections();
    }
    const user = localStore.getSessionUser();
    const orgId = DEFAULT_ORG_ID;
    const { data, error } = await supabase!
      .from('agency_agent_selections')
      .select('*')
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Erro ao listar seleções no Supabase:', error);
      throw error;
    }
    return (data || []).map((row: any) => ({
      ...row,
      organization_id: orgId,
    } as AgencyAgentSelection));
  },

  createSelection(data: {
    profile_id: string;
    profile_code?: string;
    project_name: string;
    purpose: string;
    selected_by: string;
    selected_by_name?: string;
    selected_at: string;
    status: 'planejado' | 'ativo' | 'concluído' | 'cancelado';
    notes?: string;
  }): AgencyAgentSelection {
    const user = localStore.getSessionUser();
    const orgId = DEFAULT_ORG_ID;
    const nowStr = now();

    const selection: AgencyAgentSelection = {
      id: generateId('sel'),
      organization_id: orgId,
      created_at: nowStr,
      updated_at: nowStr,
      ...data,
    };

    localStore.setAgencyAgentSelections(prev => [selection, ...prev]);

    localStore.logAudit({
      user_id: user?.id || 'system',
      user_email: user?.email || 'system',
      action: 'CREATE',
      resource: 'agencyAgentSelections',
      resource_id: selection.id,
      details: {
        project_name: selection.project_name,
        profile_code: selection.profile_code,
        status: selection.status,
      },
    });

    return selection;
  },

  async createSelectionAsync(data: {
    profile_id: string;
    profile_code?: string;
    project_name: string;
    purpose: string;
    selected_by: string;
    selected_by_name?: string;
    selected_at: string;
    status: 'planejado' | 'ativo' | 'concluído' | 'cancelado';
    notes?: string;
  }): Promise<AgencyAgentSelection> {
    if (!useSupabase()) {
      return this.createSelection(data);
    }
    const user = localStore.getSessionUser();
    const orgId = DEFAULT_ORG_ID;
    const nowStr = now();

    const selection: AgencyAgentSelection = {
      id: generateId('sel'),
      organization_id: orgId,
      created_at: nowStr,
      updated_at: nowStr,
      ...data,
    };

    const { error } = await supabase!
      .from('agency_agent_selections')
      .insert(selection);
    if (error) {
      console.error('Erro ao criar seleção no Supabase:', error);
      throw error;
    }

    localStore.logAudit({
      user_id: user?.id || 'system',
      user_email: user?.email || 'system',
      action: 'CREATE',
      resource: 'agencyAgentSelections',
      resource_id: selection.id,
      details: {
        project_name: selection.project_name,
        profile_code: selection.profile_code,
        status: selection.status,
      },
    });

    return selection;
  },

  updateSelection(id: string, updates: Partial<AgencyAgentSelection>): AgencyAgentSelection {
    const user = localStore.getSessionUser();
    let updated: AgencyAgentSelection | null = null;

    localStore.setAgencyAgentSelections(prev =>
      prev.map(s => {
        if (s.id === id) {
          updated = { ...s, ...updates, updated_at: now() };
          return updated;
        }
        return s;
      })
    );

    if (!updated) throw new Error('Seleção não encontrada.');

    localStore.logAudit({
      user_id: user?.id || 'system',
      user_email: user?.email || 'system',
      action: 'UPDATE',
      resource: 'agencyAgentSelections',
      resource_id: id,
      details: updates,
    });

    return updated;
  },

  deleteSelection(id: string): void {
    const user = localStore.getSessionUser();
    const selection = this.listSelections().find(s => s.id === id);
    if (!selection) return;

    localStore.setAgencyAgentSelections(prev => prev.filter(s => s.id !== id));

    localStore.logAudit({
      user_id: user?.id || 'system',
      user_email: user?.email || 'system',
      action: 'DELETE',
      resource: 'agencyAgentSelections',
      resource_id: id,
      details: { project_name: selection.project_name },
    });
  },

  // ── Homologações ──

  listHomologations(): AgencyAgentHomologation[] {
    const user = localStore.getSessionUser();
    const orgId = DEFAULT_ORG_ID;
    return localStore.getAgencyAgentHomologations().filter(h => h.organization_id === orgId);
  },

  async listHomologationsAsync(): Promise<AgencyAgentHomologation[]> {
    if (!useSupabase()) {
      return this.listHomologations();
    }
    const user = localStore.getSessionUser();
    const orgId = DEFAULT_ORG_ID;
    const { data, error } = await supabase!
      .from('agency_agent_homologations')
      .select('*')
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Erro ao listar homologações no Supabase:', error);
      throw error;
    }
    return (data || []).map((row: any) => ({
      ...row,
      organization_id: orgId,
    } as AgencyAgentHomologation));
  },

  homologateProfile(data: {
    profile_id: string;
    profile_code?: string;
    status: AgencyAgentStatus;
    reviewed_by: string;
    reviewed_by_name?: string;
    notes?: string;
  }): AgencyAgentHomologation {
    const user = localStore.getSessionUser();
    const orgId = DEFAULT_ORG_ID;
    const nowStr = now();

    const homologation: AgencyAgentHomologation = {
      id: generateId('hom'),
      organization_id: orgId,
      created_at: nowStr,
      updated_at: nowStr,
      reviewed_at: nowStr,
      ...data,
    };

    localStore.setAgencyAgentProfiles(prev =>
      prev.map(p => {
        if (p.id === data.profile_id || p.code === data.profile_code) {
          return {
            ...p,
            status: data.status,
            homologated_at: nowStr,
            homologated_by: data.reviewed_by,
            homologation_notes: data.notes,
            updated_at: nowStr,
          };
        }
        return p;
      })
    );

    localStore.setAgencyAgentHomologations(prev => [homologation, ...prev]);

    localStore.logAudit({
      user_id: user?.id || 'system',
      user_email: user?.email || 'system',
      action: 'STATUS_CHANGE',
      resource: 'agencyAgentHomologations',
      resource_id: homologation.id,
      details: {
        profile_code: data.profile_code,
        status: data.status,
        reviewed_by: data.reviewed_by,
      },
    });

    return homologation;
  },

  async homologateProfileAsync(data: {
    profile_id: string;
    profile_code?: string;
    status: AgencyAgentStatus;
    reviewed_by: string;
    reviewed_by_name?: string;
    notes?: string;
  }): Promise<AgencyAgentHomologation> {
    if (!useSupabase()) {
      return this.homologateProfile(data);
    }
    const user = localStore.getSessionUser();
    const orgId = DEFAULT_ORG_ID;
    const nowStr = now();

    const homologation: AgencyAgentHomologation = {
      id: generateId('hom'),
      organization_id: orgId,
      created_at: nowStr,
      updated_at: nowStr,
      reviewed_at: nowStr,
      ...data,
    };

    const { error } = await supabase!
      .from('agency_agent_homologations')
      .insert(homologation);
    if (error) {
      console.error('Erro ao criar homologação no Supabase:', error);
      throw error;
    }

    // Atualiza o status do perfil também
    const { error: profileError } = await supabase!
      .from('agency_agent_profiles')
      .update({
        status: data.status,
        homologated_at: nowStr,
        homologated_by: data.reviewed_by,
        homologation_notes: data.notes,
        updated_at: nowStr,
      })
      .or(`id.eq.${data.profile_id},code.eq.${data.profile_code}`);

    if (profileError) {
      console.error('Erro ao atualizar status do perfil no Supabase:', profileError);
      throw profileError;
    }

    localStore.logAudit({
      user_id: user?.id || 'system',
      user_email: user?.email || 'system',
      action: 'STATUS_CHANGE',
      resource: 'agencyAgentHomologations',
      resource_id: homologation.id,
      details: {
        profile_code: data.profile_code,
        status: data.status,
        reviewed_by: data.reviewed_by,
      },
    });

    return homologation;
  },

  // ── Estatísticas ──

  stats() {
    const profiles = this.listProfiles();
    const byCategory = profiles.reduce<Record<string, number>>((acc, p) => {
      acc[p.category] = (acc[p.category] || 0) + 1;
      return acc;
    }, {});
    const byStatus = profiles.reduce<Record<string, number>>((acc, p) => {
      acc[p.status] = (acc[p.status] || 0) + 1;
      return acc;
    }, {});
    return {
      total: profiles.length,
      byCategory,
      byStatus,
      homologated: profiles.filter(p => p.status === 'homologado').length,
      notRecommended: profiles.filter(p => p.status === 'nao_recomendado').length,
      available: profiles.filter(p => p.status === 'disponivel').length,
      evaluating: profiles.filter(p => p.status === 'em_avaliacao').length,
    };
  },

  async statsAsync(): Promise<ReturnType<typeof this.stats>> {
    if (!useSupabase()) {
      return this.stats();
    }
    const profiles = await this.listProfilesAsync();
    const byCategory = profiles.reduce<Record<string, number>>((acc, p) => {
      acc[p.category] = (acc[p.category] || 0) + 1;
      return acc;
    }, {});
    const byStatus = profiles.reduce<Record<string, number>>((acc, p) => {
      acc[p.status] = (acc[p.status] || 0) + 1;
      return acc;
    }, {});
    return {
      total: profiles.length,
      byCategory,
      byStatus,
      homologated: profiles.filter(p => p.status === 'homologado').length,
      notRecommended: profiles.filter(p => p.status === 'nao_recomendado').length,
      available: profiles.filter(p => p.status === 'disponivel').length,
      evaluating: profiles.filter(p => p.status === 'em_avaliacao').length,
    };
  },

  // ── Comparação de até 5 perfis ──

  compareProfiles(ids: string[]): AgencyAgentProfile[] {
    const all = this.listProfiles();
    return all.filter(p => ids.includes(p.id)).slice(0, 5);
  },

  async compareProfilesAsync(ids: string[]): Promise<AgencyAgentProfile[]> {
    if (!useSupabase()) {
      return this.compareProfiles(ids);
    }
    const all = await this.listProfilesAsync();
    return all.filter(p => ids.includes(p.id)).slice(0, 5);
  },

  // ── Utilitário para converter linha do Supabase em perfil ──

  rowToProfile(row: any): AgencyAgentProfile {
    return {
      id: row.id,
      organization_id: row.organization_id,
      category: row.category,
      specialty: row.specialty,
      name: row.name,
      code: row.code,
      identity: row.identity,
      specialty_description: row.specialty_description,
      competencies: Array.isArray(row.competencies) ? row.competencies : [],
      personality: row.personality,
      responsibilities: Array.isArray(row.responsibilities) ? row.responsibilities : [],
      methodology: row.methodology,
      status: row.status,
      homologated_at: row.homologated_at,
      homologated_by: row.homologated_by,
      homologation_notes: row.homologation_notes,
      source_file: row.source_file,
      source_hash: row.source_hash,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  },
};
