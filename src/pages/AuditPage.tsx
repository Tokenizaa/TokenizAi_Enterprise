/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { auditService } from '../services/auditService';
import { localStore } from '../services/supabaseClient';
import { AuditLog } from '../types';
import { PageHeader } from '../components/layout/PageHeader';
import { AuditTimeline } from '../components/governance/AuditTimeline';
import { SearchInput } from '../components/data/SearchInput';
import { FilterBar } from '../components/data/FilterBar';
import { ShieldAlert, Download, RefreshCw } from 'lucide-react';

interface AuditPageProps {
  onNavigate: (route: string) => void;
}

const RESOURCES = [
  'all',
  'auth',
  'profiles',
  'departments',
  'positions',
  'agents',
  'projects',
  'tasks',
  'decisions',
  'deliberations',
  'documents',
];

export const AuditPage: React.FC<AuditPageProps> = ({ onNavigate }) => {
  const [logs, setLogs] = useState<AuditLog[]>(auditService.getAuditLogs());
  const [search, setSearch] = useState('');
  const [resourceFilter, setResourceFilter] = useState('all');
  const [actionFilter, setActionFilter] = useState('all');

  useEffect(() => {
    const handleUpdate = () => {
      setLogs(auditService.getAuditLogs());
    };
    return localStore.subscribe(handleUpdate);
  }, []);

  const filteredLogs = auditService.filterLogs({
    resource: resourceFilter,
    action: actionFilter,
    searchTerm: search,
  });

  const handleExportCSV = () => {
    const headers = ['ID', 'Data/Hora', 'Usuário', 'Ação', 'Recurso', 'Recurso ID', 'IP', 'Detalhes'];
    const rows = filteredLogs.map(l => [
      l.id,
      l.created_at,
      l.user_email,
      l.action,
      l.resource,
      l.resource_id || '',
      l.ip_address || '',
      JSON.stringify(l.details).replace(/"/g, '""'),
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map(e => `"${e.join('","')}"`)].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `nettoscorp_audit_trail_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        kicker="Conformidade & Imutabilidade"
        title="Trilha de Auditoria Corporativa"
        description="Registro histórico de acessos, mutações de dados e transições de status com integridade referencial e auditoria RLS."
        actions={
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 text-xs font-medium text-zinc-300 hover:text-zinc-100 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded transition-colors flex items-center gap-1.5 whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar Relatório CSV</span>
          </button>
        }
      />

      {/* Filter and Search Bar */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <FilterBar
            options={[
              { id: 'all', label: 'Todas as Ações', count: logs.length },
              { id: 'CREATE', label: 'Criações', count: logs.filter(l => l.action === 'CREATE').length },
              { id: 'UPDATE', label: 'Atualizações', count: logs.filter(l => l.action === 'UPDATE').length },
              { id: 'STATUS_CHANGE', label: 'Transições', count: logs.filter(l => l.action === 'STATUS_CHANGE').length },
              { id: 'LOGIN', label: 'Sessões', count: logs.filter(l => l.action === 'LOGIN').length },
            ]}
            activeId={actionFilter}
            onChange={setActionFilter}
          />

          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Filtrar por e-mail, ação ou payload..."
            className="w-full sm:w-72"
          />
        </div>

        {/* Resource Type Filter */}
        <div className="flex items-center gap-2 text-xs text-zinc-400 overflow-x-auto pb-1">
          <span className="text-zinc-500 font-medium shrink-0">Recurso:</span>
          <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded p-0.5">
            {RESOURCES.map(res => (
              <button
                key={res}
                onClick={() => setResourceFilter(res)}
                className={`px-2 py-0.5 rounded uppercase font-mono text-[11px] whitespace-nowrap transition-colors ${
                  resourceFilter === res
                    ? 'bg-zinc-800 text-amber-400 font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {res === 'all' ? 'Todos' : res}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Timeline Component */}
      <AuditTimeline logs={filteredLogs} />
    </div>
  );
};
