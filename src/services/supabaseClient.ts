/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  UserProfile,
  Organization,
  Department,
  Position,
  AIAgent,
  Project,
  Task,
  Decision,
  Deliberation,
  GovernanceDocument,
  AuditLog,
  UserRole,
  StrategicObjective,
  KeyResult,
  FinancialTransaction,
  DepartmentBudget,
  CommercialLead,
  CommercialContract,
  ApprovalRequest,
  HermesRuntimeNode,
  HermesAgentSession,
  HermesSkill,
  KnowledgeArticle,
  AgencyAgentProfile,
  AgencyAgentSelection,
  AgencyAgentHomologation,
} from '../types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isLiveSupabaseConfigured = Boolean(
  SUPABASE_URL &&
  SUPABASE_ANON_KEY &&
  !SUPABASE_URL.includes('your-project') &&
  !SUPABASE_ANON_KEY.includes('your-anon')
);

export const supabase: SupabaseClient | null = isLiveSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

// =====================================================================
// PERSISTENT REPOSITORY LAYER (Supabase Mirror & Local Engine)
// Guarantees zero-dead-click functionality and role testing
// =====================================================================

const STORAGE_KEY = 'nettoscorp_enterprise_data_v1';
const SESSION_KEY = 'nettoscorp_enterprise_session_v1';

interface StorageSchema {
  organizations: Organization[];
  profiles: UserProfile[];
  departments: Department[];
  positions: Position[];
  agents: AIAgent[];
  agencyAgentProfiles: AgencyAgentProfile[];
  agencyAgentSelections: AgencyAgentSelection[];
  agencyAgentHomologations: AgencyAgentHomologation[];
  projects: Project[];
  tasks: Task[];
  decisions: Decision[];
  deliberations: Deliberation[];
  documents: GovernanceDocument[];
  auditLogs: AuditLog[];
  strategicObjectives: StrategicObjective[];
  keyResults: KeyResult[];
  financialTransactions: FinancialTransaction[];
  departmentBudgets: DepartmentBudget[];
  commercialLeads: CommercialLead[];
  commercialContracts: CommercialContract[];
  approvalRequests: ApprovalRequest[];
  hermesNodes: HermesRuntimeNode[];
  hermesSessions: HermesAgentSession[];
  hermesSkills: HermesSkill[];
  knowledgeArticles: KnowledgeArticle[];
}

const DEFAULT_ORG_ID = 'd3c6760f-f734-4154-837e-34898849f040';

