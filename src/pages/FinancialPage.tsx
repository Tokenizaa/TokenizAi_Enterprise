/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { StatCard } from '../components/data/StatCard';
import { DataTable } from '../components/data/DataTable';
import { FilterBar } from '../components/data/FilterBar';
import { Modal } from '../components/forms/Modal';
import { FormField } from '../components/forms/FormField';
import { TextInput } from '../components/forms/TextInput';
import { SelectInput } from '../components/forms/SelectInput';
import { FormActions } from '../components/forms/FormActions';
import { financialService } from '../services/financialService';
import { FinancialTransaction } from '../types';
import {
  DollarSign,
  TrendingDown,
  TrendingUp,
  Cpu,
  Plus,
  AlertCircle,
  Building,
  Layers,
  Calendar
} from 'lucide-react';

interface FinancialPageProps {
  onNavigate: (route: string) => void;
}

export const FinancialPage: React.FC<FinancialPageProps> = ({ onNavigate }) => {
  const [transactions, setTransactions] = useState<FinancialTransaction[]>(() => financialService.getTransactions());
  const [selectedType, setSelectedType] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Transaction Form
  const [formData, setFormData] = useState({
    description: '',
    type: 'expense' as FinancialTransaction['type'],
    category: 'Infraestrutura Cloud & IA' as FinancialTransaction['category'],
    amount: '',
    cost_center: 'CC-TECNOLOGIA',
    status: 'settled' as FinancialTransaction['status'],
    date: new Date().toISOString().split('T')[0],
  });

  const refreshData = () => {
    setTransactions(financialService.getTransactions());
  };

  const handleCreateTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description || !formData.amount) return;

    financialService.createTransaction({
      description: formData.description,
      type: formData.type,
      category: formData.category,
      amount: Math.abs(Number(formData.amount)),
      cost_center: formData.cost_center,
      status: formData.status,
      date: formData.date,
    });

    setIsModalOpen(false);
    setFormData({
      description: '',
      type: 'expense',
      category: 'Infraestrutura Cloud & IA',
      amount: '',
      cost_center: 'CC-TECNOLOGIA',
      status: 'settled',
      date: new Date().toISOString().split('T')[0],
    });
    refreshData();
  };

  const metrics = financialService.getSummaryMetrics();
  const departmentBudgets = financialService.getDepartmentBudgets();

  const filteredTransactions = transactions.filter(t => {
    if (selectedType !== 'all' && t.type !== selectedType) return false;
    if (selectedCategory !== 'all' && t.category !== selectedCategory) return false;
    return true;
  });

  const columns = [
    {
      key: 'date',
      header: 'Data',
      render: (t: FinancialTransaction) => (
        <span className="font-mono text-xs text-zinc-400">{t.date}</span>
      ),
    },
    {
      key: 'description',
      header: 'Descrição da Movimentação',
      render: (t: FinancialTransaction) => (
        <div>
          <span className="text-zinc-100 font-medium block">{t.description}</span>
          <span className="text-[11px] text-zinc-500 font-mono">{t.cost_center}</span>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Categoria Contábil',
      render: (t: FinancialTransaction) => (
        <span className="text-xs text-zinc-300">{t.category}</span>
      ),
    },
    {
      key: 'amount',
      header: 'Valor (BRL)',
      render: (t: FinancialTransaction) => {
        const isRev = t.type === 'revenue';
        return (
          <span
            className={`font-mono font-medium text-xs ${
              isRev ? 'text-emerald-400' : 'text-zinc-200'
            }`}
          >
            {isRev ? '+' : '-'} R$ {t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
        );
      },
    },
    {
      key: 'status',
      header: 'Situação',
      render: (t: FinancialTransaction) => (
        <span className="text-[11px] font-mono text-zinc-400">
          {t.status === 'settled' ? 'Liquidado' : t.status === 'pending' ? 'Pendente' : 'Projetado'}
        </span>
      ),
    },
    {
      key: 'is_demo',
      header: 'Origem',
      render: () => (
        <span className="text-[10px] font-mono text-amber-400/90 bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/20">
          DEMO
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestão Financeira & Custos de IA"
        subtitle="Controle orçamentário por centro de custo, movimentações de caixa e monitoramento de GPUs."
        primaryAction={{
          label: 'Lançar Transação',
          onClick: () => setIsModalOpen(true),
          icon: Plus,
        }}
      />

      {/* Prominent DEMO Notice Required by Brief */}
      <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-200/90 leading-relaxed">
          <strong className="font-semibold text-amber-300 block mb-0.5">
            MODO DEMONSTRATIVO ATIVO (DEMO DATA)
          </strong>
          Este ambiente apresenta movimentações simuladas para aferição de painéis, centros de custo e custos de inferência de IA. Nenhuma integração com banco emissor ou ERP transacional real está ativa.
        </div>
      </div>

      {/* Financial Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Receita Operacional"
          value={`R$ ${metrics.totalRevenue.toLocaleString('pt-BR')}`}
          subtext="Contratos SaaS & Consultoria"
          icon={TrendingUp}
        />
        <StatCard
          label="Despesas Totais"
          value={`R$ ${metrics.totalExpense.toLocaleString('pt-BR')}`}
          subtext="Folha, infra e auditoria"
          icon={TrendingDown}
        />
        <StatCard
          label="Custos de Nuvem & IA"
          value={`R$ ${metrics.cloudAIExpense.toLocaleString('pt-BR')}`}
          subtext="Invocação de modelos e GPUs"
          icon={Cpu}
        />
        <StatCard
          label="Saldo de Caixa Líquido"
          value={`R$ ${metrics.netCashFlow.toLocaleString('pt-BR')}`}
          subtext={metrics.netCashFlow >= 0 ? 'Resultado superavitário' : 'Déficit no exercício corrente'}
          icon={DollarSign}
        />
      </div>

      {/* Department Budget Breakdown */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-zinc-100">
              Execução Orçamentária por Departamento (2026)
            </h3>
            <p className="text-xs text-zinc-500 font-mono mt-0.5">
              Consumo versus dotação orçamentária aprovada
            </p>
          </div>
          <span className="text-xs font-mono text-zinc-400">
            Execução Global: {metrics.budgetExecutionPercent}%
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {departmentBudgets.map(b => {
            const pct = Math.round((b.consumed_budget / b.allocated_budget) * 100);
            return (
              <div key={b.id} className="bg-zinc-950 p-4 rounded-lg border border-zinc-800 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-zinc-200">{b.department_name}</span>
                  <span className="font-mono text-amber-400 font-medium">{pct}%</span>
                </div>

                <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500">
                  <span>Consumido: R$ {(b.consumed_budget / 1000).toFixed(0)}k</span>
                  <span>Teto: R$ {(b.allocated_budget / 1000).toFixed(0)}k</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Transactions Table */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-zinc-100">
            Extrato de Movimentações Contábeis (DEMO)
          </h3>
          <FilterBar
            filters={[
              {
                key: 'type',
                label: 'Natureza',
                options: [
                  { value: 'all', label: 'Todas as Entradas/Saídas' },
                  { value: 'revenue', label: 'Receitas' },
                  { value: 'expense', label: 'Despesas' },
                ],
                value: selectedType,
                onChange: setSelectedType,
              },
              {
                key: 'category',
                label: 'Categoria',
                options: [
                  { value: 'all', label: 'Todas as Categorias' },
                  { value: 'Infraestrutura Cloud & IA', label: 'Cloud & IA' },
                  { value: 'Folha & Honorários', label: 'Folha & Honorários' },
                  { value: 'Receita Recorrente SaaS', label: 'Receita SaaS' },
                  { value: 'Contratos Consultivos', label: 'Consultoria' },
                  { value: 'Serviços Corporativos', label: 'Serviços Corporativos' },
                ],
                value: selectedCategory,
                onChange: setSelectedCategory,
              },
            ]}
            onReset={() => {
              setSelectedType('all');
              setSelectedCategory('all');
            }}
            hasActiveFilters={selectedType !== 'all' || selectedCategory !== 'all'}
          />
        </div>

        <DataTable
          columns={columns}
          data={filteredTransactions}
          keyExtractor={t => t.id}
          emptyMessage="Nenhuma movimentação financeira encontrada com os filtros selecionados."
        />
      </div>

      {/* Modal: New Transaction */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Lançar Transação Financeira (Simulação DEMO)"
        subtitle="Cadastre uma receita ou despesa para atualizar o fluxo de caixa simulado."
      >
        <form onSubmit={handleCreateTransaction} className="space-y-4">
          <FormField label="Descrição da Transação" required>
            <TextInput
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              placeholder="Ex: Aquisição de licença de inferência DeepSeek"
              required
            />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Natureza" required>
              <SelectInput
                value={formData.type}
                onChange={e => setFormData({ ...formData, type: e.target.value as FinancialTransaction['type'] })}
                options={[
                  { value: 'expense', label: 'Despesa (Saída)' },
                  { value: 'revenue', label: 'Receita (Entrada)' },
                ]}
              />
            </FormField>

            <FormField label="Valor (BRL)" required>
              <TextInput
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={e => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0.00"
                required
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Categoria Contábil" required>
              <SelectInput
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value as FinancialTransaction['category'] })}
                options={[
                  { value: 'Infraestrutura Cloud & IA', label: 'Infraestrutura Cloud & IA' },
                  { value: 'Folha & Honorários', label: 'Folha & Honorários' },
                  { value: 'Serviços Corporativos', label: 'Serviços Corporativos' },
                  { value: 'Receita Recorrente SaaS', label: 'Receita Recorrente SaaS' },
                  { value: 'Contratos Consultivos', label: 'Contratos Consultivos' },
                ]}
              />
            </FormField>

            <FormField label="Centro de Custo" required>
              <SelectInput
                value={formData.cost_center}
                onChange={e => setFormData({ ...formData, cost_center: e.target.value })}
                options={[
                  { value: 'CC-TECNOLOGIA', label: 'CC-TECNOLOGIA (Tecnologia & IA)' },
                  { value: 'CC-CORPORATIVO', label: 'CC-CORPORATIVO (Diretoria)' },
                  { value: 'CC-GOVERNANCA', label: 'CC-GOVERNANCA (Governança & Risco)' },
                  { value: 'CC-COMERCIAL', label: 'CC-COMERCIAL (Vendas & Clientes)' },
                ]}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Data do Lançamento" required>
              <TextInput
                type="date"
                value={formData.date}
                onChange={e => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </FormField>

            <FormField label="Situação">
              <SelectInput
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value as FinancialTransaction['status'] })}
                options={[
                  { value: 'settled', label: 'Liquidado' },
                  { value: 'pending', label: 'Pendente' },
                  { value: 'projected', label: 'Projetado' },
                ]}
              />
            </FormField>
          </div>

          <FormActions
            onCancel={() => setIsModalOpen(false)}
            submitLabel="Confirmar Lançamento DEMO"
          />
        </form>
      </Modal>
    </div>
  );
};
