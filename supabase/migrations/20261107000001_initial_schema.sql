-- =====================================================================
-- NETTOSCORP ENTERPRISE PLATFORM
-- Initial Database Migration with Row Level Security (RLS)
-- Version: 20261107000001
-- =====================================================================

-- 1. Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Enumerated types
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM (
        'super_admin',
        'admin',
        'director',
        'manager',
        'member',
        'viewer'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE agent_status AS ENUM (
        'active',
        'standby',
        'training',
        'disabled'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE project_status AS ENUM (
        'planning',
        'in_progress',
        'on_hold',
        'completed',
        'cancelled'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE priority_level AS ENUM (
        'low',
        'medium',
        'high',
        'urgent'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE task_status AS ENUM (
        'todo',
        'in_progress',
        'in_review',
        'done',
        'blocked'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE decision_status AS ENUM (
        'draft',
        'ratified',
        'in_effect',
        'superseded',
        'revoked'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE deliberation_status AS ENUM (
        'convened',
        'approved',
        'rejected',
        'adjourned'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE document_type AS ENUM (
        'CNS',
        'DEC',
        'DELIB',
        'POLICY',
        'REPORT'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. Utility Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================================
-- 4. IDENTIDADE E ORGANIZAÇÃO
-- =====================================================================

-- 4.1 Organizações (Multi-tenant base)
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    domain VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4.2 Perfis de Usuário (Integrado com Supabase Auth)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    role user_role NOT NULL DEFAULT 'member',
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
    department_id UUID,
    position_id UUID,
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4.3 Departamentos
CREATE TABLE IF NOT EXISTS departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    manager_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    parent_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (organization_id, code)
);

-- 4.4 Cargos e Posições
CREATE TABLE IF NOT EXISTS positions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL,
    level VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (organization_id, code)
);

-- Adicionar chaves estrangeiras em profiles após criar tabelas
ALTER TABLE profiles 
    ADD CONSTRAINT fk_profiles_department 
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL;

ALTER TABLE profiles 
    ADD CONSTRAINT fk_profiles_position 
    FOREIGN KEY (position_id) REFERENCES positions(id) ON DELETE SET NULL;

-- 4.5 Associação Membro-Organização
CREATE TABLE IF NOT EXISTS organization_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    position_id UUID REFERENCES positions(id) ON DELETE SET NULL,
    role user_role NOT NULL DEFAULT 'member',
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (organization_id, user_id)
);

-- 4.6 Matriz de Permissões por Papel
CREATE TABLE IF NOT EXISTS role_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role user_role NOT NULL,
    resource VARCHAR(100) NOT NULL,
    action VARCHAR(50) NOT NULL,
    conditions JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (role, resource, action)
);

-- =====================================================================
-- 5. OPERAÇÃO
-- =====================================================================

-- 5.1 Agentes de IA
CREATE TABLE IF NOT EXISTS agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    model VARCHAR(100) NOT NULL,
    purpose TEXT NOT NULL,
    status agent_status NOT NULL DEFAULT 'standby',
    version VARCHAR(50) NOT NULL DEFAULT '1.0.0',
    assigned_department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    config JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (organization_id, code)
);

-- 5.2 Projetos
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    department_id UUID NOT NULL REFERENCES departments(id) ON DELETE RESTRICT,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status project_status NOT NULL DEFAULT 'planning',
    priority priority_level NOT NULL DEFAULT 'medium',
    lead_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    start_date DATE NOT NULL,
    due_date DATE NOT NULL,
    budget NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (organization_id, code)
);

-- 5.3 Membros do Projeto
CREATE TABLE IF NOT EXISTS project_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL DEFAULT 'contributor',
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (project_id, user_id)
);

-- 5.4 Tarefas
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status task_status NOT NULL DEFAULT 'todo',
    priority priority_level NOT NULL DEFAULT 'medium',
    assignee_id UUID,
    assignee_type VARCHAR(20) DEFAULT 'user',
    reporter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    due_date DATE NOT NULL,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (organization_id, code)
);

-- 5.5 Atribuições de Tarefas (Suporta humanos e Agentes IA)
CREATE TABLE IF NOT EXISTS task_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    assignee_id UUID NOT NULL,
    assignee_type VARCHAR(20) NOT NULL DEFAULT 'user',
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================================
-- 6. GOVERNANÇA CORPORATIVA (DEC, CNS, DELIB)
-- =====================================================================