const INITIAL_DATA: StorageSchema = {
  organizations: [
    {
      id: DEFAULT_ORG_ID,
      name: 'NettosCorp Enterprise S.A.',
      slug: 'nettoscorp-enterprise',
      domain: 'nettoscorp.com',
      status: 'active',
      created_at: '2026-01-10T08:00:00Z',
      updated_at: '2026-01-10T08:00:00Z',
    },
  ],
  profiles: [
    {
      id: 'usr-001',
      email: 'admin@nettoscorp.com',
      full_name: 'Dr. Orlando Netto',
      avatar_url: '',
      role: 'super_admin',
      organization_id: DEFAULT_ORG_ID,
      department_id: 'dept-001',
      position_id: 'pos-001',
      status: 'active',
      created_at: '2026-01-10T08:00:00Z',
      updated_at: '2026-01-10T08:00:00Z',
    },
    {
      id: 'usr-002',
      email: 'diretoria@nettoscorp.com',
      full_name: 'Helena Valença',
      avatar_url: '',
      role: 'director',
      organization_id: DEFAULT_ORG_ID,
      department_id: 'dept-002',
      position_id: 'pos-002',
      status: 'active',
      created_at: '2026-01-15T09:30:00Z',
      updated_at: '2026-01-15T09:30:00Z',
    },
    {
      id: 'usr-003',
      email: 'gerencia@nettoscorp.com',
      full_name: 'Marcus Bastos',
      avatar_url: '',
      role: 'manager',
      organization_id: DEFAULT_ORG_ID,
      department_id: 'dept-001',
      position_id: 'pos-003',
      status: 'active',
      created_at: '2026-01-20T10:00:00Z',
      updated_at: '2026-01-20T10:00:00Z',
    },
    {
      id: 'usr-004',
      email: 'membro@nettoscorp.com',
      full_name: 'Beatriz Lima',
      avatar_url: '',
      role: 'member',
      organization_id: DEFAULT_ORG_ID,
      department_id: 'dept-001',
      position_id: 'pos-004',
      status: 'active',
      created_at: '2026-02-01T11:00:00Z',
      updated_at: '2026-02-01T11:00:00Z',
    },
    {
      id: 'usr-005',
      email: 'auditor@nettoscorp.com',
      full_name: 'Gabriel Siqueira',
      avatar_url: '',
      role: 'viewer',
      organization_id: DEFAULT_ORG_ID,
      department_id: 'dept-003',
      position_id: 'pos-005',
      status: 'active',
      created_at: '2026-02-10T14:00:00Z',
      updated_at: '2026-02-10T14:00:00Z',
    },
  ],
  departments: [
    {
      id: 'dept-001',
      organization_id: DEFAULT_ORG_ID,
      code: 'DEP-TEC',
      name: 'Tecnologia & Inteligência Artificial',
      description: 'Engenharia de software, modelos autônomos, infraestrutura cloud e cibersegurança.',
      manager_id: 'usr-001',
      manager_name: 'Dr. Orlando Netto',
      status: 'active',
      headcount: 14,
      created_at: '2026-01-10T08:00:00Z',
      updated_at: '2026-01-10T08:00:00Z',
    },
    {
      id: 'dept-002',
      organization_id: DEFAULT_ORG_ID,
      code: 'DEP-GOV',
      name: 'Governança Corporativa & Conselho',
      description: 'Deliberações CNS, registro DEC, compliance regulatório e auditoria estatutária.',
      manager_id: 'usr-002',
      manager_name: 'Helena Valença',
      status: 'active',
      headcount: 6,
      created_at: '2026-01-10T08:00:00Z',
      updated_at: '2026-01-10T08:00:00Z',
    },
    {
      id: 'dept-003',
      organization_id: DEFAULT_ORG_ID,
      code: 'DEP-AUD',
      name: 'Auditoria & Riscos Operacionais',
      description: 'Supervisão de conformidade, trilha de auditoria digital e controles internos.',
      manager_id: 'usr-005',
      manager_name: 'Gabriel Siqueira',
      status: 'active',
      headcount: 5,
      created_at: '2026-01-15T09:00:00Z',
      updated_at: '2026-01-15T09:00:00Z',
    },
    {
      id: 'dept-004',
      organization_id: DEFAULT_ORG_ID,
      code: 'DEP-OPE',
      name: 'Operações Estratégicas',
      description: 'Gestão de processos produtivos, alocação de recursos e eficiência corporativa.',
      manager_id: 'usr-003',
      manager_name: 'Marcus Bastos',
      status: 'active',
      headcount: 18,
      created_at: '2026-01-20T10:00:00Z',
      updated_at: '2026-01-20T10:00:00Z',
    },
  ],
  positions: [
    {
      id: 'pos-001',
      organization_id: DEFAULT_ORG_ID,
      department_id: 'dept-001',
      department_name: 'Tecnologia & Inteligência Artificial',
      title: 'Chief Technology Officer (CTO)',
      code: 'POS-CTO-01',
      level: 'C-Level',
      description: 'Liderança técnica e direcionamento de arquiteturas e agentes corporativos.',
      created_at: '2026-01-10T08:00:00Z',
      updated_at: '2026-01-10T08:00:00Z',
    },
    {
      id: 'pos-002',
      organization_id: DEFAULT_ORG_ID,
      department_id: 'dept-002',
      department_name: 'Governança Corporativa & Conselho',
      title: 'Diretora de Governança e Relações Institucionais',
      code: 'POS-DIR-GOV',
      level: 'Diretoria',
      description: 'Supervisão do Conselho Consultivo, deliberações CNS e atos estatutários.',
      created_at: '2026-01-10T08:00:00Z',
      updated_at: '2026-01-10T08:00:00Z',
    },
    {
      id: 'pos-003',
      organization_id: DEFAULT_ORG_ID,
      department_id: 'dept-001',
      department_name: 'Tecnologia & Inteligência Artificial',
      title: 'Gerente de Engenharia e Operações',
      code: 'POS-GER-ENG',
      level: 'Gerência',
      description: 'Coordenação operacional de times de produto e pipelines de IA.',
      created_at: '2026-01-15T09:00:00Z',
      updated_at: '2026-01-15T09:00:00Z',
    },
    {
      id: 'pos-004',
      organization_id: DEFAULT_ORG_ID,
      department_id: 'dept-001',
      department_name: 'Tecnologia & Inteligência Artificial',
      title: 'Engenheira de Sistemas Sênior',
      code: 'POS-ENG-SR',
      level: 'Especialista',
      description: 'Desenvolvimento e sustentação de microarquiteturas e contratos de API.',
      created_at: '2026-01-20T10:00:00Z',
      updated_at: '2026-01-20T10:00:00Z',
    },
    {
      id: 'pos-005',
      organization_id: DEFAULT_ORG_ID,
      department_id: 'dept-003',
      department_name: 'Auditoria & Riscos Operacionais',
      title: 'Analista de Compliance e Auditoria',
      code: 'POS-ANA-AUD',
      level: 'Operacional',
      description: 'Aferição de conformidade e verificação contínua da trilha de eventos.',
      created_at: '2026-02-01T11:00:00Z',
      updated_at: '2026-02-01T11:00:00Z',
    },
  ],
  agents: [
    {
      id: 'agt-001',
      organization_id: DEFAULT_ORG_ID,
      code: 'AGT-GOV-01',
      name: 'NettosGov Sentinel',
      model: 'gemini-2.5-pro',
      purpose: 'Auditoria automatizada de deliberações CNS e verificação de compliance com estatuto corporativo.',
      status: 'active',
      version: '2.1.0',
      assigned_department_id: 'dept-002',
      department_name: 'Governança Corporativa & Conselho',
      config: {
        temperature: 0.2,
        max_tokens: 4096,
        system_prompt: 'Agente especializado em auditoria de decisões executivas e confrontação com normas institucionais.',
        capabilities: ['análise documental', 'validação de quórum', 'cruzamento DEC-CNS'],
      },
      created_at: '2026-01-12T10:00:00Z',
      updated_at: '2026-01-12T10:00:00Z',
    },
    {
      id: 'agt-002',
      organization_id: DEFAULT_ORG_ID,
      code: 'AGT-OPS-02',
      name: 'NettosTask Dispatcher',
      model: 'gemini-2.5-flash',
      purpose: 'Triagem, categorização e distribuição de tarefas em projetos com base em cronogramas.',
      status: 'active',
      version: '1.4.2',
      assigned_department_id: 'dept-001',
      department_name: 'Tecnologia & Inteligência Artificial',
      config: {
        temperature: 0.1,
        max_tokens: 2048,
        system_prompt: 'Despacho automatizado e sincronização de atividades.',
        capabilities: ['priorização de sprints', 'estimativa de esforço', 'alocação de recursos'],
      },
      created_at: '2026-01-18T14:30:00Z',
      updated_at: '2026-01-18T14:30:00Z',
    },
    {
      id: 'agt-003',
      organization_id: DEFAULT_ORG_ID,
      code: 'AGT-DOC-03',
      name: 'Paperclip Bridge Agent',
      model: 'gemini-2.5-flash',
      purpose: 'Interface de verificação de schemas e contratos documentais com o repositório Paperclip.',
      status: 'standby',
      version: '0.9.0',
      assigned_department_id: 'dept-002',
      department_name: 'Governança Corporativa & Conselho',
      config: {
        temperature: 0.0,
        max_tokens: 1024,
        system_prompt: 'Validador formal de schemas de integração Paperclip sem modificação externa.',
        capabilities: ['validação de integridade', 'checagem de hash', 'auditoria de contratos'],
      },
      created_at: '2026-02-05T09:00:00Z',
      updated_at: '2026-02-05T09:00:00Z',
    },
  ],
  agencyAgentProfiles: [] as AgencyAgentProfile[],
  agencyAgentSelections: [] as AgencyAgentSelection[],
  agencyAgentHomologations: [] as AgencyAgentHomologation[],
  projects: [
    {
      id: 'prj-001',
      organization_id: DEFAULT_ORG_ID,
      department_id: 'dept-001',
      department_name: 'Tecnologia & Inteligência Artificial',
      code: 'PRJ-2026-ENT',
      name: 'Plataforma Corporativa Integrada',
      description: 'Implantação do ecossistema central de governança, agentes autônomos e trilha de auditoria RLS.',
      status: 'in_progress',
      priority: 'urgent',
      lead_id: 'usr-001',
      lead_name: 'Dr. Orlando Netto',
      start_date: '2026-01-15',
      due_date: '2026-06-30',
      budget: 450000.00,
      created_at: '2026-01-15T09:00:00Z',
      updated_at: '2026-01-15T09:00:00Z',
    },
    {
      id: 'prj-002',
      organization_id: DEFAULT_ORG_ID,
      department_id: 'dept-002',
      department_name: 'Governança Corporativa & Conselho',
      code: 'PRJ-2026-GOV',
      name: 'Consolidação Regimental DEC/CNS',
      description: 'Padronização dos ritos deliberativos e registro unificado de decisões do conselho consultivo.',
      status: 'in_progress',
      priority: 'high',
      lead_id: 'usr-002',
      lead_name: 'Helena Valença',
      start_date: '2026-02-01',
      due_date: '2026-04-15',
      budget: 120000.00,
      created_at: '2026-02-01T08:00:00Z',
      updated_at: '2026-02-01T08:00:00Z',
    },
    {
      id: 'prj-003',
      organization_id: DEFAULT_ORG_ID,
      department_id: 'dept-003',
      department_name: 'Auditoria & Riscos Operacionais',
      code: 'PRJ-2026-AUD',
      name: 'Auditoria Contínua & Segurança RLS',
      description: 'Validação estatutária de isolamento de tenants, integridade de logs e conformidade LGPD/ISO 27001.',
      status: 'planning',
      priority: 'medium',
      lead_id: 'usr-005',
      lead_name: 'Gabriel Siqueira',
      start_date: '2026-03-01',
      due_date: '2026-08-30',
      budget: 95000.00,
      created_at: '2026-02-10T11:00:00Z',
      updated_at: '2026-02-10T11:00:00Z',
    },
  ],
  tasks: [
    {
      id: 'tsk-001',
      organization_id: DEFAULT_ORG_ID,
      project_id: 'prj-001',
      project_name: 'Plataforma Corporativa Integrada',
      code: 'TSK-101',
      title: 'Implementação de Políticas RLS no Supabase',
      description: 'Criar e auditar políticas de Row Level Security para todos os papéis corporativos.',
      status: 'done',
      priority: 'urgent',
      assignee_id: 'usr-001',
      assignee_name: 'Dr. Orlando Netto',
      assignee_type: 'user',
      reporter_id: 'usr-001',
      reporter_name: 'Dr. Orlando Netto',
      due_date: '2026-02-28',
      completed_at: '2026-02-25T16:00:00Z',
      created_at: '2026-01-20T08:00:00Z',
      updated_at: '2026-02-25T16:00:00Z',
    },
    {
      id: 'tsk-002',
      organization_id: DEFAULT_ORG_ID,
      project_id: 'prj-001',
      project_name: 'Plataforma Corporativa Integrada',
      code: 'TSK-102',
      title: 'Estruturação do Barramento de Agentes IA',
      description: 'Conectar agente NettosGov Sentinel aos pipelines de validação de documentos.',
      status: 'in_progress',
      priority: 'high',
      assignee_id: 'agt-001',
      assignee_name: 'NettosGov Sentinel',
      assignee_type: 'agent',
      reporter_id: 'usr-003',
      reporter_name: 'Marcus Bastos',
      due_date: '2026-03-15',
      created_at: '2026-02-05T09:00:00Z',
      updated_at: '2026-02-05T09:00:00Z',
    },
    {
      id: 'tsk-003',
      organization_id: DEFAULT_ORG_ID,
      project_id: 'prj-002',
      project_name: 'Consolidação Regimental DEC/CNS',
      code: 'TSK-201',
      title: 'Registro e Indexação das Deliberações do 1º Trimestre',
      description: 'Digitalizar e referenciar as atas CNS-2026 com os respectivos Decretos Institucionais.',
      status: 'in_progress',
      priority: 'high',
      assignee_id: 'usr-002',
      assignee_name: 'Helena Valença',
      assignee_type: 'user',
      reporter_id: 'usr-002',
      reporter_name: 'Helena Valença',
      due_date: '2026-03-20',
      created_at: '2026-02-12T14:00:00Z',
      updated_at: '2026-02-12T14:00:00Z',
    },
    {
      id: 'tsk-004',
      organization_id: DEFAULT_ORG_ID,
      project_id: 'prj-001',
      project_name: 'Plataforma Corporativa Integrada',
      code: 'TSK-103',
      title: 'Auditoria de Desempenho e Índices PostgreSQL',
      description: 'Verificar tempo de resposta em planos de execução com filtros multi-tenant.',
      status: 'todo',
      priority: 'medium',
      assignee_id: 'usr-004',
      assignee_name: 'Beatriz Lima',
      assignee_type: 'user',
      reporter_id: 'usr-003',
      reporter_name: 'Marcus Bastos',
      due_date: '2026-03-30',
      created_at: '2026-02-15T11:00:00Z',
      updated_at: '2026-02-15T11:00:00Z',
    },
    {
      id: 'tsk-005',
      organization_id: DEFAULT_ORG_ID,
      project_id: 'prj-003',
      project_name: 'Auditoria Contínua & Segurança RLS',
      code: 'TSK-301',
      title: 'Revisão da Trilha de Eventos e Auditoria Automatizada',
      description: 'Confrontar logs de autenticação e mutação com matriz de segregação de funções.',
      status: 'todo',
      priority: 'medium',
      assignee_id: 'usr-005',
      assignee_name: 'Gabriel Siqueira',
      assignee_type: 'user',
      reporter_id: 'usr-002',
      reporter_name: 'Helena Valença',
      due_date: '2026-04-10',
      created_at: '2026-02-20T15:00:00Z',
      updated_at: '2026-02-20T15:00:00Z',
    },
  ],
  decisions: [
    {
      id: 'dec-001',
      organization_id: DEFAULT_ORG_ID,
      dec_code: 'DEC-2026-001',
      title: 'Aprovação da Arquitetura de Governança Digital e Multi-Tenancy',
      summary: 'Determina a obrigatoriedade de isolamento de dados via RLS e auditoria imutável em todas as divisões corporativas.',
      rationale: 'Adequação aos padrões internacionais de governança, rastreabilidade de decisões e soberania de dados.',
      status: 'in_effect',
      decided_by: 'Conselho Consultivo NettosCorp',
      decided_by_name: 'Conselho Consultivo',
      decided_at: '2026-01-18',
      deliberation_ref_id: 'cns-001',
      deliberation_cns_code: 'CNS-2026-001',
      created_at: '2026-01-18T16:00:00Z',
      updated_at: '2026-01-18T16:00:00Z',
    },
    {
      id: 'dec-002',
      organization_id: DEFAULT_ORG_ID,
      dec_code: 'DEC-2026-002',
      title: 'Instituição do Programa de Agentes Autônomos Supervisionados',
      summary: 'Normatiza o ciclo de vida, permissões de escrita e limites operacionais para agentes de Inteligência Artificial.',
      rationale: 'Garantir que nenhum agente autônomo possua autorização desacompanhada de revisão humana qualificada.',
      status: 'in_effect',
      decided_by: 'Diretoria Executiva',
      decided_by_name: 'Diretoria Executiva',
      decided_at: '2026-02-05',
      deliberation_ref_id: 'cns-002',
      deliberation_cns_code: 'CNS-2026-002',
      created_at: '2026-02-05T14:30:00Z',
      updated_at: '2026-02-05T14:30:00Z',
    },
    {
      id: 'dec-003',
      organization_id: DEFAULT_ORG_ID,
      dec_code: 'DEC-2026-003',
      title: 'Homologação do Contrato de Integração Paperclip',
      summary: 'Aprova o protocolo de interoperabilidade de metadados com o repositório documental sem alteração de arquivos de origem.',
      rationale: 'Preservação da cadeia de custódia e integridade de registros institucionais.',
      status: 'ratified',
      decided_by: 'Comitê de Tecnologia e Compliance',
      decided_by_name: 'Comitê de Tecnologia',
      decided_at: '2026-02-22',
      deliberation_ref_id: 'cns-003',
      deliberation_cns_code: 'CNS-2026-003',
      created_at: '2026-02-22T10:00:00Z',
      updated_at: '2026-02-22T10:00:00Z',
    },
  ],
  deliberations: [
    {
      id: 'cns-001',
      organization_id: DEFAULT_ORG_ID,
      cns_code: 'CNS-2026-001',
      title: '1ª Sessão Ordinária: Diretrizes Estruturais de Governança e Tecnologia',
      session_date: '2026-01-18',
      president: 'Dr. Orlando Netto',
      quorum: '5/5 Conselheiros Titulares (Quórum Integral)',
      decision_summary: 'Aprovada por unanimidade a implantação da plataforma com autorização em nível de banco de dados (RLS).',
      status: 'approved',
      dec_ref_id: 'dec-001',
      dec_code_ref: 'DEC-2026-001',
      delib_file_ref: 'DELIB-2026-001',
      created_at: '2026-01-18T18:00:00Z',
      updated_at: '2026-01-18T18:00:00Z',
    },
    {
      id: 'cns-002',
      organization_id: DEFAULT_ORG_ID,
      cns_code: 'CNS-2026-002',
      title: '2ª Sessão Extraordinária: Marco Regulatório para Agentes de IA',
      session_date: '2026-02-05',
      president: 'Helena Valença',
      quorum: '4/5 Conselheiros Titulares',
      decision_summary: 'Regulamentadas as diretrizes operacionais de agentes autônomos e papéis com privilégio elevado.',
      status: 'approved',
      dec_ref_id: 'dec-002',
      dec_code_ref: 'DEC-2026-002',
      delib_file_ref: 'DELIB-2026-002',
      created_at: '2026-02-05T16:00:00Z',
      updated_at: '2026-02-05T16:00:00Z',
    },
    {
      id: 'cns-003',
      organization_id: DEFAULT_ORG_ID,
      cns_code: 'CNS-2026-003',
      title: '3ª Sessão Ordinária: Alinhamento de Contratos de Interoperabilidade',
      session_date: '2026-02-22',
      president: 'Dr. Orlando Netto',
      quorum: '5/5 Conselheiros Titulares',
      decision_summary: 'Ratificação formal do barramento de comunicação e auditoria com sistemas parceiros e Paperclip.',
      status: 'approved',
      dec_ref_id: 'dec-003',
      dec_code_ref: 'DEC-2026-003',
      delib_file_ref: 'DELIB-2026-003',
      created_at: '2026-02-22T12:00:00Z',
      updated_at: '2026-02-22T12:00:00Z',
    },
  ],
  documents: [
    {
      id: 'doc-001',
      organization_id: DEFAULT_ORG_ID,
      doc_type: 'DELIB',
      doc_code: 'DELIB-2026-001',
      title: 'Ata Integral da 1ª Sessão Ordinária do Conselho Consultivo',
      version: '1.0',
      status: 'published',
      file_url: '/documents/DELIB-2026-001.pdf',
      file_size_bytes: 482910,
      cns_ref: 'CNS-2026-001',
      dec_ref: 'DEC-2026-001',
      delib_ref: 'DELIB-2026-001',
      author_id: 'usr-002',
      author_name: 'Helena Valença',
      metadata: { classification: 'Estatutário', quorum_verified: true },
      created_at: '2026-01-18T19:00:00Z',
      updated_at: '2026-01-18T19:00:00Z',
    },
    {
      id: 'doc-002',
      organization_id: DEFAULT_ORG_ID,
      doc_type: 'DELIB',
      doc_code: 'DELIB-2026-002',
      title: 'Ata Integral da 2ª Sessão Extraordinária: Marco de IA',
      version: '1.0',
      status: 'published',
      file_url: '/documents/DELIB-2026-002.pdf',
      file_size_bytes: 395120,
      cns_ref: 'CNS-2026-002',
      dec_ref: 'DEC-2026-002',
      delib_ref: 'DELIB-2026-002',
      author_id: 'usr-002',
      author_name: 'Helena Valença',
      metadata: { classification: 'Operacional / Regulatória' },
      created_at: '2026-02-05T17:00:00Z',
      updated_at: '2026-02-05T17:00:00Z',
    },
    {
      id: 'doc-003',
      organization_id: DEFAULT_ORG_ID,
      doc_type: 'DEC',
      doc_code: 'DEC-DOC-2026-001',
      title: 'Instrumento Normativo de Governança Corporativa e RLS',
      version: '1.1',
      status: 'published',
      file_url: '/documents/DEC-2026-001-INSTR.pdf',
      file_size_bytes: 620400,
      cns_ref: 'CNS-2026-001',
      dec_ref: 'DEC-2026-001',
      delib_ref: 'DELIB-2026-001',
      author_id: 'usr-001',
      author_name: 'Dr. Orlando Netto',
      metadata: { legal_binding: true },
      created_at: '2026-01-19T10:00:00Z',
      updated_at: '2026-01-19T10:00:00Z',
    },
    {
      id: 'doc-004',
      organization_id: DEFAULT_ORG_ID,
      doc_type: 'POLICY',
      doc_code: 'POL-SEC-2026',
      title: 'Política Institucional de Segurança da Informação e Segregação de Funções',
      version: '2.0',
      status: 'published',
      file_url: '/documents/POL-SEC-2026.pdf',
      file_size_bytes: 840000,
      author_id: 'usr-001',
      author_name: 'Dr. Orlando Netto',
      metadata: { compliance: ['ISO27001', 'LGPD', 'SOC2'] },
      created_at: '2026-01-10T08:00:00Z',
      updated_at: '2026-01-10T08:00:00Z',
    },
  ],
  auditLogs: [
    {
      id: 'aud-001',
      organization_id: DEFAULT_ORG_ID,
      user_id: 'usr-001',
      user_email: 'admin@nettoscorp.com',
      action: 'LOGIN',
      resource: 'auth',
      resource_id: 'usr-001',
      details: { client: 'Enterprise AppShell', method: 'password' },
      ip_address: '10.0.4.12',
      created_at: '2026-02-26T08:00:00Z',
    },
    {
      id: 'aud-002',
      organization_id: DEFAULT_ORG_ID,
      user_id: 'usr-001',
      user_email: 'admin@nettoscorp.com',
      action: 'CREATE',
      resource: 'decisions',
      resource_id: 'dec-001',
      details: { dec_code: 'DEC-2026-001', title: 'Aprovação da Arquitetura de Governança' },
      ip_address: '10.0.4.12',
      created_at: '2026-02-26T08:15:00Z',
    },
    {
      id: 'aud-003',
      organization_id: DEFAULT_ORG_ID,
      user_id: 'usr-002',
      user_email: 'diretoria@nettoscorp.com',
      action: 'CREATE',
      resource: 'deliberations',
      resource_id: 'cns-001',
      details: { cns_code: 'CNS-2026-001', session_date: '2026-01-18' },
      ip_address: '10.0.4.19',
      created_at: '2026-02-26T09:00:00Z',
    },
    {
      id: 'aud-004',
      organization_id: DEFAULT_ORG_ID,
      user_id: 'usr-003',
      user_email: 'gerencia@nettoscorp.com',
      action: 'STATUS_CHANGE',
      resource: 'tasks',
      resource_id: 'tsk-001',
      details: { task_code: 'TSK-101', previous: 'in_progress', next: 'done' },
      ip_address: '10.0.4.30',
      created_at: '2026-02-26T10:30:00Z',
    },
  ],
  strategicObjectives: [
    {
      id: 'obj-001',
      code: 'OBJ-2026-01',
      title: 'Aceleração de Agentes Autônomos de Produção',
      pillar: 'Inteligência Artificial & Automação',
      target_year: 2026,
      progress_percent: 68,
      status: 'on_track',
      owner_name: 'Dr. Orlando Netto',
      key_results_count: 2,
      created_at: '2026-01-10T08:00:00Z',
    },
    {
      id: 'obj-002',
      code: 'OBJ-2026-02',
      title: 'Governança & Risco Corporativo Zero Falha',
      pillar: 'Governança & Risco',
      target_year: 2026,
      progress_percent: 84,
      status: 'on_track',
      owner_name: 'Helena Valença',
      key_results_count: 2,
      created_at: '2026-01-12T09:00:00Z',
    },
    {
      id: 'obj-003',
      code: 'OBJ-2026-03',
      title: 'Expansão de Receita B2B Enterprise & Contratos SaaS',
      pillar: 'Crescimento',
      target_year: 2026,
      progress_percent: 52,
      status: 'at_risk',
      owner_name: 'Marcus Bastos',
      key_results_count: 2,
      created_at: '2026-01-15T10:00:00Z',
    },
    {
      id: 'obj-004',
      code: 'OBJ-2026-04',
      title: 'Excelência Operacional e Redução de Latência no Runtime Hermes',
      pillar: 'Excelência Operacional',
      target_year: 2026,
      progress_percent: 75,
      status: 'on_track',
      owner_name: 'Dr. Orlando Netto',
      key_results_count: 2,
      created_at: '2026-01-20T11:00:00Z',
    },
  ],
  keyResults: [
    {
      id: 'kr-001',
      objective_id: 'obj-001',
      title: 'Implantar 10 agentes autônomos com taxa de sucesso em tarefas > 98%',
      metric: 'Agentes em Produção',
      baseline: 2,
      target: 10,
      current: 7,
      unit: 'agentes',
      progress_percent: 70,
      owner_name: 'Dr. Orlando Netto',
    },
    {
      id: 'kr-002',
      objective_id: 'obj-001',
      title: 'Alcançar 15.000 tarefas concluídas autonomamente por agentes',
      metric: 'Tarefas Finalizadas',
      baseline: 1200,
      target: 15000,
      current: 9800,
      unit: 'tarefas',
      progress_percent: 65,
      owner_name: 'Beatriz Lima',
    },
    {
      id: 'kr-003',
      objective_id: 'obj-002',
      title: '100% dos despachos DEC vinculados a pareceres CNS aprovados',
      metric: 'Conformidade Regulatória',
      baseline: 80,
      target: 100,
      current: 95,
      unit: '%',
      progress_percent: 95,
      owner_name: 'Helena Valença',
    },
    {
      id: 'kr-004',
      objective_id: 'obj-002',
      title: 'Auditoria de integridade de logs com zero discrepâncias em 12 meses',
      metric: 'Zero Falhas de Auditoria',
      baseline: 1,
      target: 0,
      current: 0,
      unit: 'falhas',
      progress_percent: 100,
      owner_name: 'Gabriel Siqueira',
    },
    {
      id: 'kr-005',
      objective_id: 'obj-003',
      title: 'Alcançar R$ 1.8M em Receita Recorrente Anual (ARR)',
      metric: 'ARR Corporativo',
      baseline: 600000,
      target: 1800000,
      current: 980000,
      unit: 'R$',
      progress_percent: 54,
      owner_name: 'Marcus Bastos',
    },
    {
      id: 'kr-006',
      objective_id: 'obj-004',
      title: 'Reduzir latência média de inferência Hermes de 850ms para 350ms',
      metric: 'Latência Hermes',
      baseline: 850,
      target: 350,
      current: 475,
      unit: 'ms',
      progress_percent: 75,
      owner_name: 'Dr. Orlando Netto',
    },
  ],
  financialTransactions: [
    {
      id: 'fin-001',
      type: 'revenue',
      category: 'Receita Recorrente SaaS',
      description: 'Mensalidade Licença Enterprise AI - Banco Safira S.A.',
      amount: 15000,
      status: 'settled',
      date: '2026-02-01',
      cost_center: 'CC-COMERCIAL',
      is_demo: true,
    },
    {
      id: 'fin-002',
      type: 'revenue',
      category: 'Contratos Consultivos',
      description: 'Honorários de Implantação Hermes Node - Apex Logistics',
      amount: 45000,
      status: 'settled',
      date: '2026-02-15',
      cost_center: 'CC-COMERCIAL',
      is_demo: true,
    },
    {
      id: 'fin-003',
      type: 'expense',
      category: 'Infraestrutura Cloud & IA',
      description: 'Cluster Cloud GPUs (Anthropic, OpenAI & Gemini APIs)',
      amount: 28400,
      status: 'settled',
      date: '2026-02-10',
      cost_center: 'CC-TECNOLOGIA',
      is_demo: true,
    },
    {
      id: 'fin-004',
      type: 'expense',
      category: 'Infraestrutura Cloud & IA',
      description: 'Hospedagem Kubernetes Dedicated & Supabase Enterprise DB',
      amount: 12800,
      status: 'settled',
      date: '2026-02-12',
      cost_center: 'CC-TECNOLOGIA',
      is_demo: true,
    },
    {
      id: 'fin-005',
      type: 'expense',
      category: 'Folha & Honorários',
      description: 'Folha de Especialistas em IA, Engenharia e Governança',
      amount: 84000,
      status: 'settled',
      date: '2026-02-05',
      cost_center: 'CC-CORPORATIVO',
      is_demo: true,
    },
    {
      id: 'fin-006',
      type: 'expense',
      category: 'Serviços Corporativos',
      description: 'Auditoria Externa de Risco e Segurança ISO/IEC 27001',
      amount: 19500,
      status: 'pending',
      date: '2026-02-28',
      cost_center: 'CC-GOVERNANCA',
      is_demo: true,
    },
  ],
  departmentBudgets: [
    {
      id: 'bdg-001',
      department_id: 'dept-001',
      department_name: 'Tecnologia & IA',
      fiscal_year: 2026,
      allocated_budget: 650000,
      consumed_budget: 380000,
      committed_budget: 45000,
    },
    {
      id: 'bdg-002',
      department_id: 'dept-002',
      department_name: 'Diretoria Executiva',
      fiscal_year: 2026,
      allocated_budget: 280000,
      consumed_budget: 145000,
      committed_budget: 20000,
    },
    {
      id: 'bdg-003',
      department_id: 'dept-003',
      department_name: 'Governança & Risco',
      fiscal_year: 2026,
      allocated_budget: 190000,
      consumed_budget: 98000,
      committed_budget: 12000,
    },
  ],
  commercialLeads: [
    {
      id: 'lead-001',
      company_name: 'Grupo Vanguarda Logística',
      contact_person: 'Carlos Drummond',
      contact_email: 'cdrummond@vanguardalog.com.br',
      stage: 'negotiation',
      deal_value: 340000,
      expected_close_date: '2026-03-15',
      owner_name: 'Marcus Bastos',
      notes: 'Proposta final de 4 agentes de orquestração de frete sob análise jurídica.',
      created_at: '2026-01-22T14:00:00Z',
    },
    {
      id: 'lead-002',
      company_name: 'FinTech Horizon Payments',
      contact_person: 'Renata Albuquerque',
      contact_email: 'renata@horizonpay.io',
      stage: 'proposal',
      deal_value: 210000,
      expected_close_date: '2026-03-30',
      owner_name: 'Beatriz Lima',
      notes: 'Apresentação técnica do Hermes Runtime aprovada; aguardando cotação de tokens.',
      created_at: '2026-02-04T10:30:00Z',
    },
    {
      id: 'lead-003',
      company_name: 'Rede D’Or Inovação Diagnóstica',
      contact_person: 'Dr. Paulo Salles',
      contact_email: 'psalles@rededor.med.br',
      stage: 'discovery',
      deal_value: 450000,
      expected_close_date: '2026-04-20',
      owner_name: 'Marcus Bastos',
      notes: 'Mapeamento de POPs clínicos para conversão em agentes de triagem.',
      created_at: '2026-02-12T16:00:00Z',
    },
    {
      id: 'lead-004',
      company_name: 'Construtora Metropolitana',
      contact_person: 'Fábio Meirelles',
      contact_email: 'fabio@metropolitanasp.com.br',
      stage: 'won',
      deal_value: 160000,
      expected_close_date: '2026-02-18',
      owner_name: 'Marcus Bastos',
      notes: 'Contrato assinado. Início de onboarding na próxima semana.',
      created_at: '2026-01-08T11:00:00Z',
    },
    {
      id: 'lead-005',
      company_name: 'Seguradora Aliança Nacional',
      contact_person: 'Mariana Prado',
      contact_email: 'mariana.prado@aliancanacional.com.br',
      stage: 'contacted',
      deal_value: 520000,
      expected_close_date: '2026-05-10',
      owner_name: 'Beatriz Lima',
      notes: 'Primeiro contato realizado via indicação do Conselho Consultivo.',
      created_at: '2026-02-20T09:15:00Z',
    },
  ],
  commercialContracts: [
    {
      id: 'ctr-001',
      contract_number: 'CTR-2026-001',
      client_name: 'Banco Safira S.A.',
      title: 'Licença Corporativa Hermes & Paperclip Sync',
      annual_value: 180000,
      status: 'active',
      start_date: '2026-02-01',
      end_date: '2027-01-31',
      governing_law: 'Foro da Comarca de São Paulo/SP',
    },
    {
      id: 'ctr-002',
      contract_number: 'CTR-2026-002',
      client_name: 'Apex Logistics Brasil',
      title: 'Orquestração Autônoma de Despachos de Frota',
      annual_value: 95000,
      status: 'active',
      start_date: '2025-11-15',
      end_date: '2026-11-14',
      governing_law: 'Foro Central do Rio de Janeiro/RJ',
    },
    {
      id: 'ctr-003',
      contract_number: 'CTR-2025-089',
      client_name: 'BioPharma Latam Group',
      title: 'Compliance Farmacêutico Regulatório (CNS Deliberações)',
      annual_value: 240000,
      status: 'renewal_pending',
      start_date: '2025-03-01',
      end_date: '2026-02-28',
      governing_law: 'Câmara de Arbitragem Brasil',
    },
  ],
  approvalRequests: [
    {
      id: 'app-001',
      code: 'APP-2026-01',
      title: 'Alocação de Cluster H100 Dedicado para Hermes Runtime',
      category: 'Orçamento',
      requester_name: 'Dr. Orlando Netto',
      approver_role: 'director',
      amount: 48000,
      status: 'pending',
      justification: 'Fine-tuning do modelo de síntese regulatória e diminuição de latência crítica em produção.',
      created_at: '2026-02-22T14:30:00Z',
    },
    {
      id: 'app-002',
      code: 'APP-2026-02',
      title: 'Homologação do Agente Sentinel v2.4 no Ambiente Live',
      category: 'Homologação de Agente',
      requester_name: 'Beatriz Lima',
      approver_role: 'manager',
      status: 'approved',
      justification: 'Testes de estresse concluídos sem alucinações e em conformidade com Deliberação CNS-2026-004.',
      created_at: '2026-02-18T10:00:00Z',
      resolved_at: '2026-02-19T11:20:00Z',
    },
    {
      id: 'app-003',
      code: 'APP-2026-03',
      title: 'Elevação de Cota de Concorrência de API Hermes para 500 RPS',
      category: 'Política de Acesso',
      requester_name: 'Marcus Bastos',
      approver_role: 'director',
      status: 'pending',
      justification: 'Suporte à carga simultânea gerada pelos agentes do portfólio durante fechamento de sprint.',
      created_at: '2026-02-25T16:00:00Z',
    },
  ],
  hermesNodes: [
    {
      node_id: 'node-01',
      hostname: 'hermes-core-alpha.nettoscorp.internal',
      status: 'online',
      version: 'hermes-v2.8.4',
      active_sessions_count: 14,
      memory_used_mb: 18450,
      cpu_percent: 42,
      model_pool: ['gemini-2.5-pro', 'claude-3-7-sonnet', 'deepseek-r1'],
      last_heartbeat: new Date().toISOString(),
      source: 'HERMES_CORE',
    },
    {
      node_id: 'node-02',
      hostname: 'hermes-worker-bravo.nettoscorp.internal',
      status: 'online',
      version: 'hermes-v2.8.4',
      active_sessions_count: 9,
      memory_used_mb: 12200,
      cpu_percent: 29,
      model_pool: ['gemini-2.5-flash', 'gpt-4o-mini'],
      last_heartbeat: new Date().toISOString(),
      source: 'HERMES_CORE',
    },
    {
      node_id: 'node-03',
      hostname: 'hermes-sandbox-edge.nettoscorp.internal',
      status: 'degraded',
      version: 'hermes-v2.8.3',
      active_sessions_count: 2,
      memory_used_mb: 7800,
      cpu_percent: 78,
      model_pool: ['qwen-2.5-coder-32b'],
      last_heartbeat: new Date().toISOString(),
      source: 'HERMES_CORE',
    },
  ],
  hermesSessions: [
    {
      id: 'ses-101',
      agent_code: 'AGT-001',
      agent_name: 'Synthex Enterprise',
      model: 'gemini-2.5-pro',
      status: 'active',
      prompt_tokens: 48200,
      completion_tokens: 12400,
      cost_usd: 0.144,
      latency_ms: 420,
      started_at: '2026-02-26T11:00:00Z',
    },
    {
      id: 'ses-102',
      agent_code: 'AGT-002',
      agent_name: 'Nexus Planner',
      model: 'claude-3-7-sonnet',
      status: 'active',
      prompt_tokens: 32100,
      completion_tokens: 8900,
      cost_usd: 0.288,
      latency_ms: 610,
      started_at: '2026-02-26T11:15:00Z',
    },
    {
      id: 'ses-103',
      agent_code: 'AGT-003',
      agent_name: 'Sentinel Compliance',
      model: 'gemini-2.5-flash',
      status: 'idle',
      prompt_tokens: 19400,
      completion_tokens: 3100,
      cost_usd: 0.019,
      latency_ms: 180,
      started_at: '2026-02-26T11:25:00Z',
    },
  ],
  hermesSkills: [
    {
      id: 'skl-001',
      name: 'Web Search & Grounding',
      code: 'hermes:grounding:web',
      category: 'Pesquisa Externa',
      description: 'Consulta factual autenticada com citações confiáveis em tempo real.',
      enabled: true,
      runtime_binding: 'native-rpc',
    },
    {
      id: 'skl-002',
      name: 'Vector RAG CNS Deliberações',
      code: 'hermes:rag:governance',
      category: 'Governança',
      description: 'Recuperação semântica indexada de atas CNS, decisões DEC e normas da NettosCorp.',
      enabled: true,
      runtime_binding: 'pgvector-cloudsql',
    },
    {
      id: 'skl-003',
      name: 'Analisador de Esquema SQL & Supabase',
      code: 'hermes:tools:schema-analyzer',
      category: 'Engenharia',
      description: 'Validação de regras RLS, integridade referencial e migrações DDL.',
      enabled: true,
      runtime_binding: 'sandbox-v8',
    },
    {
      id: 'skl-004',
      name: 'Executor de Sandbox Seguro',
      code: 'hermes:tools:code-sandbox',
      category: 'Execução de Código',
      description: 'Ambiente isolado WebAssembly para validação de scripts de automação.',
      enabled: true,
      runtime_binding: 'wasm-isolated',
    },
    {
      id: 'skl-005',
      name: 'Validador Constitucional de Tarefas',
      code: 'hermes:guardrail:constitutional',
      category: 'Alinhamento & Ética',
      description: 'Intercepta prompts e outputs antes da execução garantindo conformidade CNS.',
      enabled: true,
      runtime_binding: 'guardrail-inline',
    },
  ],
  knowledgeArticles: [
    {
      id: 'art-001',
      code: 'POP-ENG-01',
      title: 'Procedimento Operacional: Deploy de Modelos Hermes em Produção',
      category: 'Procedimentos Operacionais (POP)',
      summary: 'Passo a passo padronizado para provisionamento de novos nós de runtime Hermes e vinculação ao Paperclip.',
      content: '1. Validação de pesos e conformidade de licença.\n2. Submissão ao Sandbox de Avaliação Constitucional.\n3. Liberação de chaves pelo Gestor de Credenciais.\n4. Registro de Heartbeat no nó de Telemetria.',
      author_name: 'Dr. Orlando Netto',
      version: 'v2.1',
      updated_at: '2026-02-15T14:00:00Z',
    },
    {
      id: 'art-002',
      code: 'POP-GOV-02',
      title: 'Rito de Submissão de Decisões DEC e Homologação CNS',
      category: 'Segurança & Compliance',
      summary: 'Fluxo oficial de deliberação colegiada, quórum mínimo e publicação de documentos DELIB.',
      content: 'Toda decisão estratégica de alocação de capital ou homologação de agentes exige deliberação formal do Conselho NettosCorp com quórum mínimo de 4/5.',
      author_name: 'Helena Valença',
      version: 'v1.4',
      updated_at: '2026-02-10T11:00:00Z',
    },
    {
      id: 'art-003',
      code: 'POP-SEC-03',
      title: 'Gestão de Credenciais e Isolamento de Chaves de IA',
      category: 'Arquitetura & Engenharia',
      summary: 'Regras rigorosas para injeção de tokens de API, rotação periódica e veto total a chaves no frontend.',
      content: 'Nenhuma chave de LLM deve ser renderizada em código cliente. Todos os acessos devem transitar pelo proxy de runtime Hermes com autorização por papel.',
      author_name: 'Gabriel Siqueira',
      version: 'v3.0',
      updated_at: '2026-02-01T09:30:00Z',
    },
    {
      id: 'art-004',
      code: 'POP-RH-04',
      title: 'Normas de Atribuição de Agentes Autônomos como Executores de Tarefas',
      category: 'Políticas de Pessoal',
      summary: 'Critérios de supervisão humana (human-in-the-loop) para tarefas com impacto financeiro ou de governança.',
      content: 'Tarefas classificadas como "Urgent" ou com impacto financeiro > R$ 10.000 exigem obrigatoriamente um revisor humano designado no papel Manager ou Director.',
      author_name: 'Marcus Bastos',
      version: 'v1.2',
      updated_at: '2026-01-28T16:45:00Z',
    },
  ],
};

