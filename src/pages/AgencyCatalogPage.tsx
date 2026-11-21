/** @license SPDX-License-Identifier: Apache-2.0 */

import React, { useState, useEffect, useCallback } from 'react';
import { agencyCatalogService } from '../services/agencyCatalogService';
import { localStore } from '../services/supabaseClient';
import {
  AgencyAgentProfile,
  AgencyAgentCategory,
  AgencyAgentStatus,
} from '../types';
import { PageHeader } from '../components/layout/PageHeader';
import { SearchInput } from '../components/data/SearchInput';
import { EmptyState } from '../components/data/EmptyState';
import { Modal } from '../components/forms/Modal';
import { FormField } from '../components/forms/FormField';
import { TextInput } from '../components/forms/TextInput';
import { SelectInput } from '../components/forms/SelectInput';
import { TextArea } from '../components/forms/TextArea';
import { FormActions } from '../components/forms/FormActions';
import { PaperclipAgentStudio } from '../components/agency/PaperclipAgentStudio';
import { AgencyOriginalSource } from '../components/agency/AgencyOriginalSource';
import { translateAgentName, translateAgentCategory, translateProfileText } from '../utils/agencyPresentation';
import {
  Bot,
  Search,
  Users,
  Scale,
  ShieldCheck,
  Plus,
  CheckCircle,
  XCircle,
} from 'lucide-react';

const CATEGORIES: { value: AgencyAgentCategory; label: string }[] = [
  { value: 'strategy', label: 'Estratégia' },
  { value: 'operations', label: 'Operações' },
  { value: 'technology', label: 'Tecnologia' },
  { value: 'governance', label: 'Governança' },
  { value: 'finance', label: 'Financeiro' },
  { value: 'human-resources', label: 'Recursos Humanos' },
  { value: 'legal', label: 'Jurídico' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'sales', label: 'Vendas' },
  { value: 'product', label: 'Produto' },
  { value: 'research', label: 'Pesquisa' },
  { value: 'security', label: 'Segurança' },
  { value: 'compliance', label: 'Compliance' },
  { value: 'data', label: 'Dados' },
  { value: 'infrastructure', label: 'Infraestrutura' },
  { value: 'customer-success', label: 'Customer Success' },
  { value: 'communications', label: 'Comunicação' },
  { value: 'other', label: 'Outros' },
];

const STATUS_OPTIONS: { value: AgencyAgentStatus; label: string; color: string }[] = [
  { value: 'disponivel', label: 'Disponível', color: 'bg-emerald-500' },
  { value: 'em_avaliacao', label: 'Em Avaliação', color: 'bg-amber-500' },
  { value: 'homologado', label: 'Homologado', color: 'bg-emerald-600' },
  { value: 'nao_recomendado', label: 'Não Recomendado', color: 'bg-rose-500' },
];

interface AgencyCatalogPageProps {
  onNavigate: (route: string) => void;
}

