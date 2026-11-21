/** @license SPDX-License-Identifier: Apache-2.0 */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { BookOpen, BrainCircuit, Check, ChevronRight, CircleAlert, ClipboardList, Compass, Layers3, Plus, Users, X } from 'lucide-react';
import { AgencyCatalogPage } from './AgencyCatalogPage';
import { agencyCatalogService } from '../services/agencyCatalogService';
import { localStore } from '../services/supabaseClient';
import { AgencyAgentProfile } from '../types';
import { PageHeader } from '../components/layout/PageHeader';
import { recommendTeamComposition, PlannerRunbook } from '../services/agencyTeamPlanner';
import { translateAgentName, translateAgentCategory, translateDivision, translateCapability, translateRunbookTitle, translateRunbookGroup, translateActivation, translateRunbookMode, translateDuration, translateRunbookSummary, translatePlannerText } from '../utils/agencyPresentation';

type ModuleTab = 'library' | 'team-builder' | 'runbooks' | 'divisions';
type RunbookGroup = { group: string; activation: string; agents: string[] };
type Runbook = PlannerRunbook;
type RunbookFile = { runbooks: Runbook[] };
type Division = { label: string; icon: string; color: string };
type DivisionFile = { divisions: Record<string, Division> };
type ProfileSearchIndexFile = { profiles: { code: string; search_text: string }[] };

const tabs: { id: ModuleTab; label: string; icon: React.ElementType }[] = [
  { id: 'library', label: 'Biblioteca', icon: BookOpen },
  { id: 'team-builder', label: 'Compor equipe', icon: Users },
  { id: 'runbooks', label: 'Roteiros operacionais', icon: ClipboardList },
  { id: 'divisions', label: 'Divisões profissionais', icon: Layers3 },
];