-- 6.1 Decisões Institucionais (Registro DEC)
CREATE TABLE IF NOT EXISTS decisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    dec_code VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    summary TEXT NOT NULL,
    rationale TEXT NOT NULL,
    status decision_status NOT NULL DEFAULT 'draft',
    decided_by VARCHAR(255) NOT NULL,
    decided_at DATE NOT NULL DEFAULT CURRENT_DATE,
    deliberation_ref_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (organization_id, dec_code)
);

-- 6.2 Deliberações do Conselheiro (Registro CNS)
CREATE TABLE IF NOT EXISTS deliberations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    cns_code VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    session_date DATE NOT NULL DEFAULT CURRENT_DATE,
    president VARCHAR(255) NOT NULL,
    quorum VARCHAR(255) NOT NULL,
    decision_summary TEXT NOT NULL,
    status deliberation_status NOT NULL DEFAULT 'convened',
    dec_ref_id UUID REFERENCES decisions(id) ON DELETE SET NULL,
    delib_file_ref VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (organization_id, cns_code)
);

-- Chave recíproca de decisões para deliberações
ALTER TABLE decisions
    ADD CONSTRAINT fk_decisions_deliberation
    FOREIGN KEY (deliberation_ref_id) REFERENCES deliberations(id) ON DELETE SET NULL;

-- 6.3 Documentação Institucional (DELIB, Políticas, Relatórios)
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    doc_type document_type NOT NULL DEFAULT 'DELIB',
    doc_code VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    version VARCHAR(20) NOT NULL DEFAULT '1.0',
    status VARCHAR(50) NOT NULL DEFAULT 'published',
    file_url TEXT,
    file_size_bytes BIGINT,
    cns_ref VARCHAR(50),
    dec_ref VARCHAR(50),
    delib_ref VARCHAR(50),
    metadata JSONB DEFAULT '{}'::jsonb,
    author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (organization_id, doc_code)
);

-- 6.4 Histórico de Auditoria Imutável
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    action VARCHAR(50) NOT NULL,
    resource VARCHAR(100) NOT NULL,
    resource_id UUID,
    details JSONB NOT NULL DEFAULT '{}'::jsonb,
    ip_address VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================================
-- 7. ÍNDICES DE PERFORMANCE E CONSULTA
-- =====================================================================

