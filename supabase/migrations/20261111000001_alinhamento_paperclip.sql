-- =====================================================================
-- MIGRAÇÃO: Alinhamento Enterprise ↔ Paperclip
-- Adiciona tabelas e campos faltantes para espelhar o modelo Paperclip
-- =====================================================================

-- 1. Tabela: companies (empresa raiz do Paperclip)
CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'active',
    pause_reason TEXT,
    paused_at TIMESTAMP,
    issue_prefix TEXT DEFAULT 'PAP',
    issue_counter INTEGER DEFAULT 0,
    budget_monthly_cents INTEGER DEFAULT 0,
    spend_month_utc TEXT,
    spent_monthly_cents NUMERIC DEFAULT 0,
    default_responsible_user_id TEXT,
    require_board_approval_for_new_agents BOOLEAN DEFAULT false,
    interaction_resolver_governance JSONB DEFAULT '{}'::jsonb,
    feedback_data_sharing_enabled BOOLEAN DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 2. Tabela: goals (metas hierárquicas: company → team → agent → task)
CREATE TABLE IF NOT EXISTS goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    level TEXT DEFAULT 'task',
    status TEXT DEFAULT 'planned',
    parent_id UUID REFERENCES goals(id),
    owner_agent_id UUID,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 3. Tabela: issues (tarefas hierárquicas)
CREATE TABLE IF NOT EXISTS issues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    project_id UUID,
    goal_id UUID REFERENCES goals(id),
    parent_id UUID REFERENCES issues(id),
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'backlog',
    priority TEXT DEFAULT 'medium',
    assignee_agent_id UUID,
    assignee_user_id TEXT,
    responsible_user_id TEXT,
    review_policy TEXT,
    checkout_run_id UUID,
    execution_run_id UUID,
    monitor_next_check_at TIMESTAMP,
    origin_kind TEXT DEFAULT 'manual',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 4. Tabela: environments
CREATE TABLE IF NOT EXISTS environments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT DEFAULT 'development',
    config JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 5. Tabela: heartbeat_runs (monitoramento de liveness dos agentes)
CREATE TABLE IF NOT EXISTS heartbeat_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID,
    status TEXT DEFAULT 'idle',
    started_at TIMESTAMP NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMP,
    output TEXT,
    error TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 6. Tabela: cost_events (rastreamento de custos/tokens)
CREATE TABLE IF NOT EXISTS cost_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID,
    company_id UUID,
    task_id UUID,
    cost_cents INTEGER DEFAULT 0,
    currency TEXT DEFAULT 'BRL',
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 7. Tabela: chat_channels (canais de comunicação)
CREATE TABLE IF NOT EXISTS chat_channels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT DEFAULT 'dm',
    config JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 8. Adicionar campos Paperclip à tabela agents (se não existirem)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='agents' AND column_name='reports_to') THEN
        ALTER TABLE agents ADD COLUMN reports_to UUID REFERENCES agents(id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='agents' AND column_name='budget_monthly_cents') THEN
        ALTER TABLE agents ADD COLUMN budget_monthly_cents INTEGER DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='agents' AND column_name='spend_month_utc') THEN
        ALTER TABLE agents ADD COLUMN spend_month_utc TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='agents' AND column_name='spent_monthly_cents') THEN
        ALTER TABLE agents ADD COLUMN spent_monthly_cents NUMERIC DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='agents' AND column_name='pause_reason') THEN
        ALTER TABLE agents ADD COLUMN pause_reason TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='agents' AND column_name='paused_at') THEN
        ALTER TABLE agents ADD COLUMN paused_at TIMESTAMP;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='agents' AND column_name='error_reason') THEN
        ALTER TABLE agents ADD COLUMN error_reason TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='agents' AND column_name='permissions') THEN
        ALTER TABLE agents ADD COLUMN permissions JSONB DEFAULT '{}'::jsonb;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='agents' AND column_name='last_heartbeat_at') THEN
        ALTER TABLE agents ADD COLUMN last_heartbeat_at TIMESTAMP;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='agents' AND column_name='metadata') THEN
        ALTER TABLE agents ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='agents' AND column_name='created_by_user_id') THEN
        ALTER TABLE agents ADD COLUMN created_by_user_id TEXT;
    END IF;
END $$;

-- 9. Índices de performance
CREATE INDEX IF NOT EXISTS idx_agents_reports_to ON agents(reports_to);
CREATE INDEX IF NOT EXISTS idx_goals_company_id ON goals(company_id);
CREATE INDEX IF NOT EXISTS idx_goals_parent_id ON goals(parent_id);
CREATE INDEX IF NOT EXISTS idx_issues_company_id ON issues(company_id);
CREATE INDEX IF NOT EXISTS idx_issues_goal_id ON issues(goal_id);
CREATE INDEX IF NOT EXISTS idx_issues_parent_id ON issues(parent_id);
CREATE INDEX IF NOT EXISTS idx_heartbeat_runs_agent_id ON heartbeat_runs(agent_id);
CREATE INDEX IF NOT EXISTS idx_cost_events_agent_id ON cost_events(agent_id);

-- =====================================================================
-- COMO APLICAR:
-- 1. No painel do Supabase: SQL Editor → colar este script → Run
-- 2. Ou via psql: psql "postgresql://postgres:<senha>@db.udeglcdloehagljrrukj.supabase.co:5432/postgres" -f este_arquivo.sql
-- =====================================================================
