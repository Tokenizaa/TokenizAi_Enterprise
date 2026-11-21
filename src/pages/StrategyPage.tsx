/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { StatCard } from '../components/data/StatCard';
import { FilterBar } from '../components/data/FilterBar';
import { Modal } from '../components/forms/Modal';
import { FormField } from '../components/forms/FormField';
import { TextInput } from '../components/forms/TextInput';
import { SelectInput } from '../components/forms/SelectInput';
import { FormActions } from '../components/forms/FormActions';
import { DetailDrawer } from '../components/layout/DetailDrawer';
import { strategyService } from '../services/strategyService';
import { StrategicObjective, KeyResult } from '../types';
import {
  Compass,
  Plus,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  Target,
  User,
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';

interface StrategyPageProps {
  onNavigate: (route: string) => void;
}

export const StrategyPage: React.FC<StrategyPageProps> = ({ onNavigate }) => {
  const [objectives, setObjectives] = useState<StrategicObjective[]>(() => strategyService.getObjectives());
  const [selectedPillar, setSelectedPillar] = useState('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedObjective, setSelectedObjective] = useState<StrategicObjective | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // KR update state inside drawer
  const [updatingKrId, setUpdatingKrId] = useState<string | null>(null);
  const [newKrCurrentVal, setNewKrCurrentVal] = useState<number>(0);

  // New Objective Form
  const [formData, setFormData] = useState({
    code: `OBJ-2026-0${objectives.length + 1}`,
    title: '',
    pillar: 'Inteligência Artificial & Automação' as StrategicObjective['pillar'],
    target_year: 2026,
    owner_name: 'Dr. Orlando Netto',
    status: 'on_track' as StrategicObjective['status'],
  });

  const refreshData = () => {
    setObjectives(strategyService.getObjectives());
  };

  const handleCreateObjective = (e: React.FormEvent) => {
    e.preventDefault();
    strategyService.createObjective({
      code: formData.code,
      title: formData.title,
      pillar: formData.pillar,
      target_year: Number(formData.target_year),
      owner_name: formData.owner_name,
      status: formData.status,
    });
    setIsCreateModalOpen(false);
    setFormData({
      code: `OBJ-2026-0${objectives.length + 2}`,
      title: '',
      pillar: 'Inteligência Artificial & Automação',
      target_year: 2026,
      owner_name: 'Dr. Orlando Netto',
      status: 'on_track',
    });
    refreshData();
  };

  const handleUpdateKr = (krId: string) => {
    strategyService.updateKeyResultProgress(krId, newKrCurrentVal);
    setUpdatingKrId(null);
    refreshData();
    if (selectedObjective) {
      setSelectedObjective(strategyService.getObjectiveById(selectedObjective.id) || null);
    }
  };

  // Metrics
  const totalObjectives = objectives.length;
  const avgProgress = totalObjectives > 0
    ? Math.round(objectives.reduce((sum, o) => sum + o.progress_percent, 0) / totalObjectives)
    : 0;
  const allKrs = strategyService.getKeyResults();
  const onTrackCount = objectives.filter(o => o.status === 'on_track' || o.status === 'achieved').length;

  const filteredObjectives = objectives.filter(o => {
    if (selectedPillar === 'all') return true;
    return o.pillar === selectedPillar;
  });

  const getStatusBadge = (status: StrategicObjective['status']) => {
    switch (status) {
      case 'on_track':
        return <span className="text-[11px] font-mono text-emerald-400">Em Dia</span>;
      case 'achieved':
        return <span className="text-[11px] font-mono text-cyan-400">Alcançado</span>;
      case 'at_risk':
        return <span className="text-[11px] font-mono text-amber-400">Em Risco</span>;
      case 'behind':
        return <span className="text-[11px] font-mono text-rose-400">Atrasado</span>;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Estratégia Empresarial & OKRs"
        subtitle="Pilares corporativos, metas de longo prazo e acompanhamento de Key Results para 2026."
        primaryAction={{
          label: 'Novo Objetivo',
          onClick: () => setIsCreateModalOpen(true),
          icon: Plus,
        }}
      />

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Objetivos Estratégicos"
          value={totalObjectives}
          subtext="Pilares 2026 mapeados"
          icon={Compass}
        />
        <StatCard
          label="Progresso Médio"
          value={`${avgProgress}%`}
          subtext="Execução consolidada"
          icon={TrendingUp}
        />
        <StatCard
          label="Key Results (KRs)"
          value={allKrs.length}
          subtext="Métricas quantitativas ativas"
          icon={Target}
        />
        <StatCard
          label="Saúde Estratégica"
          value={`${Math.round((onTrackCount / Math.max(1, totalObjectives)) * 100)}%`}
          subtext={`${onTrackCount} de ${totalObjectives} metas no prazo`}
          icon={CheckCircle2}
        />
      </div>

      {/* Filter by Pillar */}
      <FilterBar
        filters={[
          {
            key: 'pillar',
            label: 'Pilar Corporativo',
            options: [
              { value: 'all', label: 'Todos os Pilares' },
              { value: 'Inteligência Artificial & Automação', label: 'IA & Automação' },
              { value: 'Governança & Risco', label: 'Governança & Risco' },
              { value: 'Crescimento', label: 'Crescimento' },
              { value: 'Excelência Operacional', label: 'Excelência Operacional' },
            ],
            value: selectedPillar,
            onChange: setSelectedPillar,
          },
        ]}
        onReset={() => setSelectedPillar('all')}
        hasActiveFilters={selectedPillar !== 'all'}
      />

      {/* Objectives Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredObjectives.map(obj => {
          const krs = strategyService.getKeyResults(obj.id);
          return (
            <div
              key={obj.id}
              className="bg-zinc-900 border border-zinc-800 rounded-lg p-5 flex flex-col justify-between hover:border-zinc-700 transition-colors"
            >
              <div>
                {/* Header info */}
                <div className="flex items-center justify-between text-xs text-zinc-500 mb-2 font-mono">
                  <span>{obj.code} · {obj.target_year}</span>
                  <div className="flex items-center gap-2">
                    <span>{obj.pillar}</span>
                    <span>·</span>
                    {getStatusBadge(obj.status)}
                  </div>
                </div>

                <h3 className="text-sm font-semibold text-zinc-100 mb-3">{obj.title}</h3>

                {/* Progress bar */}
                <div className="space-y-1.5 mb-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-400">Progresso Consolidado</span>
                    <span className="font-mono font-medium text-amber-400">{obj.progress_percent}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400 transition-all duration-300 rounded-full"
                      style={{ width: `${obj.progress_percent}%` }}
                    />
                  </div>
                </div>

                {/* KRs preview */}
                <div className="space-y-2 border-t border-zinc-800/80 pt-3">
                  <span className="text-[11px] font-mono uppercase text-zinc-500 block">
                    Key Results Vinculados ({krs.length})
                  </span>
                  {krs.slice(0, 2).map(kr => (
                    <div key={kr.id} className="text-xs bg-zinc-950 p-2.5 rounded border border-zinc-800/60">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-zinc-200 truncate">{kr.title}</span>
                        <span className="font-mono text-zinc-400 shrink-0 text-[11px]">
                          {kr.current} / {kr.target} {kr.unit}
                        </span>
                      </div>
                      <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-zinc-400 rounded-full"
                          style={{ width: `${kr.progress_percent}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card Footer */}
              <div className="border-t border-zinc-800/80 pt-3 mt-4 flex items-center justify-between text-xs text-zinc-500">
                <span className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-zinc-600" />
                  {obj.owner_name}
                </span>

                <button
                  onClick={() => {
                    setSelectedObjective(obj);
                    setIsDrawerOpen(true);
                  }}
                  className="flex items-center gap-1 text-amber-400 hover:text-amber-300 font-medium transition-colors"
                >
                  <span>Gerenciar KRs</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Drawer: Manage Objective and KRs */}
      <DetailDrawer
        isOpen={isDrawerOpen && Boolean(selectedObjective)}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedObjective(null);
          setUpdatingKrId(null);
        }}
        title={selectedObjective?.title || 'Detalhes do Objetivo'}
        subtitle={`${selectedObjective?.code} · Pilar: ${selectedObjective?.pillar}`}
        badge={selectedObjective && getStatusBadge(selectedObjective.status)}
      >
        {selectedObjective && (
          <div className="space-y-6">
            {/* Overview */}
            <div className="bg-zinc-950 p-4 rounded-lg border border-zinc-800 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400">Responsável Estratégico</span>
                <span className="text-zinc-200 font-medium">{selectedObjective.owner_name}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400">Ano Alvo</span>
                <span className="text-zinc-200 font-mono">{selectedObjective.target_year}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400">Progresso Geral</span>
                <span className="font-mono text-amber-400 font-semibold">
                  {selectedObjective.progress_percent}%
                </span>
              </div>
            </div>

            {/* Key Results List with Real-Time Calibration */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold uppercase text-zinc-400 tracking-wider">
                  Métricas de Resultados-Chave (KRs)
                </h4>
              </div>

              {strategyService.getKeyResults(selectedObjective.id).map(kr => {
                const isUpdating = updatingKrId === kr.id;
                return (
                  <div
                    key={kr.id}
                    className="bg-zinc-950 p-4 rounded-lg border border-zinc-800 space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h5 className="text-xs font-semibold text-zinc-200">{kr.title}</h5>
                        <span className="text-[11px] text-zinc-500 font-mono block">
                          Métrica: {kr.metric} · Dono: {kr.owner_name}
                        </span>
                      </div>
                      <span className="text-xs font-mono font-medium text-amber-400 shrink-0">
                        {kr.progress_percent}%
                      </span>
                    </div>

                    <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-400 rounded-full transition-all"
                        style={{ width: `${kr.progress_percent}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
                      <span>Base: {kr.baseline} {kr.unit}</span>
                      <span>Atual: {kr.current} {kr.unit}</span>
                      <span>Alvo: {kr.target} {kr.unit}</span>
                    </div>

                    {/* Quick Calibrate Inline */}
                    {isUpdating ? (
                      <div className="pt-2 border-t border-zinc-800/80 flex items-center gap-2">
                        <input
                          type="number"
                          value={newKrCurrentVal}
                          onChange={e => setNewKrCurrentVal(Number(e.target.value))}
                          className="w-24 px-2 py-1 text-xs bg-zinc-900 border border-zinc-700 rounded text-zinc-100 font-mono"
                        />
                        <button
                          onClick={() => handleUpdateKr(kr.id)}
                          className="px-2.5 py-1 text-xs font-medium text-zinc-950 bg-amber-400 hover:bg-amber-300 rounded transition-colors"
                        >
                          Salvar Valor
                        </button>
                        <button
                          onClick={() => setUpdatingKrId(null)}
                          className="px-2.5 py-1 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
                        >
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <div className="pt-2 border-t border-zinc-800/80 flex justify-end">
                        <button
                          onClick={() => {
                            setUpdatingKrId(kr.id);
                            setNewKrCurrentVal(kr.current);
                          }}
                          className="text-[11px] text-zinc-400 hover:text-amber-400 transition-colors flex items-center gap-1 font-mono"
                        >
                          <SlidersHorizontal className="w-3 h-3" />
                          <span>Atualizar Valor Medido</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </DetailDrawer>

      {/* Modal: New Objective */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Registrar Novo Objetivo Estratégico"
        subtitle="Defina pilares fundamentais de crescimento, conformidade ou tecnologia para a NettosCorp."
      >
        <form onSubmit={handleCreateObjective} className="space-y-4">
          <FormField label="Código de Referência" required>
            <TextInput
              value={formData.code}
              onChange={e => setFormData({ ...formData, code: e.target.value })}
              placeholder="Ex: OBJ-2026-05"
              required
            />
          </FormField>

          <FormField label="Título do Objetivo" required>
            <TextInput
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              placeholder="Ex: Expansão de Agentes de Atendimento Hospitalar"
              required
            />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Pilar Corporativo" required>
              <SelectInput
                value={formData.pillar}
                onChange={e => setFormData({ ...formData, pillar: e.target.value as StrategicObjective['pillar'] })}
                options={[
                  { value: 'Inteligência Artificial & Automação', label: 'IA & Automação' },
                  { value: 'Governança & Risco', label: 'Governança & Risco' },
                  { value: 'Crescimento', label: 'Crescimento' },
                  { value: 'Excelência Operacional', label: 'Excelência Operacional' },
                ]}
              />
            </FormField>

            <FormField label="Ano Alvo" required>
              <TextInput
                type="number"
                value={formData.target_year}
                onChange={e => setFormData({ ...formData, target_year: Number(e.target.value) })}
                required
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Responsável Executivo" required>
              <TextInput
                value={formData.owner_name}
                onChange={e => setFormData({ ...formData, owner_name: e.target.value })}
                required
              />
            </FormField>

            <FormField label="Status Inicial">
              <SelectInput
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value as StrategicObjective['status'] })}
                options={[
                  { value: 'on_track', label: 'Em Dia (On Track)' },
                  { value: 'at_risk', label: 'Em Risco (At Risk)' },
                  { value: 'behind', label: 'Atrasado (Behind)' },
                ]}
              />
            </FormField>
          </div>

          <FormActions
            onCancel={() => setIsCreateModalOpen(false)}
            submitLabel="Registrar Objetivo"
          />
        </form>
      </Modal>
    </div>
  );
};