const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase();
const sourceIdentifier = (profile: AgencyAgentProfile) => String(profile.source_file || '').replace(/[`'"]/g, '').split('/').pop()?.replace(/\.md$/i, '') || '';

export const AgencyIntelligencePage: React.FC<{ onNavigate: (route: string) => void }> = ({ onNavigate }) => {
  const [tab, setTab] = useState<ModuleTab>('library');
  const [profiles, setProfiles] = useState<AgencyAgentProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [objective, setObjective] = useState('');
  const [projectName, setProjectName] = useState('');
  const [team, setTeam] = useState<AgencyAgentProfile[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [runbooks, setRunbooks] = useState<Runbook[]>([]);
  const [divisions, setDivisions] = useState<Record<string, Division>>({});
  const [originalSearchTextByCode, setOriginalSearchTextByCode] = useState<Record<string, string>>({});
  const [runbooksError, setRunbooksError] = useState('');
  const [activeRunbook, setActiveRunbook] = useState<string>('');

  const loadProfiles = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setProfiles(await agencyCatalogService.listProfilesAsync());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível carregar a biblioteca.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadProfiles(); }, [loadProfiles]);

  useEffect(() => {
    let active = true;
    fetch('/agency-profile-search-index.json')
      .then(response => { if (!response.ok) throw new Error('Índice dos documentos originais indisponível.'); return response.json() as Promise<ProfileSearchIndexFile>; })
      .then(data => {
        if (!active) return;
        const index = Object.fromEntries((data.profiles || []).map(item => [item.code, item.search_text]));
        setOriginalSearchTextByCode(index);
      })
      .catch(e => { if (active) console.error('Falha ao carregar índice do corpus original:', e); });
    fetch('/agency-divisions.json')
      .then(response => { if (!response.ok) throw new Error('Taxonomia de divisões indisponível.'); return response.json() as Promise<DivisionFile>; })
      .then(data => { if (active) setDivisions(data.divisions || {}); })
      .catch(() => { if (active) setDivisions({}); });
    fetch('/agency-runbooks.json')
      .then(response => {
        if (!response.ok) throw new Error('Arquivo de runbooks indisponível.');
        return response.json() as Promise<RunbookFile>;
      })
      .then(data => { if (active) setRunbooks(Array.isArray(data.runbooks) ? data.runbooks : []); })
      .catch(e => { if (active) setRunbooksError(e instanceof Error ? e.message : String(e)); });
    return () => { active = false; };
  }, []);

  const composition = useMemo(
    () => recommendTeamComposition(objective, profiles, runbooks, originalSearchTextByCode),
    [objective, profiles, runbooks, originalSearchTextByCode],
  );
  const recommendations = composition.recommendations;
  const inferredRunbook = composition.runbook;

  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>();
    team.forEach(profile => counts.set(profile.category, (counts.get(profile.category) || 0) + 1));
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [team]);

  const selectedRunbook = runbooks.find(item => item.slug === activeRunbook);
  const addToTeam = (profile: AgencyAgentProfile) => {
    setTeam(current => current.some(item => item.id === profile.id) ? current : [...current, profile]);
    setSaveMessage('');
  };
  const removeFromTeam = (id: string) => setTeam(current => current.filter(item => item.id !== id));

  const addRunbookGroup = (group: RunbookGroup) => {
    const byIdentifier = new Map<string, AgencyAgentProfile>();
    profiles.forEach(profile => {
      byIdentifier.set(normalize(profile.code), profile);
      const sourceId = sourceIdentifier(profile);
      if (sourceId) byIdentifier.set(normalize(sourceId), profile);
    });
    const found = group.agents.map(slug => byIdentifier.get(normalize(slug))).filter((item): item is AgencyAgentProfile => Boolean(item));
    setTeam(current => [...current, ...found.filter(item => !current.some(existing => existing.id === item.id))]);
    setTab('team-builder');
    setSaveMessage('');
  };

  const saveTeam = async () => {
    if (!team.length || !projectName.trim()) return;
    setSaving(true);
    setSaveMessage('');
    try {
      const user = localStore.getSessionUser();
      for (const profile of team) {
        await agencyCatalogService.createSelectionAsync({
          profile_id: profile.id,
          profile_code: profile.code,
          project_name: projectName.trim(),
          purpose: objective.trim() || 'Equipe montada a partir da biblioteca de agentes.',
          selected_by: user?.id || 'system',
          selected_by_name: user?.full_name || 'NettosCorp',
          selected_at: new Date().toISOString(),
          status: 'planejado',
          notes: 'Selecionado pelo módulo de Inteligência e Formação de Equipes.',
        });
      }
      setSaveMessage(`Equipe registrada no planejamento: ${team.length} profissional(is) para “${projectName.trim()}”.`);
    } catch (e) {
      setSaveMessage(e instanceof Error ? `Falha ao registrar a equipe: ${e.message}` : 'Falha ao registrar a equipe.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <PageHeader
          title="Inteligência e Formação de Equipes"
          description="Biblioteca profissional, composição de equipes e metodologias operacionais da NettosCorp."
        />
        <div className="mt-5 flex flex-wrap gap-2 border-b border-nc-border">
          {tabs.map(item => {
            const Icon = item.icon;
            return (
              <button key={item.id} onClick={() => setTab(item.id)}
                className={`inline-flex items-center gap-2 border-b-2 px-3 py-3 text-sm font-medium transition-colors ${tab === item.id ? 'border-nc-brand text-nc-text' : 'border-transparent text-nc-text-muted hover:text-nc-text'}`}>
                <Icon size={16} />{item.label}
              </button>
            );
          })}
        </div>
      </div>

      {tab === 'library' && <AgencyCatalogPage onNavigate={onNavigate} />}

      {tab === 'team-builder' && (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.85fr)]">
          <section className="space-y-4">
            <div className="rounded-xl border border-nc-border bg-nc-surface-elevated p-5">
              <div className="mb-3 flex items-center gap-2 text-nc-text"><BrainCircuit size={19} /><h2 className="font-semibold">Defina o objetivo da equipe</h2></div>
              <label className="mb-1 block text-sm text-nc-text-secondary" htmlFor="team-project-name">Projeto ou iniciativa</label>
              <input id="team-project-name" value={projectName} onChange={e => setProjectName(e.target.value)} placeholder="Ex.: Lançamento de uma plataforma SaaS" className="mb-3 w-full rounded-lg border border-nc-border bg-nc-surface px-3 py-2.5 text-sm text-nc-text outline-none focus:border-nc-brand" />
              <label className="mb-1 block text-sm text-nc-text-secondary" htmlFor="team-objective">O que precisa ser realizado?</label>
              <textarea id="team-objective" value={objective} onChange={e => setObjective(e.target.value)} rows={4} placeholder="Descreva o resultado esperado, as etapas, as áreas envolvidas e os desafios do projeto..." className="w-full resize-y rounded-lg border border-nc-border bg-nc-surface px-3 py-3 text-sm text-nc-text outline-none focus:border-nc-brand" />
              <p className="mt-2 text-xs text-nc-text-muted">A recomendação cruza o objetivo com o conteúdo original dos 283 perfis e as equipes previstas nos roteiros operacionais. O cenário e os critérios encontrados são exibidos para revisão humana; não é uma decisão automática de contratação ou implantação.</p>
            </div>

            <div className="flex items-center justify-between gap-3">
              <div><h2 className="font-semibold text-nc-text">Profissionais recomendados</h2><p className="text-xs text-nc-text-muted">{recommendations.length} correspondências encontradas</p></div>
              <span className="text-xs text-nc-text-muted">{loading ? 'Carregando biblioteca…' : `${profiles.length} perfis analisados`}</span>
            </div>
            {inferredRunbook && <div className="flex flex-col gap-3 rounded-xl border border-nc-brand/40 bg-nc-surface-elevated p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0"><p className="text-[11px] font-semibold uppercase tracking-wide text-nc-brand">Cenário operacional identificado</p><h3 className="mt-1 font-semibold text-nc-text">{translateRunbookTitle(inferredRunbook.title)}</h3><p className="mt-1 text-xs text-nc-text-secondary">{translateRunbookSummary(inferredRunbook.title)}</p><p className="mt-1 text-xs text-nc-text-muted">Critérios identificados: {translatePlannerText(composition.scenarioMatches.join(', '))} · {translateRunbookMode(inferredRunbook.mode)} · {translateDuration(inferredRunbook.duration)}</p></div>
              <button onClick={() => inferredRunbook.roster.forEach(addRunbookGroup)} className="shrink-0 rounded-lg bg-nc-brand px-3 py-2.5 text-xs font-semibold text-nc-brand-text">Adicionar composição completa</button>
            </div>}
            {objective.trim() && (
              <section className="rounded-xl border border-nc-border bg-nc-surface-elevated p-4">
                <div className="mb-3 flex items-center gap-2"><Layers3 size={17}/><h3 className="font-semibold text-nc-text">Análise da composição</h3></div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-nc-text-muted">Áreas identificadas no objetivo</p>
                    <div className="flex flex-wrap gap-1.5">
                      {composition.analysis.objectiveDomains.length
                        ? composition.analysis.objectiveDomains.map(domain => <span key={domain} className="rounded-md bg-nc-surface px-2 py-1 text-xs text-nc-text-secondary">{translateCapability(domain)}</span>)
                        : <span className="text-xs text-nc-text-muted">Ainda não foi possível classificar áreas com segurança.</span>}
                    </div>
                    <p className="mt-3 text-xs text-nc-text-secondary">Cobertura identificada: {composition.analysis.coveredDomains.length} de {composition.analysis.objectiveDomains.length} áreas</p>
                    {composition.analysis.uncoveredDomains.length > 0 && <p className="mt-1 text-xs text-amber-300">Lacunas para revisar: {composition.analysis.uncoveredDomains.map(translateCapability).join(', ')}</p>}
                  </div>
                  <div>
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-nc-text-muted">Pontos fortes encontrados</p>
                    {composition.analysis.strengths.length
                      ? <ul className="space-y-1">{composition.analysis.strengths.map(item => <li key={item} className="text-xs text-nc-text-secondary">• {translatePlannerText(item)}</li>)}</ul>
                      : <p className="text-xs text-nc-text-muted">A análise ainda não identificou pontos fortes suficientes.</p>}
                  </div>
                </div>
                {composition.analysis.phases.length > 0 && <div className="mt-4 border-t border-nc-border pt-3">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-nc-text-muted">Sequência sugerida pelo roteiro operacional</p>
                  <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                    {composition.analysis.phases.map((phase, index) => <div key={phase.name} className="rounded-lg bg-nc-surface p-3">
                      <p className="text-xs font-semibold text-nc-text">{index + 1}. {translateRunbookGroup(phase.name)}</p>
                      <p className="mt-1 text-xs text-nc-text-muted">Ativação: {translateActivation(phase.activation)} · {phase.count} posição(ões)</p>
                      <p className="mt-1 text-xs text-nc-text-secondary">{phase.professionals.slice(0, 5).map(name => translateAgentName(name)).join(', ')}{phase.professionals.length > 5 ? '…' : ''}</p>
                    </div>)}
                  </div>
                </div>}
                {composition.analysis.risks.length > 0 && <div className="mt-3 rounded-lg border border-amber-500/25 bg-amber-500/5 p-3">
                  <p className="mb-1 text-xs font-semibold text-amber-200">Riscos e limitações a validar</p>
                  <ul className="space-y-1">{composition.analysis.risks.map(item => <li key={item} className="text-xs text-nc-text-secondary">• {translatePlannerText(item)}</li>)}</ul>
                </div>}
                <p className="mt-3 text-[11px] text-nc-text-muted">{composition.analysis.selectionGuidance.map(translatePlannerText).join(' ')}</p>
              </section>
            )}
            {error && <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">{error}</div>}
            {!loading && objective.trim().length > 0 && recommendations.length === 0 && <div className="rounded-lg border border-nc-border p-5 text-sm text-nc-text-muted">Nenhuma correspondência textual encontrada. Amplie a descrição do objetivo ou explore a Biblioteca.</div>}
            {!objective.trim() && <div className="rounded-lg border border-dashed border-nc-border p-6 text-sm text-nc-text-muted">Descreva o projeto para receber uma primeira seleção de profissionais com competências relacionadas.</div>}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {recommendations.map(({ profile, score, reason, group, activation, dimensions }) => {
                const added = team.some(item => item.id === profile.id);
                return <article key={profile.id} className="rounded-xl border border-nc-border bg-nc-surface-elevated p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div><h3 className="font-semibold text-nc-text">{translateAgentName(profile.name, profile.code)}</h3><p className="mt-0.5 text-xs text-nc-text-muted">{translateAgentCategory(profile.category)} · {profile.code}</p></div>
                    <span className="rounded-md bg-nc-surface px-2 py-1 text-xs tabular-nums text-nc-text-secondary">{Math.round(score * 100)}% correspondência</span>
                  </div>
                  <p className="mt-3 line-clamp-3 text-sm text-nc-text-secondary">{translateAgentName(profile.name, profile.code)} · {translateAgentCategory(profile.category)}</p>
                  <p className="mt-2 text-xs text-nc-text-muted">{translatePlannerText(reason)}</p><p className="mt-2 text-[11px] text-nc-text-muted">Objetivo: {Math.round(dimensions.objectiveFit * 100)}% · Roteiro: {Math.round(dimensions.runbookFit * 100)}% · Capacidades: {dimensions.capabilityDomains.map(translateCapability).join(', ') || 'não classificadas'}</p>{group && <p className="mt-1 text-xs text-nc-brand">{translateRunbookGroup(group)} · {translateActivation(activation || '')}</p>}
                  <button onClick={() => added ? removeFromTeam(profile.id) : addToTeam(profile)} className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-nc-border px-3 py-2 text-xs font-medium text-nc-text hover:border-nc-brand">
                    {added ? <><Check size={14}/> Adicionado à equipe</> : <><Plus size={14}/> Adicionar à equipe</>}
                  </button>
                </article>;
              })}
            </div>
          </section>

          <aside className="h-fit space-y-4 rounded-xl border border-nc-border bg-nc-surface-elevated p-5">
            <div className="flex items-center justify-between"><div><h2 className="font-semibold text-nc-text">Equipe em formação</h2><p className="text-xs text-nc-text-muted">{team.length} profissional(is) selecionado(s)</p></div><Users size={20} className="text-nc-text-muted"/></div>
            {team.length === 0 ? <p className="rounded-lg border border-dashed border-nc-border p-4 text-sm text-nc-text-muted">Adicione profissionais recomendados ou carregue um grupo de um roteiro operacional.</p> : <>
              <div className="space-y-2">{team.map(profile => <div key={profile.id} className="flex items-center justify-between gap-2 rounded-lg bg-nc-surface p-3"><div className="min-w-0"><p className="truncate text-sm font-medium text-nc-text">{translateAgentName(profile.name, profile.code)}</p><p className="text-xs text-nc-text-muted">{translateAgentCategory(profile.category)}</p></div><button aria-label={`Remover ${profile.name}`} onClick={() => removeFromTeam(profile.id)} className="rounded p-1 text-nc-text-muted hover:text-red-400"><X size={15}/></button></div>)}</div>
              <div className="border-t border-nc-border pt-3"><p className="mb-2 text-xs font-semibold uppercase tracking-wide text-nc-text-muted">Distribuição por especialidade</p>{categoryCounts.map(([category, count]) => <div key={category} className="mb-1 flex justify-between text-xs text-nc-text-secondary"><span>{translateAgentCategory(category)}</span><span>{count}</span></div>)}</div>
            </>}
            <div><label htmlFor="team-save-project" className="mb-1 block text-xs text-nc-text-secondary">Projeto para registrar a seleção</label><input id="team-save-project" value={projectName} onChange={e => setProjectName(e.target.value)} placeholder="Nome do projeto" className="w-full rounded-lg border border-nc-border bg-nc-surface px-3 py-2 text-sm text-nc-text outline-none focus:border-nc-brand"/></div>
            <button disabled={!team.length || !projectName.trim() || saving} onClick={() => void saveTeam()} className="w-full rounded-lg bg-nc-brand px-4 py-2.5 text-sm font-semibold text-nc-brand-text disabled:cursor-not-allowed disabled:opacity-40">{saving ? 'Registrando seleção…' : 'Registrar equipe no planejamento'}</button>
            {saveMessage && <p role="status" className="text-xs text-nc-text-secondary">{saveMessage}</p>}
            <p className="text-xs text-nc-text-muted">O registro cria seleções individuais para o projeto. Não cria nem ativa agentes no Paperclip.</p>
          </aside>
        </div>
      )}

      {tab === 'runbooks' && (
        <div className="space-y-5">
          <div className="rounded-xl border border-nc-border bg-nc-surface-elevated p-5">
            <div className="flex items-center gap-2"><Compass size={19}/><h2 className="font-semibold text-nc-text">Roteiros de composição e execução</h2></div>
            <p className="mt-2 max-w-3xl text-sm text-nc-text-secondary">Os roteiros operacionais preservam cenários, modos NEXUS, grupos de ativação e composições de equipe do projeto de origem. Selecione um cenário para inspecionar sua estrutura ou adicionar um grupo à equipe em formação.</p>
          </div>
          {runbooksError && <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-200"><CircleAlert size={15} className="mr-2 inline"/> {translatePlannerText(runbooksError)}</div>}
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            {runbooks.map(runbook => <button key={runbook.slug} onClick={() => setActiveRunbook(runbook.slug)} className={`rounded-xl border p-4 text-left transition-colors ${activeRunbook === runbook.slug ? 'border-nc-brand bg-nc-surface-elevated' : 'border-nc-border bg-nc-surface-elevated hover:border-nc-border-hover'}`}>
              <div className="flex items-start justify-between gap-3"><div><h3 className="font-semibold text-nc-text">{translateRunbookTitle(runbook.title)}</h3><p className="mt-1 text-sm text-nc-text-secondary">{translateRunbookSummary(runbook.title)}</p></div><ChevronRight size={17} className="shrink-0 text-nc-text-muted"/></div>
              <div className="mt-3 flex flex-wrap gap-2"><span className="rounded bg-nc-surface px-2 py-1 text-xs text-nc-text-secondary">{translateRunbookMode(runbook.mode)}</span><span className="rounded bg-nc-surface px-2 py-1 text-xs text-nc-text-secondary">{translateDuration(runbook.duration)}</span><span className="rounded bg-nc-surface px-2 py-1 text-xs text-nc-text-secondary">{runbook.roster.reduce((n, group) => n + group.agents.length, 0)} profissionais na composição</span></div>
            </button>)}
          </div>
          {selectedRunbook && <section className="rounded-xl border border-nc-border bg-nc-surface-elevated p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-lg font-semibold text-nc-text">{translateRunbookTitle(selectedRunbook.title)}</h2><p className="text-sm text-nc-text-muted">{translateRunbookMode(selectedRunbook.mode)} · {translateDuration(selectedRunbook.duration)}</p></div><div className="flex items-center gap-3"><button onClick={() => selectedRunbook.roster.forEach(addRunbookGroup)} className="rounded-md bg-nc-brand px-3 py-2 text-xs font-semibold text-nc-brand-text">Adicionar equipe completa</button>{selectedRunbook.asset && <a href={selectedRunbook.asset} target="_blank" rel="noreferrer" className="text-sm text-nc-brand hover:underline">Documento completo na plataforma</a>}<a href={`https://github.com/msitarzewski/agency-agents/blob/main/${selectedRunbook.doc}`} target="_blank" rel="noreferrer" className="text-sm text-nc-text-muted hover:underline">Repositório de origem</a></div></div>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {selectedRunbook.roster.map(group => <div key={group.group} className="rounded-lg border border-nc-border p-4">
                <div className="mb-3 flex items-center justify-between gap-2"><div><h3 className="font-medium text-nc-text">{translateRunbookGroup(group.group)}</h3><p className="text-xs text-nc-text-muted">Ativação: {translateActivation(group.activation)}</p></div><button onClick={() => addRunbookGroup(group)} className="inline-flex items-center gap-1 rounded-md border border-nc-border px-2 py-1.5 text-xs text-nc-text hover:border-nc-brand"><Plus size={13}/> Adicionar grupo</button></div>
                <ul className="space-y-1.5">{group.agents.map(slug => <li key={slug} className="flex items-center gap-2 text-sm text-nc-text-secondary"><span className="h-1.5 w-1.5 rounded-full bg-nc-brand"/>{profiles.find(profile => normalize(profile.code) === normalize(slug))?.name ? translateAgentName(profiles.find(profile => normalize(profile.code) === normalize(slug))!.name, slug) : translateAgentName(slug.replace(/-/g, ' '), slug)}</li>)}</ul>
              </div>)}
            </div>
          </section>}
          <p className="text-xs text-nc-text-muted">Fonte: repositório biblioteca de origem, arquivo strategy/runbooks.json e documentos de cenário. Os rosters são referências de composição; a implantação operacional continua sob controle da Enterprise e do Paperclip.</p>
        </div>
      )}

      {tab === 'divisions' && (
        <section className="space-y-4">
          <div className="rounded-xl border border-nc-border bg-nc-surface-elevated p-5">
            <div className="flex items-center gap-2"><Layers3 size={19}/><h2 className="font-semibold text-nc-text">Taxonomia profissional de origem</h2></div>
            <p className="mt-2 max-w-3xl text-sm text-nc-text-secondary">As 18 divisões oficiais organizam o corpus original. Elas são preservadas como taxonomia de origem; as categorias corporativas da NettosCorp continuam sendo uma camada distinta e não substituem essa classificação.</p>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {Object.entries(divisions).map(([slug, division]) => <article key={slug} className="flex items-center gap-3 rounded-xl border border-nc-border bg-nc-surface-elevated p-4">
              <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: division.color }} />
              <div className="min-w-0"><h3 className="font-medium text-nc-text">{translateDivision(slug)}</h3><p className="text-xs text-nc-text-muted">Divisão profissional</p></div>
            </article>)}
          </div>
          <p className="text-xs text-nc-text-muted">Fonte: divisions.json do repositório msitarzewski/agency-agents. Taxonomia sincronizada como snapshot versionado, sem dependência operacional do repositório remoto em tempo de execução.</p>
        </section>
      )}
    </div>
  );
};
