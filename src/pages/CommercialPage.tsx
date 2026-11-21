/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { StatCard } from '../components/data/StatCard';
import { DataTable } from '../components/data/DataTable';
import { Modal } from '../components/forms/Modal';
import { FormField } from '../components/forms/FormField';
import { TextInput } from '../components/forms/TextInput';
import { SelectInput } from '../components/forms/SelectInput';
import { FormActions } from '../components/forms/FormActions';
import { DetailDrawer } from '../components/layout/DetailDrawer';
import { commercialService, LEAD_STAGES } from '../services/commercialService';
import { CommercialLead, CommercialContract, LeadStage } from '../types';
import {
  TrendingUp,
  DollarSign,
  FileText,
  Building,
  Plus,
  LayoutGrid,
  List,
  ChevronRight,
  ArrowRight,
  User,
  Calendar,
  ShieldCheck
} from 'lucide-react';

interface CommercialPageProps {
  onNavigate: (route: string) => void;
}

export const CommercialPage: React.FC<CommercialPageProps> = ({ onNavigate }) => {
  const [leads, setLeads] = useState<CommercialLead[]>(() => commercialService.getLeads());
  const [contracts, setContracts] = useState<CommercialContract[]>(() => commercialService.getContracts());
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [activeTab, setActiveTab] = useState<'leads' | 'contracts'>('leads');
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<CommercialLead | null>(null);

  // New Lead Form
  const [leadForm, setLeadForm] = useState({
    company_name: '',
    contact_person: '',
    contact_email: '',
    stage: 'new' as LeadStage,
    deal_value: '',
    expected_close_date: new Date().toISOString().split('T')[0],
    owner_name: 'Marcus Bastos',
    notes: '',
  });

  // New Contract Form
  const [contractForm, setContractForm] = useState({
    contract_number: `CTR-2026-00${contracts.length + 1}`,
    client_name: '',
    title: '',
    annual_value: '',
    status: 'active' as CommercialContract['status'],
    start_date: new Date().toISOString().split('T')[0],
    end_date: '2027-01-31',
    governing_law: 'Foro da Comarca de São Paulo/SP',
  });

  const refreshData = () => {
    setLeads(commercialService.getLeads());
    setContracts(commercialService.getContracts());
  };

  const handleCreateLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadForm.company_name || !leadForm.deal_value) return;

    commercialService.createLead({
      company_name: leadForm.company_name,
      contact_person: leadForm.contact_person,
      contact_email: leadForm.contact_email,
      stage: leadForm.stage,
      deal_value: Number(leadForm.deal_value),
      expected_close_date: leadForm.expected_close_date,
      owner_name: leadForm.owner_name,
      notes: leadForm.notes,
    });

    setIsLeadModalOpen(false);
    setLeadForm({
      company_name: '',
      contact_person: '',
      contact_email: '',
      stage: 'new',
      deal_value: '',
      expected_close_date: new Date().toISOString().split('T')[0],
      owner_name: 'Marcus Bastos',
      notes: '',
    });
    refreshData();
  };

  const handleCreateContract = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contractForm.client_name || !contractForm.annual_value) return;

    commercialService.createContract({
      contract_number: contractForm.contract_number,
      client_name: contractForm.client_name,
      title: contractForm.title,
      annual_value: Number(contractForm.annual_value),
      status: contractForm.status,
      start_date: contractForm.start_date,
      end_date: contractForm.end_date,
      governing_law: contractForm.governing_law,
    });

    setIsContractModalOpen(false);
    setContractForm({
      contract_number: `CTR-2026-00${contracts.length + 2}`,
      client_name: '',
      title: '',
      annual_value: '',
      status: 'active',
      start_date: new Date().toISOString().split('T')[0],
      end_date: '2027-01-31',
      governing_law: 'Foro da Comarca de São Paulo/SP',
    });
    refreshData();
  };

  const handleAdvanceStage = (lead: CommercialLead, targetStage: LeadStage) => {
    commercialService.updateLeadStage(lead.id, targetStage);
    refreshData();
    if (selectedLead && selectedLead.id === lead.id) {
      setSelectedLead({ ...selectedLead, stage: targetStage });
    }
  };

  const stats = commercialService.getPipelineStats();

  const leadTableColumns = [
    {
      key: 'company',
      header: 'Organização / Lead',
      render: (l: CommercialLead) => (
        <div>
          <span className="text-zinc-100 font-medium block">{l.company_name}</span>
          <span className="text-[11px] text-zinc-500 font-mono">
            {l.contact_person} ({l.contact_email})
          </span>
        </div>
      ),
    },
    {
      key: 'stage',
      header: 'Etapa no Funil',
      render: (l: CommercialLead) => {
        const stageInfo = LEAD_STAGES.find(s => s.stage === l.stage);
        return (
          <span className={`text-[11px] font-mono px-2 py-0.5 rounded border ${stageInfo?.color}`}>
            {stageInfo?.label || l.stage}
          </span>
        );
      },
    },
    {
      key: 'deal_value',
      header: 'Valor do Negócio',
      render: (l: CommercialLead) => (
        <span className="font-mono text-xs text-amber-400 font-medium">
          R$ {l.deal_value.toLocaleString('pt-BR')}
        </span>
      ),
    },
    {
      key: 'owner',
      header: 'Executivo Responsável',
      render: (l: CommercialLead) => (
        <span className="text-xs text-zinc-300">{l.owner_name}</span>
      ),
    },
    {
      key: 'expected_close',
      header: 'Fechamento Previsto',
      render: (l: CommercialLead) => (
        <span className="font-mono text-xs text-zinc-400">{l.expected_close_date}</span>
      ),
    },
    {
      key: 'actions',
      header: 'Ação',
      render: (l: CommercialLead) => (
        <button
          onClick={() => setSelectedLead(l)}
          className="text-xs text-amber-400 hover:text-amber-300 font-medium transition-colors"
        >
          Detalhes
        </button>
      ),
    },
  ];

  const contractTableColumns = [
    {
      key: 'number',
      header: 'Contrato',
      render: (c: CommercialContract) => (
        <div>
          <span className="font-mono text-xs text-amber-400 font-medium block">
            {c.contract_number}
          </span>
          <span className="text-xs text-zinc-100 font-medium">{c.client_name}</span>
        </div>
      ),
    },
    {
      key: 'title',
      header: 'Objeto / Escopo',
      render: (c: CommercialContract) => (
        <span className="text-xs text-zinc-300">{c.title}</span>
      ),
    },
    {
      key: 'value',
      header: 'ARR / Valor Anual',
      render: (c: CommercialContract) => (
        <span className="font-mono text-xs text-emerald-400 font-medium">
          R$ {c.annual_value.toLocaleString('pt-BR')}
        </span>
      ),
    },
    {
      key: 'dates',
      header: 'Vigência',
      render: (c: CommercialContract) => (
        <span className="font-mono text-xs text-zinc-400">
          {c.start_date} até {c.end_date}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (c: CommercialContract) => (
        <span className="text-[11px] font-mono text-zinc-300">
          {c.status === 'active' ? 'Ativo' : c.status === 'renewal_pending' ? 'Renovação Pendente' : c.status}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Comercial & Gestão de Contratos"
        subtitle="Funil de vendas B2B Enterprise, oportunidades ativas e gestão de contratos SaaS."
        primaryAction={{
          label: activeTab === 'leads' ? 'Novo Lead' : 'Novo Contrato',
          onClick: () => (activeTab === 'leads' ? setIsLeadModalOpen(true) : setIsContractModalOpen(true)),
          icon: Plus,
        }}
      />

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Pipeline Bruto"
          value={`R$ ${(stats.totalPipelineValue / 1000).toFixed(0)}k`}
          subtext={`${stats.totalLeads} oportunidades em negociação`}
          icon={TrendingUp}
        />
        <StatCard
          label="Pipeline Ponderado"
          value={`R$ ${(stats.weightedPipelineValue / 1000).toFixed(0)}k`}
          subtext="Probabilidade ajustada por etapa"
          icon={DollarSign}
        />
        <StatCard
          label="Contratos Ativos"
          value={stats.activeContractsCount}
          subtext="Clientes Enterprise com SLA vigente"
          icon={FileText}
        />
        <StatCard
          label="ARR Sob Gestão"
          value={`R$ ${(stats.activeContractsARR / 1000).toFixed(0)}k`}
          subtext="Receita Recorrente Anual ativa"
          icon={ShieldCheck}
        />
      </div>

      {/* Tabs & View Mode Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('leads')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'leads'
                ? 'bg-zinc-800 text-zinc-100 shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Funil de Vendas ({leads.length})
          </button>
          <button
            onClick={() => setActiveTab('contracts')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'contracts'
                ? 'bg-zinc-800 text-zinc-100 shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Contratos Corporativos ({contracts.length})
          </button>
        </div>

        {activeTab === 'leads' && (
          <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 p-0.5 rounded-md self-start sm:self-auto">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded transition-colors ${
                viewMode === 'kanban'
                  ? 'bg-zinc-800 text-zinc-100'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
              title="Visualização em Quadro Kanban"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded transition-colors ${
                viewMode === 'table'
                  ? 'bg-zinc-800 text-zinc-100'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
              title="Visualização em Tabela"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      {activeTab === 'leads' ? (
        viewMode === 'kanban' ? (
          /* Kanban Board */
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3 overflow-x-auto pb-4">
            {LEAD_STAGES.filter(s => s.stage !== 'lost').map(stageObj => {
              const stageLeads = leads.filter(l => l.stage === stageObj.stage);
              const columnSum = stageLeads.reduce((acc, l) => acc + l.deal_value, 0);

              return (
                <div
                  key={stageObj.stage}
                  className="bg-zinc-900/80 border border-zinc-800 rounded-lg flex flex-col min-w-[210px] max-h-[680px]"
                >
                  {/* Column Header */}
                  <div className="p-3 border-b border-zinc-800 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold text-zinc-200 block truncate">
                        {stageObj.label}
                      </span>
                      <span className="text-[10px] font-mono text-zinc-500">
                        R$ {(columnSum / 1000).toFixed(0)}k ({stageLeads.length})
                      </span>
                    </div>
                  </div>

                  {/* Cards container */}
                  <div className="p-2 space-y-2 flex-1 overflow-y-auto">
                    {stageLeads.length === 0 ? (
                      <div className="py-8 text-center text-[11px] text-zinc-600 font-mono">
                        Vazio
                      </div>
                    ) : (
                      stageLeads.map(lead => (
                        <div
                          key={lead.id}
                          className="bg-zinc-950 border border-zinc-800 hover:border-zinc-700 p-3 rounded text-left transition-colors cursor-pointer group"
                          onClick={() => setSelectedLead(lead)}
                        >
                          <div className="flex items-start justify-between gap-2 mb-1.5">
                            <span className="text-xs font-semibold text-zinc-100 truncate group-hover:text-amber-300 transition-colors">
                              {lead.company_name}
                            </span>
                          </div>

                          <div className="text-[11px] font-mono text-amber-400 font-medium mb-2">
                            R$ {lead.deal_value.toLocaleString('pt-BR')}
                          </div>

                          <div className="text-[10px] text-zinc-500 font-mono flex items-center justify-between">
                            <span>{lead.owner_name}</span>
                            <span>{lead.expected_close_date.slice(5)}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <DataTable
            columns={leadTableColumns}
            data={leads}
            keyExtractor={l => l.id}
            emptyMessage="Nenhum lead encontrado."
          />
        )
      ) : (
        <DataTable
          columns={contractTableColumns}
          data={contracts}
          keyExtractor={c => c.id}
          emptyMessage="Nenhum contrato corporativo registrado."
        />
      )}

      {/* Drawer: Lead Details & Stage Advancement */}
      <DetailDrawer
        isOpen={Boolean(selectedLead)}
        onClose={() => setSelectedLead(null)}
        title={selectedLead?.company_name || 'Detalhes do Lead'}
        subtitle={`Contato: ${selectedLead?.contact_person} (${selectedLead?.contact_email})`}
      >
        {selectedLead && (
          <div className="space-y-6">
            <div className="bg-zinc-950 p-4 rounded-lg border border-zinc-800 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400">Valor Estimado</span>
                <span className="text-amber-400 font-mono font-semibold text-sm">
                  R$ {selectedLead.deal_value.toLocaleString('pt-BR')}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400">Etapa Atual</span>
                <span className="text-zinc-200 font-mono capitalize">{selectedLead.stage}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400">Executivo de Contas</span>
                <span className="text-zinc-200">{selectedLead.owner_name}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400">Previsão de Conclusão</span>
                <span className="text-zinc-200 font-mono">{selectedLead.expected_close_date}</span>
              </div>
            </div>

            {/* Advance Stage Control */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-zinc-300 block uppercase tracking-wider">
                Mover de Etapa no Pipeline
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {LEAD_STAGES.map(s => (
                  <button
                    key={s.stage}
                    onClick={() => handleAdvanceStage(selectedLead, s.stage)}
                    className={`px-2.5 py-1.5 text-xs rounded border transition-colors ${
                      selectedLead.stage === s.stage
                        ? 'bg-amber-400/20 text-amber-300 border-amber-400/40 font-semibold'
                        : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-zinc-200 hover:bg-zinc-800'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-zinc-300 block uppercase tracking-wider">
                Anotações de Diagnóstico
              </span>
              <div className="p-3 bg-zinc-950 rounded border border-zinc-800 text-xs text-zinc-300 leading-relaxed font-mono">
                {selectedLead.notes || 'Nenhuma anotação adicional registrada.'}
              </div>
            </div>
          </div>
        )}
      </DetailDrawer>

      {/* Modal: New Lead */}
      <Modal
        isOpen={isLeadModalOpen}
        onClose={() => setIsLeadModalOpen(false)}
        title="Cadastrar Nova Oportunidade Comercial"
        subtitle="Adicione uma empresa ao funil para orquestração de propostas e POCs."
      >
        <form onSubmit={handleCreateLead} className="space-y-4">
          <FormField label="Nome da Empresa / Cliente" required>
            <TextInput
              value={leadForm.company_name}
              onChange={e => setLeadForm({ ...leadForm, company_name: e.target.value })}
              placeholder="Ex: Grupo Vanguarda Logística"
              required
            />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Pessoa de Contato" required>
              <TextInput
                value={leadForm.contact_person}
                onChange={e => setLeadForm({ ...leadForm, contact_person: e.target.value })}
                placeholder="Ex: Carlos Drummond"
                required
              />
            </FormField>

            <FormField label="E-mail Corporativo" required>
              <TextInput
                type="email"
                value={leadForm.contact_email}
                onChange={e => setLeadForm({ ...leadForm, contact_email: e.target.value })}
                placeholder="carlos@empresa.com"
                required
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Valor Estimado (BRL)" required>
              <TextInput
                type="number"
                value={leadForm.deal_value}
                onChange={e => setLeadForm({ ...leadForm, deal_value: e.target.value })}
                placeholder="Ex: 250000"
                required
              />
            </FormField>

            <FormField label="Etapa Inicial" required>
              <SelectInput
                value={leadForm.stage}
                onChange={e => setLeadForm({ ...leadForm, stage: e.target.value as LeadStage })}
                options={LEAD_STAGES.map(s => ({ value: s.stage, label: s.label }))}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Previsão de Fechamento" required>
              <TextInput
                type="date"
                value={leadForm.expected_close_date}
                onChange={e => setLeadForm({ ...leadForm, expected_close_date: e.target.value })}
                required
              />
            </FormField>

            <FormField label="Executivo Responsável" required>
              <TextInput
                value={leadForm.owner_name}
                onChange={e => setLeadForm({ ...leadForm, owner_name: e.target.value })}
                required
              />
            </FormField>
          </div>

          <FormField label="Anotações & Contexto">
            <TextInput
              value={leadForm.notes}
              onChange={e => setLeadForm({ ...leadForm, notes: e.target.value })}
              placeholder="Ex: Interesse em agentes de atendimento hospitalar e conformidade CNS"
            />
          </FormField>

          <FormActions
            onCancel={() => setIsLeadModalOpen(false)}
            submitLabel="Registrar Oportunidade"
          />
        </form>
      </Modal>

      {/* Modal: New Contract */}
      <Modal
        isOpen={isContractModalOpen}
        onClose={() => setIsContractModalOpen(false)}
        title="Formalizar Novo Contrato Enterprise"
        subtitle="Registre os termos pactuados, foro de regência e valor anual recorrente (ARR)."
      >
        <form onSubmit={handleCreateContract} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Número do Contrato" required>
              <TextInput
                value={contractForm.contract_number}
                onChange={e => setContractForm({ ...contractForm, contract_number: e.target.value })}
                required
              />
            </FormField>

            <FormField label="Cliente Contratante" required>
              <TextInput
                value={contractForm.client_name}
                onChange={e => setContractForm({ ...contractForm, client_name: e.target.value })}
                placeholder="Ex: Banco Safira S.A."
                required
              />
            </FormField>
          </div>

          <FormField label="Objeto / Título do Contrato" required>
            <TextInput
              value={contractForm.title}
              onChange={e => setContractForm({ ...contractForm, title: e.target.value })}
              placeholder="Ex: Licenciamento de Agentes Autônomos de Crédito"
              required
            />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Valor Anual (ARR em BRL)" required>
              <TextInput
                type="number"
                value={contractForm.annual_value}
                onChange={e => setContractForm({ ...contractForm, annual_value: e.target.value })}
                placeholder="Ex: 180000"
                required
              />
            </FormField>

            <FormField label="Foro Regulador" required>
              <TextInput
                value={contractForm.governing_law}
                onChange={e => setContractForm({ ...contractForm, governing_law: e.target.value })}
                placeholder="Ex: Foro da Comarca de São Paulo/SP"
                required
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Data de Início" required>
              <TextInput
                type="date"
                value={contractForm.start_date}
                onChange={e => setContractForm({ ...contractForm, start_date: e.target.value })}
                required
              />
            </FormField>

            <FormField label="Data de Término" required>
              <TextInput
                type="date"
                value={contractForm.end_date}
                onChange={e => setContractForm({ ...contractForm, end_date: e.target.value })}
                required
              />
            </FormField>
          </div>

          <FormActions
            onCancel={() => setIsContractModalOpen(false)}
            submitLabel="Formalizar Contrato"
          />
        </form>
      </Modal>
    </div>
  );
};