export const AgencyCatalogPage: React.FC<AgencyCatalogPageProps> = ({ onNavigate }) => {
  const [profiles, setProfiles] = useState<AgencyAgentProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [operationError, setOperationError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<AgencyAgentCategory | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<AgencyAgentStatus | 'all'>('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'view' | 'homologate' | 'compare'>('view');
  const [selectedProfiles, setSelectedProfiles] = useState<string[]>([]);
  const [selectedForAction, setSelectedForAction] = useState<string[]>([]);
  const [selectMode, setSelectMode] = useState(false);
  const [bulkStatus, setBulkStatus] = useState<AgencyAgentStatus>('em_avaliacao');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [selectedProfile, setSelectedProfile] = useState<AgencyAgentProfile | null>(null);
  const [isPaperclipStudioOpen, setIsPaperclipStudioOpen] = useState(false);
  const [homologationStatus, setHomologationStatus] = useState<AgencyAgentStatus>('disponivel');
  const [homologationNotes, setHomologationNotes] = useState('');

  const [isSelectionModalOpen, setIsSelectionModalOpen] = useState(false);
  const [selectionProject, setSelectionProject] = useState('');
  const [selectionPurpose, setSelectionPurpose] = useState('');

  const loadProfiles = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await agencyCatalogService.listProfilesAsync();
      setProfiles(data);
    } catch (error) {
      console.error('Falha ao carregar a biblioteca profissional:', error);
      setProfiles([]);
      setLoadError(error instanceof Error ? error.message : String(error));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProfiles();
  }, [loadProfiles]);

  // A lista exibida, os filtros e os indicadores devem derivar do mesmo
  // conjunto carregado do Supabase (e não do armazenamento síncrono local).
  const applyFilters = useCallback(() => {
    const query = search.trim().toLocaleLowerCase();
    let result = profiles;

    if (query) {
      result = result.filter(profile =>
        [profile.name, profile.code, profile.identity, profile.specialty_description,
          ...(profile.competencies || []), ...(profile.responsibilities || [])]
          .some(value => String(value || '').toLocaleLowerCase().includes(query))
      );
    }
    if (categoryFilter !== 'all') {
      result = result.filter(profile => profile.category === categoryFilter);
    }
    if (statusFilter !== 'all') {
      result = result.filter(profile => profile.status === statusFilter);
    }

    return [...result].sort((a, b) => a.code.localeCompare(b.code));
  }, [profiles, search, categoryFilter, statusFilter]);

  const filteredProfiles = applyFilters();
  const pageCount = Math.max(1, Math.ceil(filteredProfiles.length / pageSize));
  const pageProfiles = filteredProfiles.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const allFilteredSelected = filteredProfiles.length > 0 && filteredProfiles.every(profile => selectedForAction.includes(profile.id));
  const toggleAllFiltered = () => setSelectedForAction(current => allFilteredSelected
    ? current.filter(id => !filteredProfiles.some(profile => profile.id === id))
    : Array.from(new Set([...current, ...filteredProfiles.map(profile => profile.id)])));
  const handleBulkHomologate = async () => {
    const targets = profiles.filter(profile => selectedForAction.includes(profile.id));
    if (!targets.length) return;
    setOperationError(null);
    try {
      for (const profile of targets) {
        await agencyCatalogService.homologateProfileAsync({
          profile_id: profile.id, profile_code: profile.code, status: bulkStatus,
          reviewed_by: localStore.getSessionUser()?.id || 'system',
          reviewed_by_name: localStore.getSessionUser()?.full_name,
          notes: 'Homologação em lote pela biblioteca profissional.',
        });
      }
      setSelectedForAction([]);
      await loadProfiles();
    } catch (error) {
      setOperationError(error instanceof Error ? error.message : String(error));
    }
  };
  const handleBulkSelectForProject = async () => {
    const targets = profiles.filter(profile => selectedForAction.includes(profile.id));
    if (!targets.length || !selectionProject.trim()) return;
    setOperationError(null);
    try {
      for (const profile of targets) {
        await agencyCatalogService.createSelectionAsync({
          profile_id: profile.id, profile_code: profile.code,
          project_name: selectionProject.trim(), purpose: selectionPurpose,
          selected_by: localStore.getSessionUser()?.id || 'system',
          selected_by_name: localStore.getSessionUser()?.full_name,
          selected_at: new Date().toISOString(), status: 'planejado',
        });
      }
      setSelectedForAction([]);
      setIsSelectionModalOpen(false);
      setSelectionProject('');
      setSelectionPurpose('');
    } catch (error) {
      setOperationError(error instanceof Error ? error.message : String(error));
    }
  };
  useEffect(() => { setCurrentPage(1); }, [search, categoryFilter, statusFilter, pageSize]);
  const stats = {
    total: profiles.length,
    homologated: profiles.filter(profile => profile.status === 'homologado').length,
    evaluating: profiles.filter(profile => profile.status === 'em_avaliacao').length,
    notRecommended: profiles.filter(profile => profile.status === 'nao_recomendado').length,
  };

  const openViewModal = (profile: AgencyAgentProfile) => {
    setSelectedProfile(profile);
    setModalType('view');
    setIsModalOpen(false);
  };

  const openHomologateModal = (profile: AgencyAgentProfile) => {
    setSelectedProfile(profile);
    setModalType('homologate');
    setHomologationStatus(profile.status);
    setHomologationNotes(profile.homologation_notes || '');
    setIsModalOpen(true);
  };

  const toggleCompare = (profileId: string) => {
    setSelectedProfiles(prev => {
      if (prev.includes(profileId)) {
        return prev.filter(id => id !== profileId);
      }
      if (prev.length >= 5) {
        return prev;
      }
      return [...prev, profileId];
    });
  };

  const isComparing = (profileId: string) => selectedProfiles.includes(profileId);

  const handleHomologate = async () => {
    if (!selectedProfile) return;
    setOperationError(null);
    try {
      await agencyCatalogService.homologateProfileAsync({
        profile_id: selectedProfile.id,
        profile_code: selectedProfile.code,
        status: homologationStatus,
        reviewed_by: localStore.getSessionUser()?.id || 'system',
        reviewed_by_name: localStore.getSessionUser()?.full_name,
        notes: homologationNotes || undefined,
      });
    } catch (error) {
      setOperationError(error instanceof Error ? error.message : String(error));
      return;
    }
    await loadProfiles();
    setIsModalOpen(false);
    setSelectedProfile(null);
  };

  const handleSelectForProject = async () => {
    if (!selectedProfile) return;
    await agencyCatalogService.createSelectionAsync({
      profile_id: selectedProfile.id,
      profile_code: selectedProfile.code,
      project_name: selectionProject,
      purpose: selectionPurpose,
      selected_by: localStore.getSessionUser()?.id || 'system',
      selected_by_name: localStore.getSessionUser()?.full_name,
      selected_at: new Date().toISOString(),
      status: 'planejado',
    });
    setIsSelectionModalOpen(false);
    setSelectedProfile(null);
    setSelectionProject('');
    setSelectionPurpose('');
  };

  const statusColor = (status: AgencyAgentStatus) => {
    const opt = STATUS_OPTIONS.find(o => o.value === status);
    return opt?.color || 'bg-zinc-500';
  };

  const categoryOptions = [
    { value: 'all', label: 'Todas categorias' },
    ...CATEGORIES.map(c => ({ value: c.value, label: c.label })),
  ];

  const statusOptions = [
    { value: 'all', label: 'Todos os status' },
    ...STATUS_OPTIONS.map(o => ({ value: o.value, label: o.label })),
  ];

  return (
    <div className={selectedProfile && modalType === "view" ? "space-y-6 lg:pr-[min(720px,58vw)]" : "space-y-6"}>
      <PageHeader
        title="Biblioteca de Profissionais e Agentes"
        description="Explore os perfis profissionais originais, consulte competências e forme equipes para seus projetos."
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setSearch('');
                setCategoryFilter('all');
                setStatusFilter('all');
              }}
              className="px-3 py-2 text-sm font-medium text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              Limpar filtros
            </button>
            <button
              onClick={() => setSelectMode(value => !value)}
              className={`px-3 py-2 rounded text-sm font-medium transition-colors ${selectMode ? 'bg-blue-600 text-white' : 'border border-zinc-700 text-zinc-300 hover:bg-zinc-800'}`}
            >
              {selectMode ? 'Sair da seleção' : 'Selecionar modelos'}
            </button>
            <button
              disabled={!selectedForAction.length}
              onClick={() => { setOperationError(null); setIsSelectionModalOpen(true); }}
              className="flex items-center gap-2 px-3 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 rounded text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Plus className="w-4 h-4" /> Selecionar para projeto
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
          <div className="text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-1">Total de modelos</div>
          <div className="text-2xl font-bold text-zinc-100">{loading ? '—' : stats.total}</div>
        </div>
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
          <div className="text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-1">Homologados</div>
          <div className="text-2xl font-bold text-emerald-400">{loading ? '—' : stats.homologated}</div>
        </div>
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
          <div className="text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-1">Em avaliação</div>
          <div className="text-2xl font-bold text-amber-400">{loading ? '—' : stats.evaluating}</div>
        </div>
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
          <div className="text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-1">Não recomendados</div>
          <div className="text-2xl font-bold text-rose-400">{loading ? '—' : stats.notRecommended}</div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 items-end">
        <div className="flex-1">
          <SearchInput
            placeholder="Buscar por nome, código, identidade ou competências..."
            value={search}
            onChange={setSearch}
          />
        </div>
        <div className="min-w-[200px]">
          <SelectInput
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value as AgencyAgentCategory | 'all')}
            options={categoryOptions}
          />
        </div>
        <div className="min-w-[200px]">
          <SelectInput
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as AgencyAgentStatus | 'all')}
            options={statusOptions}
          />
        </div>
      </div>

      {!loading && loadError && (
        <div role="alert" className="rounded-xl border border-rose-800 bg-rose-950/30 p-4 text-sm text-rose-200">
          <p className="font-semibold">Não foi possível carregar os perfis do Supabase.</p>
          <p className="mt-1 break-words text-rose-300">{loadError}</p>
          <button onClick={() => void loadProfiles()} className="mt-3 rounded bg-rose-800 px-3 py-2 font-medium text-white hover:bg-rose-700">
            Tentar novamente
          </button>
        </div>
      )}

      {loading && (
        <div className="flex justify-center py-10">
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-2 border-zinc-700 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-zinc-500">Carregando perfis…</p>
          </div>
        </div>
      )}

      {!loading && !loadError && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProfiles.length === 0 ? (
            <EmptyState
              icon={Search}
              title="Nenhum modelo encontrado"
              description="Ajuste os filtros de busca ou consulte a biblioteca de perfis profissionais."
            />
          ) : (
            pageProfiles.map(profile => (
              <div
                key={profile.id}
                className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 hover:border-zinc-600 transition-colors cursor-pointer group"
                onClick={() => openViewModal(profile)}
              >
                <div className="flex items-start justify-between mb-2">
                  {selectMode && <input type="checkbox" checked={selectedForAction.includes(profile.id)} onChange={() => setSelectedForAction(current => current.includes(profile.id) ? current.filter(id => id !== profile.id) : [...current, profile.id])} onClick={event => event.stopPropagation()} aria-label={`Selecionar ${translateAgentName(profile.name, profile.code)}`} className="mr-2 h-4 w-4 accent-blue-500" />}
                  <div>
                    <h3 className="font-semibold text-zinc-100">{translateAgentName(profile.name, profile.code)}</h3>
                    <span className="text-xs font-mono text-zinc-500">{profile.code}</span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${statusColor(profile.status)} text-zinc-950`}
                  >
                    {STATUS_OPTIONS.find(o => o.value === profile.status)?.label || profile.status}
                  </span>
                </div>
                <p className="text-zinc-400 text-sm mb-3 line-clamp-2">{translateProfileText(profile.identity)}</p>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-zinc-500">{translateAgentCategory(profile.category)}</span>
                  <span className="text-xs text-zinc-500">{translateProfileText(profile.specialty_description)}</span>
                </div>
                <div className="flex flex-wrap gap-1 mb-3">
                  {profile.competencies.slice(0, 4).map(c => (
                    <span key={c} className="px-2 py-1 bg-zinc-800/50 border border-zinc-800 rounded text-xs text-zinc-300">
                      {c}
                    </span>
                  ))}
                  {profile.competencies.length > 4 && (
                    <span className="px-2 py-1 bg-zinc-800/50 border border-zinc-800 rounded text-xs text-zinc-500">
                      +{profile.competencies.length - 4}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-zinc-800/50">
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      toggleCompare(profile.id);
                    }}
                    className="p-1.5 rounded hover:bg-zinc-800 transition-colors"
                    title={isComparing(profile.id) ? 'Remover da comparação' : 'Adicionar à comparação'}
                  >
                    {isComparing(profile.id) ? (
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Plus className="w-4 h-4 text-zinc-400" />
                    )}
                  </button>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      openHomologateModal(profile);
                    }}
                    className="p-1.5 rounded hover:bg-zinc-800 transition-colors"
                    title="Homologar"
                  >
                    <ShieldCheck className="w-4 h-4 text-zinc-400" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {!loading && !loadError && filteredProfiles.length > 0 && (
        <div className="flex flex-col gap-3 rounded-xl border border-zinc-800 bg-zinc-900/40 p-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400">
            <span>Exibindo {Math.min(filteredProfiles.length, (currentPage - 1) * pageSize + 1)}–{Math.min(filteredProfiles.length, currentPage * pageSize)} de {filteredProfiles.length}</span>
            <label className="flex items-center gap-2">Por página
              <select value={pageSize} onChange={event => setPageSize(Number(event.target.value))} className="rounded border border-zinc-700 bg-zinc-950 px-2 py-1 text-zinc-200">
                <option value={12}>12</option><option value={24}>24</option><option value={48}>48</option>
              </select>
            </label>
          </div>
          <div className="flex items-center gap-2">
            <button disabled={currentPage <= 1} onClick={() => setCurrentPage(page => Math.max(1, page - 1))} className="rounded border border-zinc-700 px-3 py-1.5 text-xs text-zinc-300 disabled:opacity-40">Anterior</button>
            <span className="text-xs tabular-nums text-zinc-400">Página {currentPage} / {pageCount}</span>
            <button disabled={currentPage >= pageCount} onClick={() => setCurrentPage(page => Math.min(pageCount, page + 1))} className="rounded border border-zinc-700 px-3 py-1.5 text-xs text-zinc-300 disabled:opacity-40">Próxima</button>
          </div>
        </div>
      )}
      {selectMode && (
        <section className="sticky bottom-3 z-20 rounded-xl border border-blue-900 bg-zinc-950 p-3 shadow-xl sm:p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <button onClick={toggleAllFiltered} className="text-xs font-medium text-blue-300 hover:text-blue-200">{allFilteredSelected ? "Desmarcar filtrados" : "Selecionar todos os filtrados"}</button>
              <span className="text-xs text-zinc-400">{selectedForAction.length} selecionado(s)</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <select value={bulkStatus} onChange={event => setBulkStatus(event.target.value as AgencyAgentStatus)} className="rounded border border-zinc-700 bg-zinc-900 px-2 py-2 text-xs text-zinc-200">{STATUS_OPTIONS.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select>
              <button disabled={!selectedForAction.length} onClick={() => void handleBulkHomologate()} className="rounded border border-zinc-700 px-3 py-2 text-xs font-medium text-zinc-200 disabled:opacity-40">Homologar selecionados</button>
              <button disabled={!selectedForAction.length} onClick={() => { setOperationError(null); setIsSelectionModalOpen(true); }} className="rounded bg-amber-500 px-3 py-2 text-xs font-semibold text-zinc-950 disabled:opacity-40">Selecionar para projeto</button>
              <button onClick={() => setSelectedForAction([])} className="px-2 py-2 text-xs text-zinc-500 hover:text-zinc-200">Limpar</button>
            </div>
          </div>
          {operationError && <p role="alert" className="mt-2 text-xs text-rose-300">{operationError}</p>}
        </section>
      )}
      {selectedProfiles.length > 0 && (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-zinc-100">Comparação ({selectedProfiles.length}/5)</h4>
            <button
              onClick={() => setSelectedProfiles([])}
              className="text-xs text-zinc-400 hover:text-zinc-200"
            >
              Limpar
            </button>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {selectedProfiles.map(id => {
              const profile = profiles.find(p => p.id === id);
              if (!profile) return null;
              return (
                <div key={id} className="flex-shrink-0 w-48 bg-zinc-800/50 border border-zinc-800 rounded-lg p-3">
                  <h5 className="text-xs font-semibold text-zinc-100 truncate">{translateAgentName(profile.name, profile.code)}</h5>
                  <p className="text-[10px] text-zinc-500 truncate">{profile.code}</p>
                  <span
                    className={`px-1 py-0.5 rounded text-[9px] font-bold uppercase ${statusColor(profile.status)} text-zinc-950 mt-1 inline-block`}
                  >
                    {STATUS_OPTIONS.find(o => o.value === profile.status)?.label}
                  </span>
                  <button
                    onClick={() => toggleCompare(id)}
                    className="mt-2 p-1 hover:bg-zinc-700 rounded"
                    title="Remover da comparação"
                  >
                    <XCircle className="w-3 h-3 text-zinc-500" />
                  </button>
                </div>
              );
            })}
          </div>
          {selectedProfiles.length >= 5 && (
            <p className="text-xs text-zinc-500 mt-2">Limite de 5 perfis atingido para comparação.</p>
          )}
        </div>
      )}

      {selectedProfile && modalType === "view" && !isPaperclipStudioOpen && (
        <aside className="fixed inset-0 z-40 flex flex-col overflow-hidden border-l border-zinc-800 bg-zinc-950 shadow-2xl sm:inset-y-0 sm:left-auto sm:right-0 sm:w-[min(720px,58vw)]" aria-label="Ficha profissional individual">
          <header className="flex items-start justify-between gap-3 border-b border-zinc-800 px-5 py-4">
            <div className="min-w-0"><p className="text-[10px] font-semibold uppercase tracking-widest text-blue-400">Ficha profissional · Biblioteca de Agentes</p><h2 className="mt-1 text-lg font-semibold text-zinc-100">{translateAgentName(selectedProfile.name, selectedProfile.code)}</h2><p className="text-xs text-zinc-500">{selectedProfile.code} · {translateAgentCategory(selectedProfile.category)}</p></div>
            <button onClick={() => setSelectedProfile(null)} className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white" aria-label="Fechar ficha"><XCircle className="h-5 w-5" /></button>
          </header>
          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-5">
            <div className="flex flex-wrap items-center gap-2"><span className={"rounded px-2 py-1 text-[10px] font-bold uppercase " + statusColor(selectedProfile.status) + " text-zinc-950"}>{STATUS_OPTIONS.find(option => option.value === selectedProfile.status)?.label}</span><span className="rounded border border-zinc-800 px-2 py-1 text-[10px] text-zinc-400">Perfil mestre · não implantado</span></div>
            <div className="rounded-lg border border-nc-border bg-nc-surface p-3"><p className="text-xs leading-5 text-nc-text-secondary">O documento original é a referência profissional principal. Os campos estruturados abaixo só são exibidos quando a importação contém conteúdo específico, evitando apresentar textos genéricos como atributos reais do agente.</p></div>
            <AgencyOriginalSource sourceFile={selectedProfile.source_file} />
            <section><h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">Identidade profissional</h3><p className="text-sm leading-6 text-zinc-300">{translateProfileText(selectedProfile.identity)}</p>{selectedProfile.specialty_description && selectedProfile.specialty_description.trim() !== selectedProfile.identity.trim() && <p className="mt-3 text-sm leading-6 text-zinc-400">{translateProfileText(selectedProfile.specialty_description)}</p>}</section>
            {selectedProfile.competencies?.length > 0 && !(selectedProfile.competencies.length === 1 && selectedProfile.competencies[0].trim().toLocaleLowerCase() === selectedProfile.specialty_description.trim().toLocaleLowerCase()) && <section><h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">Competências importadas</h3><div className="flex flex-wrap gap-2">{selectedProfile.competencies.map(item => <span key={item} className="rounded-md border border-zinc-800 bg-zinc-900 px-2 py-1 text-xs text-zinc-300">{translateProfileText(item)}</span>)}</div></section>}
            {selectedProfile.personality && !selectedProfile.personality.trim().toLocaleLowerCase().startsWith('profissional especializado em ') && <section><h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">Personalidade importada</h3><p className="text-sm leading-6 text-zinc-300">{translateProfileText(selectedProfile.personality)}</p></section>}
            {selectedProfile.responsibilities?.some(item => !/^Atuar como /i.test(item.trim())) && <section><h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">Responsabilidades importadas</h3><ul className="space-y-2 text-sm leading-6 text-zinc-300">{selectedProfile.responsibilities.filter(item => !/^Atuar como /i.test(item.trim())).map(item => <li key={item} className="border-l-2 border-zinc-700 pl-3">{item}</li>)}</ul></section>}
            {selectedProfile.methodology && !selectedProfile.methodology.trim().toLocaleLowerCase().startsWith('metodologia profissional baseada em ') && <section><h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">Metodologia importada</h3><p className="text-sm leading-6 text-zinc-300">{translateProfileText(selectedProfile.methodology)}</p></section>}
            <section className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-3"><h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">Origem e rastreabilidade</h3><p className="break-all text-xs text-zinc-400">{selectedProfile.source_file}</p><p className="mt-1 break-all font-mono text-[10px] text-zinc-600">{selectedProfile.source_hash}</p></section>
          </div>
          <footer className="flex flex-col gap-2 border-t border-zinc-800 p-4 sm:flex-row">
            <button onClick={() => setIsPaperclipStudioOpen(true)} className="flex-1 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-500">Preparar para Paperclip</button>
            <button onClick={() => openHomologateModal(selectedProfile)} className="rounded-lg border border-zinc-700 px-4 py-3 text-sm font-medium text-zinc-200 hover:bg-zinc-800">Homologar</button>
            <button onClick={() => setIsSelectionModalOpen(true)} className="rounded-lg border border-zinc-700 px-4 py-3 text-sm font-medium text-zinc-200 hover:bg-zinc-800">Selecionar para projeto</button>
          </footer>
        </aside>
      )}
      <Modal
        isOpen={isModalOpen}
        maxWidth="2xl"
        onClose={() => {
          setIsModalOpen(false);
          setSelectedProfile(null);
        }}
        title={modalType === 'homologate' ? 'Homologar modelo' : modalType === 'compare' ? 'Comparação de perfis' : 'Ficha do modelo'}
      >
        {modalType === 'view' && selectedProfile && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-start justify-between mb-1">
                  <h3 className="text-lg font-bold text-zinc-100">{translateAgentName(selectedProfile.name, selectedProfile.code)}</h3>
                  <span
                    className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${statusColor(selectedProfile.status)} text-zinc-950`}
                  >
                    {STATUS_OPTIONS.find(o => o.value === selectedProfile.status)?.label}
                  </span>
                </div>
                <p className="text-xs font-mono text-zinc-500 mb-2">{selectedProfile.code}</p>
                <h4 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-1">Identidade</h4>
                <p className="text-zinc-300 text-sm leading-relaxed">{translateProfileText(selectedProfile.identity)}</p>
                <h4 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-1 mt-4">Descrição da especialidade</h4>
                <p className="text-zinc-300 text-sm">{translateProfileText(selectedProfile.specialty_description)}</p>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-1">Categoria</h4>
                <p className="text-zinc-300 text-sm">{CATEGORIES.find(c => c.value === selectedProfile.category)?.label}</p>
                <h4 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-1 mt-4">Competências</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedProfile.competencies.map(c => (
                    <span key={c} className="px-2 py-1 bg-zinc-800/50 border border-zinc-800 rounded text-xs text-zinc-300">
                      {c}
                    </span>
                  ))}
                </div>
                <h4 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-1 mt-4">Personalidade</h4>
                <p className="text-zinc-300 text-sm italic">{translateProfileText(selectedProfile.personality)}</p>
              </div>
            </div>
            <h4 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-1">Responsabilidades</h4>
            <ul className="list-disc list-inside text-zinc-300 text-sm space-y-1">
              {selectedProfile.responsibilities.map(r => (
                <li key={r}>{translateProfileText(r)}</li>
              ))}
            </ul>
            <h4 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-1 mt-4">Metodologia</h4>
            <p className="text-zinc-300 text-sm leading-relaxed">{translateProfileText(selectedProfile.methodology)}</p>
            {selectedProfile.source_file && (
              <div className="mt-4 pt-4 border-t border-zinc-800">
                <p className="text-xs text-zinc-500">Arquivo origem: {selectedProfile.source_file}</p>
              </div>
            )}
            <div className="flex gap-2">
              <button
                onClick={() => setModalType('homologate')}
                className="flex-1 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded text-sm font-medium transition-colors"
              >
                Homologar
              </button>
              <button
                onClick={() => setIsPaperclipStudioOpen(true)}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-sm font-medium transition-colors"
              >
                Preparar para Paperclip
              </button>
              <button
                onClick={() => {
                  setIsSelectionModalOpen(true);
                }}
                className="flex-1 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 rounded text-sm font-medium transition-colors"
              >
                Selecionar para projeto
              </button>
            </div>
          </div>
        )}
        {modalType === 'homologate' && selectedProfile && (
          <form onSubmit={e => { e.preventDefault(); void handleHomologate(); }} className="space-y-4">
            {operationError && <div role="alert" className="rounded-lg border border-rose-800 bg-rose-950/30 p-3 text-xs text-rose-200">Falha ao persistir homologação no Supabase: {operationError}</div>}
            <div>
              <h3 className="text-lg font-bold text-zinc-100 mb-1">{translateAgentName(selectedProfile.name, selectedProfile.code)}</h3>
              <p className="text-xs font-mono text-zinc-500">{selectedProfile.code}</p>
            </div>
            <FormField label="Novo status de homologação">
              <SelectInput
                value={homologationStatus}
                onChange={e => setHomologationStatus(e.target.value as AgencyAgentStatus)}
                options={STATUS_OPTIONS.map(o => ({ value: o.value, label: o.label }))}
              />
            </FormField>
            <FormField label="Observações da homologação">
              <TextArea value={homologationNotes} onChange={e => setHomologationNotes(e.target.value)} rows={3} />
            </FormField>
            <div className="text-xs text-zinc-500">
              Esta operação registra a decisão de homologação e atualiza o status do modelo no catálogo.
              Não cria nem exclui agentes operacionais no Paperclip.
            </div>
            <FormActions
              onCancel={() => {
                setIsModalOpen(false);
                setSelectedProfile(null);
              }}
              submitLabel="Confirmar homologação"
              cancelLabel="Cancelar"
            />
          </form>
        )}
        {modalType === 'compare' && selectedProfiles.length > 0 && (
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-zinc-100">Comparação de perfis</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {selectedProfiles.map(id => {
                const profile = profiles.find(p => p.id === id);
                if (!profile) return null;
                return (
                  <div key={id} className="bg-zinc-800/50 border border-zinc-800 rounded-lg p-3">
                    <h5 className="text-xs font-bold text-zinc-100 mb-1">{translateAgentName(profile.name, profile.code)}</h5>
                    <p className="text-[10px] text-zinc-500 mb-2">{profile.code}</p>
                    <p className="text-xs text-zinc-300 mb-2">{profile.identity}</p>
                    <span
                      className={`px-1 py-0.5 rounded text-[9px] font-bold uppercase ${statusColor(profile.status)} text-zinc-950`}
                    >
                      {STATUS_OPTIONS.find(o => o.value === profile.status)?.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={isSelectionModalOpen}
        onClose={() => {
          setIsSelectionModalOpen(false);
          setSelectedProfile(null);
          setSelectionProject('');
          setSelectionPurpose('');
        }}
        title="Selecionar modelo para projeto"
      >
        {(selectedProfile || selectedForAction.length > 0) && (
          <form onSubmit={e => { e.preventDefault(); if (selectedForAction.length) void handleBulkSelectForProject(); else void handleSelectForProject().catch(error => setOperationError(error instanceof Error ? error.message : String(error))); }} className="space-y-4">
            {operationError && <div role="alert" className="rounded-lg border border-rose-800 bg-rose-950/30 p-3 text-xs text-rose-200">Falha ao persistir seleção no Supabase: {operationError}</div>}
            <div className="bg-zinc-800/50 border border-zinc-800 rounded-lg p-3">
              <h4 className="text-sm font-semibold text-zinc-100 mb-1">{selectedForAction.length ? selectedForAction.length + ' modelos selecionados' : 'Modelo selecionado'}</h4>
              <p className="text-xs text-zinc-400">{selectedProfile ? selectedProfile.name + ' (' + selectedProfile.code + ')' : profiles.filter(profile => selectedForAction.includes(profile.id)).map(profile => translateAgentName(profile.name, profile.code)).join(', ')}</p>
            </div>
            <FormField label="Nome do projeto">
              <TextInput
                value={selectionProject}
                onChange={e => setSelectionProject(e.target.value)}
                placeholder="Ex: Plataforma de Atendimento ao Cliente"
              />
            </FormField>
            <FormField label="Propósito da seleção">
              <TextArea
                value={selectionPurpose}
                onChange={e => setSelectionPurpose(e.target.value)}
                rows={2}
                placeholder="Por que este modelo foi selecionado para este projeto?"
              />
            </FormField>
            <div className="text-xs text-zinc-500">
              A seleção registra o modelo para planejamento de equipes futuras. Não cadastra o modelo como
              agente operacional no Paperclip.
            </div>
            <FormActions
              onCancel={() => {
                setIsSelectionModalOpen(false);
                setSelectedProfile(null);
                setSelectionProject('');
                setSelectionPurpose('');
              }}
              submitLabel="Confirmar seleção"
              cancelLabel="Cancelar"
            />
          </form>
        )}
      </Modal>
      {isPaperclipStudioOpen && selectedProfile && (
        <PaperclipAgentStudio
          profile={selectedProfile}
          onClose={() => setIsPaperclipStudioOpen(false)}
        />
      )}
    </div>
  );
};
