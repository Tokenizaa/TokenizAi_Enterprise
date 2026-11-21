/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { organizationService } from '../services/organizationService';
import { localStore } from '../services/supabaseClient';
import { Department, Position, Organization } from '../types';
import { PageHeader } from '../components/layout/PageHeader';
import { StatCard } from '../components/data/StatCard';
import { OrganizationTree } from '../components/organization/OrganizationTree';
import { Building2, Layers, Briefcase, Users, Plus } from 'lucide-react';

interface OrganizationPageProps {
  onNavigate: (route: string) => void;
}

export const OrganizationPage: React.FC<OrganizationPageProps> = ({ onNavigate }) => {
  const [organization, setOrganization] = useState<Organization>(organizationService.getOrganization());
  const [departments, setDepartments] = useState<Department[]>(organizationService.getDepartments());
  const [positions, setPositions] = useState<Position[]>(organizationService.getPositions());
  const [members, setMembers] = useState(organizationService.getUsers());

  useEffect(() => {
    const handleUpdate = () => {
      setOrganization(organizationService.getOrganization());
      setDepartments(organizationService.getDepartments());
      setPositions(organizationService.getPositions());
      setMembers(organizationService.getUsers());
    };
    return localStore.subscribe(handleUpdate);
  }, []);

  const totalHeadcount = departments.reduce((acc, d) => acc + (d.headcount || 0), 0);

  return (
    <div className="space-y-6">
      <PageHeader
        kicker="Estrutura Corporativa"
        title="Organograma & Unidades de Negócio"
        description="Mapeamento das diretorias estatutárias, departamentos operacionais, posições de liderança e alocação de quadro de colaboradores."
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('/organization/positions')}
              className="px-3 py-1.5 text-xs font-medium text-zinc-300 hover:text-zinc-100 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded transition-colors whitespace-nowrap"
            >
              Ver Cargos ({positions.length})
            </button>
            <button
              onClick={() => onNavigate('/organization/departments')}
              className="px-3 py-1.5 text-xs font-semibold text-zinc-950 bg-amber-400 hover:bg-amber-300 rounded transition-colors whitespace-nowrap"
            >
              Gerenciar Departamentos
            </button>
          </div>
        }
      />

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Unidades de Negócio"
          value={departments.length}
          subValue="departamentos ativos"
          icon={Layers}
          onClick={() => onNavigate('/organization/departments')}
        />
        <StatCard
          label="Cargos Homologados"
          value={positions.length}
          subValue="estatutários & técnicos"
          icon={Briefcase}
          onClick={() => onNavigate('/organization/positions')}
        />
        <StatCard
          label="Quadro Global Alocado"
          value={totalHeadcount}
          subValue="profissionais ativos"
          icon={Users}
        />
        <StatCard
          label="Usuários no Sistema"
          value={members.length}
          subValue="perfis com credencial"
          icon={Building2}
          onClick={() => onNavigate('/settings/users')}
        />
      </div>

      {/* Main Interactive Hierarchy Tree */}
      <OrganizationTree
        organization={organization}
        departments={departments}
        positions={positions}
        onNavigate={onNavigate}
        onSelectDepartment={() => onNavigate('/organization/departments')}
      />
    </div>
  );
};
