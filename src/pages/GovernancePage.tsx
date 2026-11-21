/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { governanceService } from '../services/governanceService';
import { localStore } from '../services/supabaseClient';
import { PageHeader } from '../components/layout/PageHeader';
import { StatCard } from '../components/data/StatCard';
import { DecisionCard } from '../components/governance/DecisionCard';
import { DeliberationCard } from '../components/governance/DeliberationCard';
import { DocumentCard } from '../components/governance/DocumentCard';
import { SearchInput } from '../components/data/SearchInput';
import { StatusBadge } from '../components/organization/StatusBadge';
import {
  Compass,
  Gavel,
  Scale,
  FileText,
  Link2,
  ShieldAlert,
  ArrowRight,
  GitCommit,
  CheckCircle2,
  FileCheck,
  ChevronRight
} from 'lucide-react';

interface GovernancePageProps {
  onNavigate: (route: string) => void;
}

export const GovernancePage: React.FC<GovernancePageProps> = ({ onNavigate }) => {
  const decisions = localStore.getDecisions();
  const deliberations = localStore.getDeliberations();
  const documents = localStore.getDocuments();

  const [crossRefQuery, setCrossRefQuery] = useState('');
  const [crossRefResult, setCrossRefResult] = useState<ReturnType<
    typeof governanceService.getCrossReferences
  > | null>(null);

  const [activeWorkflowId, setActiveWorkflowId] = useState<string>('cns-001');

  const handleResolveCrossRef = (code: string) => {
    setCrossRefQuery(code);
    const result = governanceService.getCrossReferences(code);
    setCrossRefResult(result);
  };

  // Find linked items for the active workflow selector
  const activeDelib = deliberations.find(d => d.id === activeWorkflowId) || deliberations[0];
  const activeDec = decisions.find(d => d.deliberation_ref_id === activeDelib?.id || d.id === activeDelib?.dec_ref_id || d.dec_code === activeDelib?.dec_code_ref);
  const activeDoc = documents.find(d => d.cns_ref === activeDelib?.cns_code || d.delib_ref === activeDelib?.delib_file_ref);

  return (
    <div className="space-y-6">
      <PageHeader
        kicker="Conselho & Diretoria S.A."
        title="Portal de Governança Corporativa"
        description="Rastreabilidade integral e interoperabilidade estatutária entre Deliberações do Conselheiro (CNS), Decretos Institucionais (DEC) e Documentos Integrais (DELIB)."
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('/deliberations')}
              className="px-3 py-1.5 text-xs font-medium text-zinc-300 hover:text-zinc-100 bg-zinc-900 border border-zinc-800 rounded transition-colors whitespace-nowrap"
            >
              Atas CNS ({deliberations.length})
            </button>
            <button
              onClick={() => onNavigate('/decisions')}
              className="px-3 py-1.5 text-xs font-semibold text-zinc-950 bg-amber-400 hover:bg-amber-300 rounded transition-colors whitespace-nowrap"
            >
              Registro DEC ({decisions.length})
            </button>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Decretos & Decisões (DEC)"
          value={decisions.length}
          subValue="atos vigentes"
          icon={Gavel}
          onClick={() => onNavigate('/decisions')}
        />
        <StatCard
          label="Deliberações do Conselho (CNS)"
          value={deliberations.length}
          subValue="sessões colegiadas"
          icon={Scale}
          onClick={() => onNavigate('/deliberations')}
        />
        <StatCard
          label="Documentação Integral (DELIB)"
          value={documents.length}
          subValue="arquivos autenticados"
          icon={FileText}
          onClick={() => onNavigate('/documents')}
        />
      </div>

      {/* STRUCTURAL PATTERN: Workflow & Pipeline Graph of Corporate Governance */}
      <div className="p-6 bg-zinc-900/80 border border-zinc-800 rounded-lg space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-zinc-800">
          <div>
            <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider block">
              Padrão Estrutural de Conformidade
            </span>
            <h3 className="text-sm font-bold text-zinc-100 mt-0.5">
              Rito Deliberativo & Cadeia de Custódia Normativa
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400">Sessão Colegiada:</span>
            <select
              value={activeWorkflowId}
              onChange={e => setActiveWorkflowId(e.target.value)}
              className="px-2.5 py-1 text-xs bg-zinc-950 border border-zinc-800 rounded text-zinc-200 font-mono"
            >
              {deliberations.map(delib => (
                <option key={delib.id} value={delib.id}>
                  {delib.cns_code} ({delib.session_date})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Visual 3-Stage Pipeline */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
          {/* Stage 1: Deliberação CNS */}
          <div className="p-4 rounded-lg bg-zinc-950/80 border border-sky-500/30 relative space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase text-sky-400 font-semibold flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5" /> 1. Votação CNS
              </span>
              <StatusBadge status={activeDelib?.status || 'approved'} />
            </div>

            <h4 className="text-xs font-bold text-zinc-100">{activeDelib?.cns_code}</h4>
            <p className="text-[11px] text-zinc-300 line-clamp-2">{activeDelib?.title}</p>

            <div className="pt-2 border-t border-zinc-850 text-[10px] text-zinc-400 font-mono space-y-1">
              <div>Quórum: <span className="text-zinc-200">{activeDelib?.quorum}</span></div>
              <div>Data: <span className="text-zinc-200">{activeDelib?.session_date}</span></div>
            </div>
          </div>

          {/* Stage 2: Decreto DEC */}
          <div className="p-4 rounded-lg bg-zinc-950/80 border border-amber-500/30 relative space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase text-amber-400 font-semibold flex items-center gap-1.5">
                <Gavel className="w-3.5 h-3.5" /> 2. Homologação DEC
              </span>
              <StatusBadge status={activeDec?.status || 'in_effect'} />
            </div>

            <h4 className="text-xs font-bold text-zinc-100">{activeDec?.dec_code || 'Aguardando Emissão'}</h4>
            <p className="text-[11px] text-zinc-300 line-clamp-2">
              {activeDec?.title || 'Decreto em fase de lavratura executiva.'}
            </p>

            <div className="pt-2 border-t border-zinc-850 text-[10px] text-zinc-400 font-mono space-y-1">
              <div>Autoridade: <span className="text-zinc-200">{activeDec?.decided_by || 'Diretoria Executiva'}</span></div>
              <div>Vigência: <span className="text-zinc-200">{activeDec?.decided_at || 'Em trâmite'}</span></div>
            </div>
          </div>

          {/* Stage 3: Arquivo Integral DELIB */}
          <div className="p-4 rounded-lg bg-zinc-950/80 border border-emerald-500/30 relative space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase text-emerald-400 font-semibold flex items-center gap-1.5">
                <FileCheck className="w-3.5 h-3.5" /> 3. Custódia DELIB
              </span>
              <StatusBadge status={activeDoc?.status || 'published'} />
            </div>

            <h4 className="text-xs font-bold text-zinc-100">{activeDoc?.doc_code || activeDelib?.delib_file_ref || 'DELIB-2026'}</h4>
            <p className="text-[11px] text-zinc-300 line-clamp-2">
              {activeDoc?.title || 'Ata integral arquivada no repositório de governança.'}
            </p>

            <div className="pt-2 border-t border-zinc-850 text-[10px] text-zinc-400 font-mono space-y-1">
              <div>Versão: <span className="text-zinc-200">v{activeDoc?.version || '1.0'}</span></div>
              <div>Integridade: <span className="text-emerald-400">Assinado Digitalmente</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* Cross-Referencing Tool (Section 8 of prompt) */}
      <div className="p-6 bg-zinc-900/80 border border-amber-500/30 rounded-lg">
        <div className="flex items-center gap-2 pb-3 mb-4 border-b border-zinc-800">
          <Link2 className="w-5 h-5 text-amber-400" />
          <div>
            <h3 className="text-sm font-semibold text-zinc-100">
              Consultor de Interoperabilidade & Referências Cruzadas
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Digite um código CNS, DEC ou DELIB para traçar todos os vínculos recíprocos de governança.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <SearchInput
            value={crossRefQuery}
            onChange={val => {
              setCrossRefQuery(val);
              if (val.trim()) {
                setCrossRefResult(governanceService.getCrossReferences(val));
              } else {
                setCrossRefResult(null);
              }
            }}
            placeholder="Digite: DEC-2026-001, CNS-2026-001 ou DELIB-2026-001..."
            className="flex-1"
          />
          <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-mono">
            <span>Atalhos:</span>
            <button
              onClick={() => handleResolveCrossRef('DEC-2026-001')}
              className="px-2 py-1 rounded bg-zinc-950 border border-zinc-800 text-amber-400 hover:text-amber-300"
            >
              DEC-2026-001
            </button>
            <button
              onClick={() => handleResolveCrossRef('CNS-2026-002')}
              className="px-2 py-1 rounded bg-zinc-950 border border-zinc-800 text-sky-400 hover:text-sky-300"
            >
              CNS-2026-002
            </button>
          </div>
        </div>

        {/* Crossref Results Panel */}
        {crossRefResult && (
          <div className="mt-5 pt-4 border-t border-zinc-800 space-y-4">
            <span className="text-xs font-semibold uppercase text-zinc-400 tracking-wider block">
              Grafo de Vínculos Localizados:
            </span>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Decision */}
              <div className="p-4 rounded bg-zinc-950 border border-zinc-800">
                <span className="text-[10px] font-mono uppercase text-amber-400 font-semibold block mb-1">
                  Decisão Institucional (DEC)
                </span>
                {crossRefResult.decision ? (
                  <div>
                    <h5 className="text-xs font-semibold text-zinc-100">{crossRefResult.decision.dec_code}</h5>
                    <p className="text-xs text-zinc-300 mt-1 line-clamp-2">{crossRefResult.decision.title}</p>
                    <span className="text-[11px] text-zinc-500 font-mono block mt-2">
                      Data: {crossRefResult.decision.decided_at}
                    </span>
                  </div>
                ) : (
                  <span className="text-xs text-zinc-500 italic">Nenhum DEC vinculado.</span>
                )}
              </div>

              {/* Deliberation */}
              <div className="p-4 rounded bg-zinc-950 border border-zinc-800">
                <span className="text-[10px] font-mono uppercase text-sky-400 font-semibold block mb-1">
                  Deliberação de Conselho (CNS)
                </span>
                {crossRefResult.deliberation ? (
                  <div>
                    <h5 className="text-xs font-semibold text-zinc-100">{crossRefResult.deliberation.cns_code}</h5>
                    <p className="text-xs text-zinc-300 mt-1 line-clamp-2">{crossRefResult.deliberation.title}</p>
                    <span className="text-[11px] text-zinc-500 font-mono block mt-2">
                      Quórum: {crossRefResult.deliberation.quorum}
                    </span>
                  </div>
                ) : (
                  <span className="text-xs text-zinc-500 italic">Nenhuma ata CNS vinculada.</span>
                )}
              </div>

              {/* Document */}
              <div className="p-4 rounded bg-zinc-950 border border-zinc-800">
                <span className="text-[10px] font-mono uppercase text-emerald-400 font-semibold block mb-1">
                  Arquivo Integral (DELIB)
                </span>
                {crossRefResult.document ? (
                  <div>
                    <h5 className="text-xs font-semibold text-zinc-100">{crossRefResult.document.doc_code}</h5>
                    <p className="text-xs text-zinc-300 mt-1 line-clamp-2">{crossRefResult.document.title}</p>
                    <span className="text-[11px] text-zinc-500 font-mono block mt-2">
                      Versão: v{crossRefResult.document.version}
                    </span>
                  </div>
                ) : (
                  <span className="text-xs text-zinc-500 italic">Nenhum arquivo DELIB indexado.</span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Grid of Latest Decisions & Deliberations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
              <Gavel className="w-4 h-4 text-amber-400" />
              <span>Decisões Institucionais Recentes (DEC)</span>
            </h3>
            <button
              onClick={() => onNavigate('/decisions')}
              className="text-xs text-amber-400 hover:text-amber-300"
            >
              Ver todas ({decisions.length})
            </button>
          </div>

          <div className="space-y-3">
            {decisions.slice(0, 2).map(d => (
              <DecisionCard
                key={d.id}
                decision={d}
                onNavigateToCns={cns => handleResolveCrossRef(cns)}
              />
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
              <Scale className="w-4 h-4 text-sky-400" />
              <span>Deliberações do Conselho (CNS)</span>
            </h3>
            <button
              onClick={() => onNavigate('/deliberations')}
              className="text-xs text-amber-400 hover:text-amber-300"
            >
              Ver todas ({deliberations.length})
            </button>
          </div>

          <div className="space-y-3">
            {deliberations.slice(0, 2).map(delib => (
              <DeliberationCard
                key={delib.id}
                deliberation={delib}
                onNavigateToDec={dec => handleResolveCrossRef(dec)}
                onNavigateToDelib={file => handleResolveCrossRef(file)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