CREATE INDEX IF NOT EXISTS idx_profiles_org ON profiles(organization_id);
CREATE INDEX IF NOT EXISTS idx_departments_org ON departments(organization_id);
CREATE INDEX IF NOT EXISTS idx_positions_dept ON positions(department_id);
CREATE INDEX IF NOT EXISTS idx_agents_status ON agents(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_tasks_proj_status ON tasks(project_id, status);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON tasks(assignee_id);
CREATE INDEX IF NOT EXISTS idx_decisions_code ON decisions(organization_id, dec_code);
CREATE INDEX IF NOT EXISTS idx_deliberations_code ON deliberations(organization_id, cns_code);
CREATE INDEX IF NOT EXISTS idx_documents_refs ON documents(cns_ref, dec_ref, delib_ref);
CREATE INDEX IF NOT EXISTS idx_audit_logs_org_date ON audit_logs(organization_id, created_at DESC);

-- =====================================================================
-- 8. TRIGGERS DE ATUALIZAÇÃO AUTOMÁTICA
-- =====================================================================

CREATE TRIGGER update_organizations_modtime BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_profiles_modtime BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_departments_modtime BEFORE UPDATE ON departments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_positions_modtime BEFORE UPDATE ON positions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_agents_modtime BEFORE UPDATE ON agents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_modtime BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasks_modtime BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_decisions_modtime BEFORE UPDATE ON decisions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_deliberations_modtime BEFORE UPDATE ON deliberations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_documents_modtime BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================================
-- 9. SEGURANÇA E POLÍTICAS RLS (ROW LEVEL SECURITY)
-- =====================================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliberations ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function para obter o perfil e organização do usuário autenticado
CREATE OR REPLACE FUNCTION get_current_user_profile()
RETURNS TABLE (
    user_id UUID,
    org_id UUID,
    user_role user_role
) SECURITY DEFINER STABLE AS $$
    SELECT id, organization_id, role
    FROM profiles
    WHERE id = auth.uid()
    LIMIT 1;
$$ LANGUAGE sql;

-- Políticas de Profiles
CREATE POLICY "profiles_read_own_org" ON profiles
    FOR SELECT TO authenticated
    USING (organization_id IN (SELECT org_id FROM get_current_user_profile()));

CREATE POLICY "profiles_update_self_or_admin" ON profiles
    FOR UPDATE TO authenticated
    USING (
        id = auth.uid() 
        OR (SELECT user_role FROM get_current_user_profile()) IN ('super_admin', 'admin')
    );

-- Políticas de Departamentos
CREATE POLICY "departments_read_all" ON departments
    FOR SELECT TO authenticated
    USING (organization_id IN (SELECT org_id FROM get_current_user_profile()));

CREATE POLICY "departments_write_admin_director" ON departments
    FOR ALL TO authenticated
    USING (
        (SELECT user_role FROM get_current_user_profile()) IN ('super_admin', 'admin', 'director')
    );

-- Políticas de Projetos
CREATE POLICY "projects_read_org" ON projects
    FOR SELECT TO authenticated
    USING (organization_id IN (SELECT org_id FROM get_current_user_profile()));

CREATE POLICY "projects_write_manager_above" ON projects
    FOR ALL TO authenticated
    USING (
        (SELECT user_role FROM get_current_user_profile()) IN ('super_admin', 'admin', 'director', 'manager')
    );

-- Políticas de Tarefas
CREATE POLICY "tasks_read_org" ON tasks
    FOR SELECT TO authenticated
    USING (organization_id IN (SELECT org_id FROM get_current_user_profile()));

CREATE POLICY "tasks_insert_member_above" ON tasks
    FOR INSERT TO authenticated
    WITH CHECK (
        (SELECT user_role FROM get_current_user_profile()) IN ('super_admin', 'admin', 'director', 'manager', 'member')
    );

CREATE POLICY "tasks_update_assignee_or_manager" ON tasks
    FOR UPDATE TO authenticated
    USING (
        assignee_id = auth.uid()
        OR reporter_id = auth.uid()
        OR (SELECT user_role FROM get_current_user_profile()) IN ('super_admin', 'admin', 'director', 'manager')
    );

-- Políticas de Governança (DEC, CNS, DELIB)
CREATE POLICY "decisions_read_all" ON decisions
    FOR SELECT TO authenticated
    USING (organization_id IN (SELECT org_id FROM get_current_user_profile()));

CREATE POLICY "decisions_write_director_above" ON decisions
    FOR ALL TO authenticated
    USING (
        (SELECT user_role FROM get_current_user_profile()) IN ('super_admin', 'admin', 'director')
    );

CREATE POLICY "deliberations_read_all" ON deliberations
    FOR SELECT TO authenticated
    USING (organization_id IN (SELECT org_id FROM get_current_user_profile()));

CREATE POLICY "deliberations_write_director_above" ON deliberations
    FOR ALL TO authenticated
    USING (
        (SELECT user_role FROM get_current_user_profile()) IN ('super_admin', 'admin', 'director')
    );

CREATE POLICY "documents_read_all" ON documents
    FOR SELECT TO authenticated
    USING (organization_id IN (SELECT org_id FROM get_current_user_profile()));

CREATE POLICY "documents_write_manager_above" ON documents
    FOR ALL TO authenticated
    USING (
        (SELECT user_role FROM get_current_user_profile()) IN ('super_admin', 'admin', 'director', 'manager')
    );

-- Políticas de Auditoria: Apenas leitura para administradores e diretores; Inserção permitida para todo usuário logado
CREATE POLICY "audit_read_admin" ON audit_logs
    FOR SELECT TO authenticated
    USING (
        (SELECT user_role FROM get_current_user_profile()) IN ('super_admin', 'admin', 'director')
    );

CREATE POLICY "audit_insert_all" ON audit_logs
    FOR INSERT TO authenticated
    WITH CHECK (organization_id IN (SELECT org_id FROM get_current_user_profile()));
