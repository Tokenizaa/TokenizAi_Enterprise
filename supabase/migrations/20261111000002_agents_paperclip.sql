-- =====================================================================
-- MIGRAÇÃO: Tabela agents com campos Paperclip
-- =====================================================================

CREATE TABLE IF NOT EXISTS agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role TEXT DEFAULT 'general',
    title TEXT,
    icon TEXT,
    appearance JSONB DEFAULT '{}'::jsonb,
    status TEXT DEFAULT 'idle',
    lifecycle_state TEXT DEFAULT 'ready',
    reports_to UUID REFERENCES agents(id),
    capabilities TEXT,
    adapter_type TEXT DEFAULT 'process',
    adapter_config JSONB DEFAULT '{}'::jsonb,
    default_environment_id UUID REFERENCES environments(id),
    budget_monthly_cents INTEGER DEFAULT 0,
    spend_month_utc TEXT,
    spent_monthly_cents NUMERIC DEFAULT 0,
    pause_reason TEXT,
    paused_at TIMESTAMP,
    error_reason TEXT,
    permissions JSONB DEFAULT '{}'::jsonb,
    last_heartbeat_at TIMESTAMP,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_by_user_id TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (company_id, code)
);

CREATE INDEX IF NOT EXISTS idx_agents_company_id ON agents(company_id);
CREATE INDEX IF NOT EXISTS idx_agents_reports_to ON agents(reports_to);
CREATE INDEX IF NOT EXISTS idx_agents_status ON agents(status);

-- =====================================================================
-- COMO APLICAR:
-- SQL Editor do Supabase: colar e executar
-- =====================================================================
