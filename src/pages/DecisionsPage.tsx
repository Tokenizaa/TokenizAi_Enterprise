/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { governanceService } from '../services/governanceService';
import { localStore } from '../services/supabaseClient';
import { Decision, Deliberation, DecisionStatus } from '../types';
import { PageHeader } from '../components/layout/PageHeader';
import { DecisionCard } from '../components/governance/DecisionCard';
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
import { Gavel, Plus } from 'lucide-react';

interface DecisionsPageProps {
  onNavigate: (route: string) => void;
}

export const DecisionsPage: React.FC<DecisionsPageProps> = ({ onNavigate }) => {
  const [decisions, setDecisions] = useState<Decision[]>(governanceService.getDecisions());
  const [deliberations, setDeliberations] = useState<Deliberation[]>(governanceService.getDeliberations());
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDec, setEditingDec] = useState<Decision | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Decision | null>(null);

  // Form Fields
  const [decCode, setDecCode] = useState('');
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [rationale, setRationale] = useState('');
  const [decidedBy, setDecidedBy] = useState('Conselho Consultivo NettosCorp');
  const [status, setStatus] = useState<DecisionStatus>('in_effect');
  const [cnsRefId, setCnsRefId] = useState('');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    const handleUpdate = () => {
      setDecisions(governanceService.getDecisions());
      setDeliberations(governanceService.getDeliberations());
    };
    return localStore.subscribe(handleUpdate);
  }, []);

  const openCreateModal = () => {
    setEditingDec(null);
    setDecCode(`DEC-2026-${String(decisions.length + 1).padStart(3, '0')}`);
    setTitle('');
    setSummary('');
    setRationale('');
    setDecidedBy('Conselho Consultivo NettosCorp');
    setStatus('in_effect');
    setCnsRefId(deliberations[0]?.id || '');
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (dec: Decision) => {
    setEditingDec(dec);
    setDecCode(dec.dec_code);
    setTitle(dec.title);
    setSummary(dec.summary);
    setRationale(dec.rationale);
    setDecidedBy(dec.decided_by);
    setStatus(dec.status);
    setCnsRefId(dec.deliberation_ref_id || '');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !decCode.trim() || !summary.trim() || !rationale.trim()) {
      setFormError('Código, título, sumário e fundamentação são obrigatórios.');
      return;
    }

    const matchedCns = deliberations.find(c => c.id === cnsRefId);

    if (editingDec) {
      governanceService.updateDecision(editingDec.id, {
        dec_code: decCode,
        title,
        summary,
        rationale,
        decided_by: decidedBy,
        status,
        deliberation_ref_id: cnsRefId || undefined,
        deliberation_cns_code: matchedCns?.cns_code,
      });
    } else {
      governanceService.createDecision({
        dec_code: decCode,
        title,
        summary,
        rationale,
        decided_by: decidedBy,
        status,
        decided_at: new Date().toISOString().split('T')[0],
        deliberation_ref_id: cnsRefId || undefined,
        deliberation_cns_code: matchedCns?.cns_code,
      });
    }

    setIsModalOpen(false);
  };

  const filteredDecisions = decisions.filter(d => {
    const matchesSearch =
      d.title.toLowerCase().includes(search.toLowerCase()) ||
      d.dec_code.toLowerCase().includes(search.toLowerCase()) ||
      d.summary.toLowerCase().includes(search.toLowerCase()) ||
      (d.deliberation_cns_code && d.deliberation_cns_code.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || d.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        kicker="Registro Oficial DEC"
        title="Decisões Institucionais"
        description="Repositório formal de decisões, atos estatutários e deliberações com fundamentação jurídica e regimental."
        actions={
          <button
            onClick={openCreateModal}
            className="px-3.5 py-2 text-xs font-semibold text-zinc-950 bg-amber-400 hover:bg-amber-300 rounded transition-colors flex items-center gap-1.5 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Emitir Nova Decisão DEC</span>
          </button>
        }
      />

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <FilterBar
          options={[
            { id: 'all', label: 'Todas as Decisões', count: decisions.length },
            { id: 'in_effect', label: 'Em Vigor', count: decisions.filter(d => d.status === 'in_effect').length },
            { id: 'ratified', label: 'Homologadas', count: decisions.filter(d => d.status === 'ratified').length },
            { id: 'draft', label: 'Minutas', count: decisions.filter(d => d.status === 'draft').length },
          ]}
          activeId={statusFilter}
          onChange={setStatusFilter}
        />

        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Buscar por código DEC, termo ou CNS..."
          className="w-full sm:w-72"
        />
      </div>

      {filteredDecisions.length === 0 ? (
        <EmptyState
          title="Nenhuma decisão DEC encontrada"
          description="Cadastre a primeira decisão institucional formalizada para a organização."
          actionLabel="Emitir Decisão DEC"
          onAction={openCreateModal}
          icon={Gavel}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDecisions.map(dec => (
            <DecisionCard
              key={dec.id}
              decision={dec}
              onEdit={openEditModal}
              onNavigateToCns={() => onNavigate('/deliberations')}
            />
          ))}
        </div>
      )}

      {/* Modal DEC */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingDec ? 'Editar Decisão DEC' : 'Emissão de Decisão Institucional (DEC)'}
        description="Formalização do instrumento normativo com fundamentação e referência deliberativa."
        maxWidth="lg"
      >
        <form onSubmit={handleSave} className="space-y-4">
          {formError && (
            <p className="text-xs text-rose-400 bg-rose-950/40 p-2.5 rounded border border-rose-800/40">
              {formError}
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Identificador DEC" required helperText="Ex: DEC-2026-004">
              <TextInput
                value={decCode}
                onChange={e => setDecCode(e.target.value.toUpperCase())}
                placeholder="DEC-2026-XXX"
                required
              />
            </FormField>

            <FormField label="Status Normativo">
              <SelectInput
                value={status}
                onChange={e => setStatus(e.target.value as any)}
                options={[
                  { value: 'draft', label: 'Minuta Preliminar' },
                  { value: 'ratified', label: 'Homologada' },
                  { value: 'in_effect', label: 'Em Vigor' },
                  { value: 'superseded', label: 'Revogada por Nova' },
                  { value: 'revoked', label: 'Revogada' },
                ]}
              />
            </FormField>
          </div>

          <FormField label="Título da Decisão" required>
            <TextInput
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Ex: Regulamentação de Acesso RLS e Segurança Multi-tenant"
              required
            />
          </FormField>

          <FormField label="Sumário Executivo do Ato" required>
            <TextArea
              value={summary}
              onChange={e => setSummary(e.target.value)}
              placeholder="Dispositivo resolutivo do ato normativo..."
              rows={2}
              required
            />
          </FormField>

          <FormField label="Fundamentação & Motivação (Rationale)" required>
            <TextArea
              value={rationale}
              onChange={e => setRationale(e.target.value)}
              placeholder="Motivos fáticos e de direito que justificam a deliberação..."
              rows={3}
              required
            />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Órgão Decisor / Autoridade">
              <TextInput
                value={decidedBy}
                onChange={e => setDecidedBy(e.target.value)}
                placeholder="Ex: Conselho Consultivo NettosCorp"
                required
              />
            </FormField>

            <FormField label="Vínculo com Deliberação CNS">
              <SelectInput
                value={cnsRefId}
                onChange={e => setCnsRefId(e.target.value)}
                options={[
                  { value: '', label: 'Sem vínculo prévio com CNS' },
                  ...deliberations.map(c => ({
                    value: c.id,
                    label: `${c.cns_code} · ${c.title.substring(0, 35)}...`,
                  })),
                ]}
              />
            </FormField>
          </div>

          <FormActions
            onCancel={() => setIsModalOpen(false)}
            submitLabel={editingDec ? 'Atualizar Decisão' : 'Publicar Registro DEC'}
          />
        </form>
      </Modal>
    </div>
  );
};
