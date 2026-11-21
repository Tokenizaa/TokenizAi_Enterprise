/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { governanceService } from '../services/governanceService';
import { localStore } from '../services/supabaseClient';
import { GovernanceDocument, DocumentType } from '../types';
import { PageHeader } from '../components/layout/PageHeader';
import { DocumentCard } from '../components/governance/DocumentCard';
import { SearchInput } from '../components/data/SearchInput';
import { FilterBar } from '../components/data/FilterBar';
import { EmptyState } from '../components/data/EmptyState';
import { Modal } from '../components/forms/Modal';
import { FormField } from '../components/forms/FormField';
import { TextInput } from '../components/forms/TextInput';
import { SelectInput } from '../components/forms/SelectInput';
import { TextArea } from '../components/forms/TextArea';
import { FormActions } from '../components/forms/FormActions';
import { FileText, Plus, ExternalLink, Download, Hash } from 'lucide-react';

interface DocumentsPageProps {
  onNavigate: (route: string) => void;
}

export const DocumentsPage: React.FC<DocumentsPageProps> = ({ onNavigate }) => {
  const [documents, setDocuments] = useState<GovernanceDocument[]>(governanceService.getDocuments());
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  // Preview Modal
  const [previewDoc, setPreviewDoc] = useState<GovernanceDocument | null>(null);

  // Register Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [docCode, setDocCode] = useState('');
  const [title, setTitle] = useState('');
  const [docType, setDocType] = useState<DocumentType>('DELIB');
  const [version, setVersion] = useState('1.0');
  const [cnsRef, setCnsRef] = useState('');
  const [decRef, setDecRef] = useState('');
  const [delibRef, setDelibRef] = useState('');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    const handleUpdate = () => {
      setDocuments(governanceService.getDocuments());
    };
    return localStore.subscribe(handleUpdate);
  }, []);

  const openCreateModal = () => {
    setDocCode(`DELIB-2026-${String(documents.length + 1).padStart(3, '0')}`);
    setTitle('');
    setDocType('DELIB');
    setVersion('1.0');
    setCnsRef('CNS-2026-001');
    setDecRef('DEC-2026-001');
    setDelibRef(`DELIB-2026-${String(documents.length + 1).padStart(3, '0')}`);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !docCode.trim()) {
      setFormError('Código e título do documento são obrigatórios.');
      return;
    }

    governanceService.createDocument({
      doc_code: docCode,
      title,
      doc_type: docType,
      version,
      status: 'published',
      file_url: `/documents/${docCode}.pdf`,
      file_size_bytes: Math.floor(250000 + Math.random() * 500000),
      cns_ref: cnsRef || undefined,
      dec_ref: decRef || undefined,
      delib_ref: delibRef || undefined,
      metadata: { classification: 'Corporativo', indexed_at: new Date().toISOString() },
    });

    setIsModalOpen(false);
  };

  const filteredDocs = documents.filter(doc => {
    const matchesSearch =
      doc.title.toLowerCase().includes(search.toLowerCase()) ||
      doc.doc_code.toLowerCase().includes(search.toLowerCase()) ||
      (doc.cns_ref && doc.cns_ref.toLowerCase().includes(search.toLowerCase())) ||
      (doc.dec_ref && doc.dec_ref.toLowerCase().includes(search.toLowerCase())) ||
      (doc.delib_ref && doc.delib_ref.toLowerCase().includes(search.toLowerCase()));

    const matchesType = typeFilter === 'all' || doc.doc_type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        kicker="Custódia Digital"
        title="Documentação Institucional"
        description="Repositório central de atas integrais (DELIB), atos de diretoria (DEC), relatórios de auditoria e políticas de compliance."
        actions={
          <button
            onClick={openCreateModal}
            className="px-3.5 py-2 text-xs font-semibold text-zinc-950 bg-amber-400 hover:bg-amber-300 rounded transition-colors flex items-center gap-1.5 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Registrar Documento</span>
          </button>
        }
      />

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <FilterBar
          options={[
            { id: 'all', label: 'Todos', count: documents.length },
            { id: 'DELIB', label: 'DELIB (Atas)', count: documents.filter(d => d.doc_type === 'DELIB').length },
            { id: 'DEC', label: 'DEC (Decretos)', count: documents.filter(d => d.doc_type === 'DEC').length },
            { id: 'POLICY', label: 'Políticas', count: documents.filter(d => d.doc_type === 'POLICY').length },
          ]}
          activeId={typeFilter}
          onChange={setTypeFilter}
        />

        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Buscar por título, DELIB, CNS ou DEC..."
          className="w-full sm:w-72"
        />
      </div>

      {filteredDocs.length === 0 ? (
        <EmptyState
          title="Nenhum documento localizado"
          description="Indexe atas integrais ou instrumentos normativos para assegurar a custódia institucional."
          actionLabel="Registrar Primeiro Documento"
          onAction={openCreateModal}
          icon={FileText}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDocs.map(doc => (
            <DocumentCard
              key={doc.id}
              document={doc}
              onPreview={d => setPreviewDoc(d)}
              onNavigateCrossref={ref => {
                setSearch(ref);
              }}
            />
          ))}
        </div>
      )}

      {/* Preview Modal */}
      {previewDoc && (
        <Modal
          isOpen={Boolean(previewDoc)}
          onClose={() => setPreviewDoc(null)}
          title={`Documento: ${previewDoc.doc_code}`}
          description={previewDoc.title}
          maxWidth="lg"
        >
          <div className="space-y-4">
            <div className="p-4 bg-zinc-950 rounded border border-zinc-800 space-y-2 text-xs font-mono">
              <div className="flex justify-between border-b border-zinc-800/80 pb-2">
                <span className="text-zinc-500">Tipo Documental:</span>
                <span className="text-amber-400 font-bold">{previewDoc.doc_type}</span>
              </div>
              <div className="flex justify-between border-b border-zinc-800/80 pb-2">
                <span className="text-zinc-500">Versão Homologada:</span>
                <span className="text-zinc-200">v{previewDoc.version}</span>
              </div>
              <div className="flex justify-between border-b border-zinc-800/80 pb-2">
                <span className="text-zinc-500">Data de Publicação:</span>
                <span className="text-zinc-200">{new Date(previewDoc.created_at).toLocaleDateString('pt-BR')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Autor / Emissor:</span>
                <span className="text-zinc-200">{previewDoc.author_name || 'Conselho'}</span>
              </div>
            </div>

            {/* Cross-reference Details */}
            <div className="p-3 bg-zinc-900 rounded border border-zinc-800 text-xs space-y-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 block mb-1">
                Grafo de Vinculação Regimental
              </span>
              <div className="flex items-center gap-2">
                <span className="text-zinc-500">Deliberação do Conselho:</span>
                <span className="text-sky-400 font-mono font-medium">{previewDoc.cns_ref || 'Não referenciada'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-zinc-500">Decreto Institucional:</span>
                <span className="text-amber-400 font-mono font-medium">{previewDoc.dec_ref || 'Não referenciado'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-zinc-500">Identificador DELIB:</span>
                <span className="text-emerald-400 font-mono font-medium">{previewDoc.delib_ref || previewDoc.doc_code}</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="px-4 py-2 text-xs font-medium text-zinc-300 hover:text-zinc-100 bg-zinc-800 rounded transition-colors"
              >
                Fechar Visualizador
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal Register */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Registrar Novo Documento Institucional"
        description="Indexação de ata, instrumento normativo ou parecer formal."
        maxWidth="lg"
      >
        <form onSubmit={handleSave} className="space-y-4">
          {formError && (
            <p className="text-xs text-rose-400 bg-rose-950/40 p-2.5 rounded border border-rose-800/40">
              {formError}
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormField label="Código do Documento" required helperText="Ex: DELIB-2026-005">
              <TextInput
                value={docCode}
                onChange={e => setDocCode(e.target.value.toUpperCase())}
                placeholder="DOC-XXX"
                required
              />
            </FormField>

            <FormField label="Tipo Documental">
              <SelectInput
                value={docType}
                onChange={e => setDocType(e.target.value as DocumentType)}
                options={[
                  { value: 'DELIB', label: 'DELIB (Ata Integral)' },
                  { value: 'DEC', label: 'DEC (Decreto)' },
                  { value: 'CNS', label: 'CNS (Deliberação)' },
                  { value: 'POLICY', label: 'Política / Norma' },
                  { value: 'REPORT', label: 'Relatório Técnico' },
                ]}
              />
            </FormField>

            <FormField label="Versão">
              <TextInput
                value={version}
                onChange={e => setVersion(e.target.value)}
                placeholder="1.0"
              />
            </FormField>
          </div>

          <FormField label="Título do Documento" required>
            <TextInput
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Ex: Ata Integral da Sessão Colegiada de IA"
              required
            />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormField label="Vínculo CNS">
              <TextInput
                value={cnsRef}
                onChange={e => setCnsRef(e.target.value.toUpperCase())}
                placeholder="CNS-2026-XXX"
              />
            </FormField>

            <FormField label="Vínculo DEC">
              <TextInput
                value={decRef}
                onChange={e => setDecRef(e.target.value.toUpperCase())}
                placeholder="DEC-2026-XXX"
              />
            </FormField>

            <FormField label="Referência DELIB">
              <TextInput
                value={delibRef}
                onChange={e => setDelibRef(e.target.value.toUpperCase())}
                placeholder="DELIB-2026-XXX"
              />
            </FormField>
          </div>

          <FormActions
            onCancel={() => setIsModalOpen(false)}
            submitLabel="Indexar Documento"
          />
        </form>
      </Modal>
    </div>
  );
};