class LocalSupabaseStore {
  private data: StorageSchema;
  private currentSession: UserProfile | null = null;
  private listeners: Array<() => void> = [];

  constructor() {
    this.data = this.loadData();
    this.currentSession = this.loadSession();
  }

  private loadData(): StorageSchema {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Merge with INITIAL_DATA to ensure newly added domains are always populated
        return {
          ...INITIAL_DATA,
          ...parsed,
          strategicObjectives: parsed.strategicObjectives || INITIAL_DATA.strategicObjectives,
          keyResults: parsed.keyResults || INITIAL_DATA.keyResults,
          financialTransactions: parsed.financialTransactions || INITIAL_DATA.financialTransactions,
          departmentBudgets: parsed.departmentBudgets || INITIAL_DATA.departmentBudgets,
          commercialLeads: parsed.commercialLeads || INITIAL_DATA.commercialLeads,
          commercialContracts: parsed.commercialContracts || INITIAL_DATA.commercialContracts,
          approvalRequests: parsed.approvalRequests || INITIAL_DATA.approvalRequests,
          hermesNodes: parsed.hermesNodes || INITIAL_DATA.hermesNodes,
          hermesSessions: parsed.hermesSessions || INITIAL_DATA.hermesSessions,
          hermesSkills: parsed.hermesSkills || INITIAL_DATA.hermesSkills,
          knowledgeArticles: parsed.knowledgeArticles || INITIAL_DATA.knowledgeArticles,
          agencyAgentProfiles: parsed.agencyAgentProfiles || INITIAL_DATA.agencyAgentProfiles,
          agencyAgentSelections: parsed.agencyAgentSelections || INITIAL_DATA.agencyAgentSelections,
          agencyAgentHomologations: parsed.agencyAgentHomologations || INITIAL_DATA.agencyAgentHomologations,
        };
      }
    } catch {
      // ignore
    }
    this.saveData(INITIAL_DATA);
    return INITIAL_DATA;
  }

  private saveData(data: StorageSchema): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      this.notify();
    } catch {
      // storage quota or unavailable
    }
  }

  private loadSession(): UserProfile | null {
    try {
      const stored = localStorage.getItem(SESSION_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // ignore
    }
    // Default to Super Admin for seamless immediate evaluation
    const defaultUser = this.data.profiles[0] || null;
    if (defaultUser) {
      this.saveSession(defaultUser);
    }
    return defaultUser;
  }

  private saveSession(user: UserProfile | null): void {
    this.currentSession = user;
    try {
      if (user) {
        localStorage.setItem(SESSION_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(SESSION_KEY);
      }
      this.notify();
    } catch {
      // ignore
    }
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify(): void {
    this.listeners.forEach(l => l());
  }

  // Session & Auth
  public getSessionUser(): UserProfile | null {
    return this.currentSession;
  }

  public setSessionUser(user: UserProfile | null): void {
    this.saveSession(user);
    if (user) {
      this.logAudit({
        user_id: user.id,
        user_email: user.email,
        action: 'LOGIN',
        resource: 'auth',
        details: { role: user.role, name: user.full_name },
      });
    }
  }

  public switchRole(role: UserRole): UserProfile {
    if (!this.currentSession) {
      this.currentSession = this.data.profiles[0];
    }
    const updated = { ...this.currentSession, role };
    // update in profiles list
    this.data.profiles = this.data.profiles.map(p => p.id === updated.id ? updated : p);
    this.saveData(this.data);
    this.saveSession(updated);
    this.logAudit({
      user_id: updated.id,
      user_email: updated.email,
      action: 'PERM_CHANGE',
      resource: 'profiles',
      resource_id: updated.id,
      details: { new_role: role },
    });
    return updated;
  }

  public logAudit(entry: Omit<AuditLog, 'id' | 'organization_id' | 'created_at'>): AuditLog {
    const orgId = this.currentSession?.organization_id || DEFAULT_ORG_ID;
    const log: AuditLog = {
      id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      organization_id: orgId,
      created_at: new Date().toISOString(),
      ip_address: '10.0.4.1',
      ...entry,
    };
    this.data.auditLogs.unshift(log);
    // Keep max 200 logs
    if (this.data.auditLogs.length > 200) {
      this.data.auditLogs.pop();
    }
    this.saveData(this.data);
    return log;
  }

  // Generic Getters
  public getOrganizations(): Organization[] {
    return this.data.organizations;
  }

  public getProfiles(): UserProfile[] {
    return this.data.profiles;
  }

  public getDepartments(): Department[] {
    return this.data.departments;
  }

  public getPositions(): Position[] {
    return this.data.positions;
  }

  public getAgents(): AIAgent[] {
    return this.data.agents;
  }

  public getAgencyAgentProfiles(): AgencyAgentProfile[] {
    return this.data.agencyAgentProfiles || [];
  }

  public getAgencyAgentProfileById(id: string): AgencyAgentProfile | undefined {
    return (this.data.agencyAgentProfiles || []).find(p => p.id === id);
  }

  public getAgencyAgentProfileByCode(code: string): AgencyAgentProfile | undefined {
    return (this.data.agencyAgentProfiles || []).find(p => p.code === code);
  }

  public setAgencyAgentProfiles(updater: (prev: AgencyAgentProfile[]) => AgencyAgentProfile[]): void {
    this.data.agencyAgentProfiles = updater(this.data.agencyAgentProfiles || []);
    this.saveData(this.data);
  }

  public getAgencyAgentSelections(): AgencyAgentSelection[] {
    return this.data.agencyAgentSelections || [];
  }

  public setAgencyAgentSelections(updater: (prev: AgencyAgentSelection[]) => AgencyAgentSelection[]): void {
    this.data.agencyAgentSelections = updater(this.data.agencyAgentSelections || []);
    this.saveData(this.data);
  }

  public getAgencyAgentHomologations(): AgencyAgentHomologation[] {
    return this.data.agencyAgentHomologations || [];
  }

  public setAgencyAgentHomologations(updater: (prev: AgencyAgentHomologation[]) => AgencyAgentHomologation[]): void {
    this.data.agencyAgentHomologations = updater(this.data.agencyAgentHomologations || []);
    this.saveData(this.data);
  }

  public getProjects(): Project[] {
    return this.data.projects;
  }

  public getTasks(): Task[] {
    return this.data.tasks;
  }

  public getDecisions(): Decision[] {
    return this.data.decisions;
  }

  public getDeliberations(): Deliberation[] {
    return this.data.deliberations;
  }

  public getDocuments(): GovernanceDocument[] {
    return this.data.documents;
  }

  public getAuditLogs(): AuditLog[] {
    return this.data.auditLogs;
  }

  // Mutations
  public updateDepartments(updater: (prev: Department[]) => Department[]): void {
    this.data.departments = updater(this.data.departments);
    this.saveData(this.data);
  }

  public updatePositions(updater: (prev: Position[]) => Position[]): void {
    this.data.positions = updater(this.data.positions);
    this.saveData(this.data);
  }

  public updateProfiles(updater: (prev: UserProfile[]) => UserProfile[]): void {
    this.data.profiles = updater(this.data.profiles);
    this.saveData(this.data);
  }

  public updateAgents(updater: (prev: AIAgent[]) => AIAgent[]): void {
    this.data.agents = updater(this.data.agents);
    this.saveData(this.data);
  }

  public updateProjects(updater: (prev: Project[]) => Project[]): void {
    this.data.projects = updater(this.data.projects);
    this.saveData(this.data);
  }

  public updateTasks(updater: (prev: Task[]) => Task[]): void {
    this.data.tasks = updater(this.data.tasks);
    this.saveData(this.data);
  }

  public updateDecisions(updater: (prev: Decision[]) => Decision[]): void {
    this.data.decisions = updater(this.data.decisions);
    this.saveData(this.data);
  }

  public updateDeliberations(updater: (prev: Deliberation[]) => Deliberation[]): void {
    this.data.deliberations = updater(this.data.deliberations);
    this.saveData(this.data);
  }

  public updateDocuments(updater: (prev: GovernanceDocument[]) => GovernanceDocument[]): void {
    this.data.documents = updater(this.data.documents);
    this.saveData(this.data);
  }

  // Getters for Strategy, Financial, Commercial, Operations, Hermes, Knowledge
  public getStrategicObjectives(): StrategicObjective[] {
    return this.data.strategicObjectives || [];
  }

  public getKeyResults(): KeyResult[] {
    return this.data.keyResults || [];
  }

  public getFinancialTransactions(): FinancialTransaction[] {
    return this.data.financialTransactions || [];
  }

  public getDepartmentBudgets(): DepartmentBudget[] {
    return this.data.departmentBudgets || [];
  }

  public getCommercialLeads(): CommercialLead[] {
    return this.data.commercialLeads || [];
  }

  public getCommercialContracts(): CommercialContract[] {
    return this.data.commercialContracts || [];
  }

  public getApprovalRequests(): ApprovalRequest[] {
    return this.data.approvalRequests || [];
  }

  public getHermesNodes(): HermesRuntimeNode[] {
    return this.data.hermesNodes || [];
  }

  public getHermesSessions(): HermesAgentSession[] {
    return this.data.hermesSessions || [];
  }

  public getHermesSkills(): HermesSkill[] {
    return this.data.hermesSkills || [];
  }

  public getKnowledgeArticles(): KnowledgeArticle[] {
    return this.data.knowledgeArticles || [];
  }

  // Mutations for new domains
  public updateStrategicObjectives(updater: (prev: StrategicObjective[]) => StrategicObjective[]): void {
    this.data.strategicObjectives = updater(this.data.strategicObjectives || []);
    this.saveData(this.data);
  }

  public updateKeyResults(updater: (prev: KeyResult[]) => KeyResult[]): void {
    this.data.keyResults = updater(this.data.keyResults || []);
    this.saveData(this.data);
  }

  public updateFinancialTransactions(updater: (prev: FinancialTransaction[]) => FinancialTransaction[]): void {
    this.data.financialTransactions = updater(this.data.financialTransactions || []);
    this.saveData(this.data);
  }

  public updateDepartmentBudgets(updater: (prev: DepartmentBudget[]) => DepartmentBudget[]): void {
    this.data.departmentBudgets = updater(this.data.departmentBudgets || []);
    this.saveData(this.data);
  }

  public updateCommercialLeads(updater: (prev: CommercialLead[]) => CommercialLead[]): void {
    this.data.commercialLeads = updater(this.data.commercialLeads || []);
    this.saveData(this.data);
  }

  public updateCommercialContracts(updater: (prev: CommercialContract[]) => CommercialContract[]): void {
    this.data.commercialContracts = updater(this.data.commercialContracts || []);
    this.saveData(this.data);
  }

  public updateApprovalRequests(updater: (prev: ApprovalRequest[]) => ApprovalRequest[]): void {
    this.data.approvalRequests = updater(this.data.approvalRequests || []);
    this.saveData(this.data);
  }

  public updateHermesNodes(updater: (prev: HermesRuntimeNode[]) => HermesRuntimeNode[]): void {
    this.data.hermesNodes = updater(this.data.hermesNodes || []);
    this.saveData(this.data);
  }

  public updateHermesSessions(updater: (prev: HermesAgentSession[]) => HermesAgentSession[]): void {
    this.data.hermesSessions = updater(this.data.hermesSessions || []);
    this.saveData(this.data);
  }

  public updateHermesSkills(updater: (prev: HermesSkill[]) => HermesSkill[]): void {
    this.data.hermesSkills = updater(this.data.hermesSkills || []);
    this.saveData(this.data);
  }

  public updateKnowledgeArticles(updater: (prev: KnowledgeArticle[]) => KnowledgeArticle[]): void {
    this.data.knowledgeArticles = updater(this.data.knowledgeArticles || []);
    this.saveData(this.data);
  }
}

export const localStore = new LocalSupabaseStore();
