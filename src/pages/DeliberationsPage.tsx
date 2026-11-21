/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { governanceService } from '../services/governanceService';
import { localStore } from '../services/supabaseClient';
import { Deliberation, Decision, GovernanceDocument, DeliberationStatus } from '../types';
import { PageHeader } from '../components/layout/PageHeader';
import { DeliberationCard } from '../components/governance/DeliberationCard';
import { SearchInput } from '../components/data/SearchInput';
import { FilterBar } from '../components/data/FilterBar';
import { EmptyState } from '../components/data/EmptyState';
import { Modal } from '../components/forms/Modal';
import { FormField } from '../components/forms/FormField';
import { TextInput } from '../components/forms/TextInput';
import { SelectInput } from '../components/forms/SelectInput';
import { TextArea } from '../components/forms/TextArea';
import { FormActions } from '../components/forms/FormActions';
import { ConfirmDialog } from '../components/forms/ConfirmDialog';
import { Scale, Plus } from 'lucide-react';

interface DeliberationsPageProps {
  onNavigate: (route: string) => void;
}

export const DeliberationsPage: React.FC<DeliberationsPageProps> = ({ onNavigate }) => {
  const [deliberations, setDeliberations] = useState<Deliberation[]>(governanceService.getDeliberations());
  const [decisions, setDecisions] = useState<Decision[]>(governanceService.getDecisions());
  const [documents, setDocuments] = useState<GovernanceDocument[]>(governanceService.getDocuments());
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDelib, setEditingDelib] = useState<Deliberation | null>(null);

  // Form Fields
  const [cnsCode, setCnsCode] = useState('');
  const [title, setTitle] = useState('');
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split('T')[0]);
  const [president, setPresident] = useState('Dr. Orlando Netto');
  const [quorum, setQuorum] = useState('5/5 Conselheiros Titulares (Integral)');
  const [decisionSummary, setDecisionSummary] = useState('');
  const [status, setStatus] = useState<DeliberationStatus>('approved');
  const [decRefId, setDecRefId] = useState('');
  const [delibFileRef, setDelibFileRef] = useState('');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    const handleUpdate = () => {
      setDeliberations(governanceService.getDeliberations());
      setDecisions(governanceService.getDecisions());
      setDocuments(governanceService.getDocuments());
    };
    return localStore.subscribe(handleUpdate);
  }, []);

  const openCreateModal = () => {
    setEditingDelib(null);
    setCnsCode(`CNS-2026-${String(deliberations.length + 1).padStart(3, '0')}`);
    setTitle('');
    setSessionDate(new Date().toISOString().split('T')[0]);
    setPresident('Dr. Orlando Netto');
    setQuorum('5/5 Conselheiros Titulares (Integral)');
    setDecisionSummary('');
    setStatus('approved');
    setDecRefId(decisions[0]?.id || '');
    setDelibFileRef(`DELIB-2026-${String(deliberations.length + 1).padStart(3, '0')}`);
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (delib: Deliberation) => {
    setEditingDelib(delib);
    setCnsCode(delib.cns_code);
    setTitle(delib.title);
    setSessionDate(delib.session_date);
    setPresident(delib.president);
    setQuorum(delib.quorum);
    setDecisionSummary(delib.decision_summary);
    setStatus(delib.status);
    setDecRefId(delib.dec_ref_id || '');
    setDelibFileRef(delib.delib_file_ref || '');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !cnsCode.trim() || !decisionSummary.trim()) {
      setFormError('Código, título e resumo deliberativo são obrigatórios.');
      return;
    }

    const matchedDec = decisions.find(d => d.id === decRefId);

    if (editingDelib) {
      governanceService.updateDeliberation(editingDelib.id, {
        cns_code: cnsCode,
        title,
        session_date: sessionDate,
        president,
        quorum,
        decision_summary: decisionSummary,
        status,
        dec_ref_id: decRefId || undefined,
        dec_code_ref: matchedDec?.dec_code,
        delib_file_ref: delibFileRef || undefined,
      });
    } else {
      governanceService.createDeliberation({
        cns_code: cnsCode,
        title,
        session_date: sessionDate,
        president,
        quorum,
        decision_summary: decisionSummary,
        status,
        dec_ref_id: decRefId || undefined,
        dec_code_ref: matchedDec?.dec_code,
        delib_file_ref: delibFileRef || undefined,
      });
    }

    setIsModalOpen(false);
  };

  const filteredDelibs = deliberations.filter(d => {
    const matchesSearch =
      d.title.toLowerCase().includes(search.toLowerCase()) ||
      d.cns_code.toLowerCase().includes(search.toLowerCase()) ||
      d.president.toLowerCase().includes(search.toLowerCase()) ||
      (d.dec_code_ref && d.dec_code_ref.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || d.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        kicker="Conselho Consultivo"
        title="Deliberações CNS"
        description="Atas de sessões colegiadas, verificação formal de quórum estatutário e vinculação a decretos executivos."
        actions={
          <button
            onClick={openCreateModal}
            className="px-3.5 py-2 text-xs font-semibold text-zinc-950 bg-amber-400 hover:bg-amber-300 rounded transition-colors flex items-center gap-1.5 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Lavrar Deliberação CNS</span>
          </button>
        }
      />

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <FilterBar
          options={[
            { id: 'all', label: 'Todas as Sessões', count: deliberations.length },
            { id: 'approved', label: 'Aprovadas', count: deliberations.filter(d => d.status === 'approved').length },
            { id: 'convened', label: 'Convocadas', count: deliberations.filter(d => d.status === 'convened').length },
            { id: 'rejected', label: 'Rejeitadas', count: deliberations.filter(d => d.status === 'rejected').length },
          ]}
          activeId={statusFilter}
          onChange={setStatusFilter}
        />

        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Buscar por código CNS, presidente ou termo..."
          className="w-full sm:w-72"
        />
      </div>

      {filteredDelibs.length === 0 ? (
        <EmptyState
          title="Nenhuma deliberação CNS encontrada"
          description="Registre as atas e votações do conselho para conferir respaldo estatutário às operações."
          actionLabel="Lavrar Deliberação CNS"
          onAction={openCreateModal}
          icon={Scale}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDelibs.map(delib => (
            <DeliberationCard
              key={delib.id}
              deliberation={delib}
              onEdit={openEditModal}
              onNavigateToDec={() => onNavigate('/decisions')}
              onNavigateToDelib={() => onNavigate('/documents')}
            />
          ))}
        </div>
      )}

      {/* Modal CNS */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingDelib ? 'Editar Deliberação CNS' : 'Lavratura de Deliberação CNS'}
        description="Registro oficial de deliberação com quórum e vínculos normativos."
        maxWidth="lg"
      >
        <form onSubmit={handleSave} className="space-y-4">
          {formError && (
            <p className="text-xs text-rose-400 bg-rose-950/40 p-2.5 rounded border border-rose-800/40">
              {formError}
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormField label="Código da Sessão" required helperText="Ex: CNS-2026-004">
              <TextInput
                value={cnsCode}
                onChange={e => setCnsCode(e.target.value.toUpperCase())}
                placeholder="CNS-2026-XXX"
                required
              />
            </FormField>

            <FormField label="Data da Sessão">
              <TextInput
                type="date"
                value={sessionDate}
                onChange={e => setSessionDate(e.target.value)}
              />
            </FormField>

            <FormField label="Status da Votação">
              <SelectInput
                value={status}
                onChange={e => setStatus(e.target.value as any)}
                options={[
                  { value: 'approved', label: 'Aprovada' },
                  { value: 'convened', label: 'Convocada' },
                  { value: 'rejected', label: 'Rejeitada' },
                  { value: 'adjourned', label: 'Adiada' },
                ]}
              />
            </FormField>
          </div>

          <FormField label="Título da Sessão Deliberativa" required>
            <TextInput
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Ex: 4ª Sessão Ordinária do Conselho Consultivo"
              required
            />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Presidente da Sessão" required>
              <TextInput
                value={president}
                onChange={e => setPresident(e.target.value)}
                required
              />
            </FormField>

            <FormField label="Quórum Registrado" required>
              <TextInput
                value={quorum}
                onChange={e => setQuorum(e.target.value)}
                placeholder="Ex: 5/5 Conselheiros Titulares"
                required
              />
            </FormField>
          </div>

          <FormField label="Resumo do Dispositivo Aprovado" required>
            <TextArea
              value={decisionSummary}
              onChange={e => setDecisionSummary(e.target.value)}
              placeholder="Síntese da decisão colegiada e diretrizes aprovadas..."
              rows={3}
              required
            />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Decreto Vinculado (DEC)">
              <SelectInput
                value={decRefId}
                onChange={e => setDecRefId(e.target.value)}
                options={[
                  { value: '', label: 'Sem vínculo DEC' },
                  ...decisions.map(d => ({
                    value: d.id,
                    label: `${d.dec_code} · ${d.title.substring(0, 30)}...`,
                  })),
                ]}
              />
            </FormField>

            <FormField label="Referência do Arquivo Integral (DELIB)">
              <TextInput
                value={delibFileRef}
                onChange={e => setDelibFileRef(e.target.value.toUpperCase())}
                placeholder="Ex: DELIB-2026-004"
              />
            </FormField>
          </div>

          <FormActions
            onCancel={() => setIsModalOpen(false)}
            submitLabel={editingDelib ? 'Atualizar Deliberação' : 'Registrar Deliberação CNS'}
          />
        </form>
      </Modal>
    </div>
  );
};
