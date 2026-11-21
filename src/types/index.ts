/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole =
  | 'super_admin'
  | 'admin'
  | 'director'
  | 'manager'
  | 'member'
  | 'viewer';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  role: UserRole;
  organization_id: string;
  department_id?: string;
  position_id?: string;
  status: 'active' | 'suspended' | 'invited';
  created_at: string;
  updated_at: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  domain: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface Department {
  id: string;
  organization_id: string;
  code: string;
  name: string;
  description: string;
  manager_id?: string;
  manager_name?: string;
  parent_id?: string;
  status: 'active' | 'inactive';
  headcount?: number;
  created_at: string;
  updated_at: string;
}

export interface Position {
  id: string;
  organization_id: string;
  department_id: string;
  department_name?: string;
  title: string;
  code: string;
  level: string; // e.g., 'C-Level', 'Diretoria', 'Gerência', 'Especialista', 'Operacional'
  description: string;
  created_at: string;
  updated_at: string;
}

export interface OrganizationMembership {
  id: string;
  organization_id: string;
  user_id: string;
  department_id?: string;
  position_id?: string;
  role: UserRole;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface RolePermission {
  id: string;
  role: UserRole;
  resource: string; // 'projects' | 'tasks' | 'agents' | 'decisions' | 'deliberations' | 'documents' | 'users' | 'audit' | 'settings'
  action: 'create' | 'read' | 'update' | 'delete' | 'manage';
  conditions?: Record<string, unknown>;
}

export type AgentStatus = 'active' | 'standby' | 'training' | 'disabled';

export interface AIAgent {
  id: string;
  organization_id: string;
  code: string;
  name: string;
  model: string;
  purpose: string;
  status: AgentStatus;
  version: string;
  assigned_department_id?: string;
  department_name?: string;
  config: {
    temperature?: number;
    max_tokens?: number;
    system_prompt?: string;
    capabilities?: string[];
  };
  created_at: string;
  updated_at: string;
}

export type ProjectStatus = 'planning' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled';
export type PriorityLevel = 'low' | 'medium' | 'high' | 'urgent';

export interface Project {
  id: string;
  organization_id: string;
  department_id: string;
  department_name?: string;
  code: string;
  name: string;
  description: string;
  status: ProjectStatus;
  priority: PriorityLevel;
  lead_id?: string;
  lead_name?: string;
  start_date: string;
  due_date: string;
  budget: number;
  created_at: string;
  updated_at: string;
}

export interface ProjectMember {
  id: string;
  project_id: string;
  user_id: string;
  user_name?: string;
  user_email?: string;
  role: 'lead' | 'contributor' | 'reviewer';
  joined_at: string;
}

export type TaskStatus = 'todo' | 'in_progress' | 'in_review' | 'done' | 'blocked';

export interface Task {
  id: string;
  organization_id: string;
  project_id: string;
  project_name?: string;
  code: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: PriorityLevel;
  assignee_id?: string;
  assignee_name?: string;
  assignee_type?: 'user' | 'agent';
  reporter_id: string;
  reporter_name?: string;
  due_date: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface TaskAssignment {
  id: string;
  task_id: string;
  assignee_id: string;
  assignee_type: 'user' | 'agent';
  assigned_at: string;
}

export type DecisionStatus = 'draft' | 'ratified' | 'in_effect' | 'superseded' | 'revoked';

export interface Decision {
  id: string;
  organization_id: string;
  dec_code: string; // e.g. "DEC-2026-001"
  title: string;
  summary: string;
  rationale: string;
  status: DecisionStatus;
  decided_by: string; // User ID or body title
  decided_by_name?: string;
  decided_at: string;
  deliberation_ref_id?: string; // Cross-reference to CNS
  deliberation_cns_code?: string;
  created_at: string;
  updated_at: string;
}

export type DeliberationStatus = 'convened' | 'approved' | 'rejected' | 'adjourned';

export interface Deliberation {
  id: string;
  organization_id: string;
  cns_code: string; // e.g. "CNS-2026-004"
  title: string;
  session_date: string;
  president: string;
  quorum: string; // e.g. "5/5 Conselheiros Titulares"
  decision_summary: string;
  status: DeliberationStatus;
  dec_ref_id?: string; // Cross-reference to DEC
  dec_code_ref?: string;
  delib_file_ref?: string; // Cross-reference to DELIB document
  created_at: string;
  updated_at: string;
}

export type DocumentType = 'CNS' | 'DEC' | 'DELIB' | 'POLICY' | 'REPORT';
export type DocumentStatus = 'draft' | 'published' | 'archived';

export interface GovernanceDocument {
  id: string;
  organization_id: string;
  doc_type: DocumentType;
  doc_code: string; // e.g. "DELIB-2026-012"
  title: string;
  version: string;
  status: DocumentStatus;
  file_url?: string;
  file_size_bytes?: number;
  cns_ref?: string; // Cross-reference code
  dec_ref?: string; // Cross-reference code
  delib_ref?: string; // Cross-reference code
  metadata?: Record<string, unknown>;
  author_id?: string;
  author_name?: string;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  organization_id: string;
  user_id: string;
  user_email: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'PASSWORD_RESET' | 'STATUS_CHANGE' | 'PERM_CHANGE';
  resource: string;
  resource_id?: string;
  details: Record<string, unknown>;
  ip_address?: string;
  created_at: string;
}

export interface DashboardMetrics {
  total_projects: number;
  in_progress_projects: number;
  total_agents: number;
  active_agents: number;
  pending_tasks: number;
  completed_tasks: number;
  total_decisions: number;
  total_deliberations: number;
  total_documents: number;
  total_departments: number;
  total_members: number;
  recent_activities: AuditLog[];
}

// =====================================================================
// ESTRATÉGIA E PLANEJAMENTO (OKRs & METAS)
// =====================================================================

export interface StrategicObjective {
  id: string;
  code: string;
  title: string;
  pillar: 'Crescimento' | 'Excelência Operacional' | 'Governança & Risco' | 'Inteligência Artificial & Automação';
  target_year: number;
  progress_percent: number;
  status: 'on_track' | 'at_risk' | 'behind' | 'achieved';
  owner_name: string;
  key_results_count: number;
  created_at: string;
}

export interface KeyResult {
  id: string;
  objective_id: string;
  title: string;
  metric: string;
  baseline: number;
  target: number;
  current: number;
  unit: string;
  progress_percent: number;
  owner_name: string;
}

// =====================================================================
// FINANCEIRO (RECEITAS, DESPESAS, FLUXO DE CAIXA, CUSTOS IA)
// =====================================================================

export interface FinancialTransaction {
  id: string;
  type: 'revenue' | 'expense';
  category: 'Infraestrutura Cloud & IA' | 'Folha & Honorários' | 'Serviços Corporativos' | 'Receita Recorrente SaaS' | 'Contratos Consultivos';
  description: string;
  amount: number;
  status: 'settled' | 'pending' | 'projected';
  date: string;
  cost_center: string;
  is_demo: boolean;
}

export interface DepartmentBudget {
  id: string;
  department_id: string;
  department_name: string;
  fiscal_year: number;
  allocated_budget: number;
  consumed_budget: number;
  committed_budget: number;
}

// =====================================================================
// COMERCIAL & CRM
// =====================================================================

export type LeadStage = 'new' | 'contacted' | 'discovery' | 'proposal' | 'negotiation' | 'won' | 'lost';

export interface CommercialLead {
  id: string;
  company_name: string;
  contact_person: string;
  contact_email: string;
  stage: LeadStage;
  deal_value: number;
  expected_close_date: string;
  owner_name: string;
  notes: string;
  created_at: string;
}

export interface CommercialContract {
  id: string;
  contract_number: string;
  client_name: string;
  title: string;
  annual_value: number;
  status: 'active' | 'renewal_pending' | 'draft' | 'concluded';
  start_date: string;
  end_date: string;
  governing_law: string;
}

// =====================================================================
// OPERAÇÕES & APROVAÇÕES
// =====================================================================

export interface ApprovalRequest {
  id: string;
  code: string;
  title: string;
  category: 'Orçamento' | 'Contratação' | 'Política de Acesso' | 'Homologação de Agente' | 'Lançamento de Versão';
  requester_name: string;
  approver_role: UserRole;
  amount?: number;
  status: 'pending' | 'approved' | 'rejected';
  justification: string;
  created_at: string;
  resolved_at?: string;
}

// =====================================================================
// HERMES RUNTIME & IA METRICS
// =====================================================================

export interface HermesRuntimeNode {
  node_id: string;
  hostname: string;
  status: 'online' | 'degraded' | 'offline';
  version: string;
  active_sessions_count: number;
  memory_used_mb: number;
  cpu_percent: number;
  model_pool: string[];
  last_heartbeat: string;
  source: 'HERMES_CORE';
}

export interface HermesAgentSession {
  id: string;
  agent_code: string;
  agent_name: string;
  model: string;
  status: 'active' | 'idle' | 'terminated';
  prompt_tokens: number;
  completion_tokens: number;
  cost_usd: number;
  latency_ms: number;
  started_at: string;
}

export interface HermesSkill {
  id: string;
  name: string;
  code: string;
  category: string;
  description: string;
  enabled: boolean;
  runtime_binding: string;
}

// =====================================================================
// BASE DE CONHECIMENTO & POPs
// =====================================================================

export interface KnowledgeArticle {
  id: string;
  code: string;
  title: string;
  category: 'Procedimentos Operacionais (POP)' | 'Arquitetura & Engenharia' | 'Segurança & Compliance' | 'Políticas de Pessoal';
  summary: string;
  content: string;
  author_name: string;
  version: string;
  updated_at: string;
}

// =====================================================================
// CATÁLOGO & INTELIGÊNCIA DE AGENTES (AGENCY-AGENTS)
// =====================================================================

export type AgencyAgentCategory =
  | 'design'
  | 'engineering'
  | 'game-development'
  | 'marketing'
  | 'paid-media'
  | 'product'
  | 'project-management'
  | 'sales'
  | 'spatial-computing'
  | 'specialized'
  | 'strategy'
  | 'support'
  | 'testing'
  | 'operations'
  | 'technology'
  | 'governance'
  | 'finance'
  | 'human-resources'
  | 'legal'
  | 'research'
  | 'security'
  | 'compliance'
  | 'data'
  | 'infrastructure'
  | 'customer-success'
  | 'communications'
  | 'other';

export type AgencyAgentStatus = 'disponivel' | 'em_avaliacao' | 'homologado' | 'nao_recomendado';

export type AgencyAgentSpecialty = string;

export interface AgencyAgentProfile {
  id: string;
  organization_id: string;
  category: AgencyAgentCategory;
  specialty: AgencyAgentSpecialty;
  name: string;
  code: string;
  identity: string;
  specialty_description: string;
  competencies: string[];
  personality: string;
  responsibilities: string[];
  methodology: string;
  status: AgencyAgentStatus;
  homologated_at?: string;
  homologated_by?: string;
  homologation_notes?: string;
  source_file: string;
  source_hash: string;
  created_at: string;
  updated_at: string;
}

export interface AgencyAgentSelection {
  id: string;
  organization_id: string;
  project_name: string;
  purpose: string;
  profile_id: string;
  profile_code?: string;
  selected_by: string;
  selected_by_name?: string;
  selected_at: string;
  status: 'planejado' | 'ativo' | 'concluído' | 'cancelado';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface AgencyAgentHomologation {
  id: string;
  organization_id: string;
  profile_id: string;
  profile_code?: string;
  status: AgencyAgentStatus;
  reviewed_by: string;
  reviewed_by_name?: string;
  reviewed_at: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}
