-- =====================================================================
-- MIGRAÇÃO: Reconstrução da equipe NettosCorp conforme documentação institucional
-- Cria 2 diretorias (Nível 2) e 6 especialistas (Nível 6)
-- MANTÉM os 4 agentes de suporte de Hermes (Grupo A)
-- NÃO exclui nada definitivo
-- =====================================================================

WITH company AS (
    SELECT id FROM companies WHERE issue_prefix = 'NET' ORDER BY created_at DESC LIMIT 1
),
hermes AS (
    SELECT id FROM agents WHERE code = 'HERMES-001' AND company_id = (SELECT id FROM company)
),
dir_tech AS (
    INSERT INTO agents (
        company_id, code, name, role, title, status, lifecycle_state,
        reports_to, capabilities, adapter_type, adapter_config,
        budget_monthly_cents
    )
    SELECT
        c.id, 'DIR-TEC-001', 'Diretor de Tecnologia', 'direction',
        'Diretor de Tecnologia', 'idle', 'ready',
        NULL, -- reporta institucionalmente ao fundador (não tem superior hierárquico no Paperclip)
        'definir arquitetura empresarial, padroes tecnicos, pilha de tecnologia, organizar engenharia e infraestrutura, criar e manter agentes tecnicos',
        'process', '{"native": true}', 0
    FROM company c
    RETURNING id, code, name
),
dir_proj AS (
    INSERT INTO agents (
        company_id, code, name, role, title, status, lifecycle_state,
        reports_to, capabilities, adapter_type, adapter_config,
        budget_monthly_cents
    )
    SELECT
        c.id, 'DIR-PROJ-001', 'Diretor de Gestão de Projetos', 'direction',
        'Diretor de Gestão de Projetos', 'idle', 'ready',
        NULL, -- reporta institucionalmente ao fundador
        'gerenciar carteira de projetos, prazos, entregas, riscos, dependencias',
        'process', '{"native": true}', 0
    FROM company c
    RETURNING id, code, name
),
spec_arch AS (
    INSERT INTO agents (
        company_id, code, name, role, title, status, lifecycle_state,
        reports_to, capabilities, adapter_type, adapter_config,
        budget_monthly_cents
    )
    SELECT
        c.id, 'SPEC-ARCH-001', 'Software Architect', 'specialist',
        'Arquiteto de Software', 'idle', 'ready',
        d.id,
        'projetar sistemas escaláveis, DDD, ADRs, estratégia de evolução do sistema',
        'process', '{"native": true}', 0
    FROM company c, dir_tech d
    RETURNING id, code, name
),
spec_backend AS (
    INSERT INTO agents (
        company_id, code, name, role, title, status, lifecycle_state,
        reports_to, capabilities, adapter_type, adapter_config,
        budget_monthly_cents
    )
    SELECT
        c.id, 'SPEC-BACK-001', 'Backend Architect', 'specialist',
        'Arquiteto de Backend', 'idle', 'ready',
        d.id,
        'design de APIs, arquitetura de banco, escalabilidade',
        'process', '{"native": true}', 0
    FROM company c, dir_tech d
    RETURNING id, code, name
),
spec_frontend AS (
    INSERT INTO agents (
        company_id, code, name, role, title, status, lifecycle_state,
        reports_to, capabilities, adapter_type, adapter_config,
        budget_monthly_cents
    )
    SELECT
        c.id, 'SPEC-FRONT-001', 'Frontend Developer', 'specialist',
        'Desenvolvedor Frontend', 'idle', 'ready',
        d.id,
        'React/Vue/Angular, implementação de UI, desenvolvimento de interfaces',
        'process', '{"native": true}', 0
    FROM company c, dir_tech d
    RETURNING id, code, name
),
spec_devops AS (
    INSERT INTO agents (
        company_id, code, name, role, title, status, lifecycle_state,
        reports_to, capabilities, adapter_type, adapter_config,
        budget_monthly_cents
    )
    SELECT
        c.id, 'SPEC-DEVOPS-001', 'DevOps Automator', 'specialist',
        'Automatizador DevOps', 'idle', 'ready',
        d.id,
        'CI/CD, infraestrutura, cloud ops',
        'process', '{"native": true}', 0
    FROM company c, dir_tech d
    RETURNING id, code, name
),
spec_pm AS (
    INSERT INTO agents (
        company_id, code, name, role, title, status, lifecycle_state,
        reports_to, capabilities, adapter_type, adapter_config,
        budget_monthly_cents
    )
    SELECT
        c.id, 'SPEC-PM-001', 'Project Manager Senior', 'specialist',
        'Gerente de Projeto Sênior', 'idle', 'ready',
        p.id,
        'planejar projetos, acompanhar execução, gerenciar dependências, relatar status',
        'process', '{"native": true}', 0
    FROM company c, dir_proj p
    RETURNING id, code, name
),
spec_tw AS (
    INSERT INTO agents (
        company_id, code, name, role, title, status, lifecycle_state,
        reports_to, capabilities, adapter_type, adapter_config,
        budget_monthly_cents
    )
    SELECT
        c.id, 'SPEC-TW-001', 'Technical Writer', 'specialist',
        'Escritor Técnico', 'idle', 'ready',
        d.id,
        'documentação técnica, criar e manter docs, versionar documentos',
        'process', '{"native": true}', 0
    FROM company c, dir_tech d
    RETURNING id, code, name
)
-- Insert goals para cada diretor
INSERT INTO goals (company_id, title, description, level, status, parentId, ownerAgentId, createdAt, updatedAt)
SELECT
    c.id,
    'Arquitetura organizacional e modelo operacional',
    'Definir arquitetura empresarial, padroes tecnicos e modelo operacional da NettosCorp',
    'team', 'planned', NULL, d.id,
    NOW(), NOW()
FROM company c, dir_tech d
UNION ALL
SELECT
    c.id,
    'Gerenciar carteira de projetos',
    'Planejar projetos, acompanhar execucao, gerenciar dependencias, relatar status',
    'team', 'planned', NULL, p.id,
    NOW(), NOW()
FROM company c, dir_proj p;

-- Insert goals para cada especialista (vinculados ao goal do diretor)
INSERT INTO goals (company_id, title, description, level, status, parentId, ownerAgentId, createdAt, updatedAt)
SELECT
    c.id,
    'Arquitetura de sistemas',
    'Projetar sistemas escaláveis, DDD, ADRs',
    'agent', 'planned', g.id, s.id,
    NOW(), NOW()
FROM company c, dir_tech d, spec_arch s, goals g
WHERE g.title = 'Arquitetura organizacional e modelo operacional' AND g.ownerAgentId = d.id
UNION ALL
SELECT
    c.id,
    'Arquitetura de backend e APIs',
    'Design de APIs, arquitetura de banco, escalabilidade',
    'agent', 'planned', g.id, s.id,
    NOW(), NOW()
FROM company c, dir_tech d, spec_backend s, goals g
WHERE g.title = 'Arquitetura organizacional e modelo operacional' AND g.ownerAgentId = d.id
UNION ALL
SELECT
    c.id,
    'Desenvolvimento de interfaces',
    'React/Vue/Angular, implementação de UI',
    'agent', 'planned', g.id, s.id,
    NOW(), NOW()
FROM company c, dir_tech d, spec_frontend s, goals g
WHERE g.title = 'Arquitetura organizacional e modelo operacional' AND g.ownerAgentId = d.id
UNION ALL
SELECT
    c.id,
    'CI/CD e infraestrutura',
    'CI/CD, infraestrutura, cloud ops',
    'agent', 'planned', g.id, s.id,
    NOW(), NOW()
FROM company c, dir_tech d, spec_devops s, goals g
WHERE g.title = 'Arquitetura organizacional e modelo operacional' AND g.ownerAgentId = d.id
UNION ALL
SELECT
    c.id,
    'Documentação técnica',
    'Criar e manter docs, versionar documentos',
    'agent', 'planned', g.id, s.id,
    NOW(), NOW()
FROM company c, dir_tech d, spec_tw s, goals g
WHERE g.title = 'Arquitetura organizacional e modelo operacional' AND g.ownerAgentId = d.id
UNION ALL
SELECT
    c.id,
    'Gestão de projetos',
    'Planejar projetos, acompanhar execução, gerenciar dependências',
    'agent', 'planned', g.id, s.id,
    NOW(), NOW()
FROM company c, dir_proj p, spec_pm s, goals g
WHERE g.title = 'Gerenciar carteira de projetos' AND g.ownerAgentId = p.id;

-- Insert issues (tarefas iniciais) para cada especialista
INSERT INTO issues (company_id, title, description, status, priority, assigneeAgentId, origin_kind, createdAt, updatedAt)
SELECT
    c.id,
    'Validar arquitetura de sistemas',
    'Validar propostas de arquitetura para os projetos existentes',
    'backlog', 'high', s.id, 'manual', NOW(), NOW()
FROM company c, spec_arch s
UNION ALL
SELECT
    c.id,
    'Validar arquitetura de backend',
    'Revisar design de APIs e arquitetura de banco',
    'backlog', 'high', s.id, 'manual', NOW(), NOW()
FROM company c, spec_backend s
UNION ALL
SELECT
    c.id,
    'Validar implementação frontend',
    'Revisar implementação de interfaces React/Vue',
    'backlog', 'high', s.id, 'manual', NOW(), NOW()
FROM company c, spec_frontend s
UNION ALL
SELECT
    c.id,
    'Configurar CI/CD',
    'Configurar pipelines de CI/CD e infraestrutura',
    'backlog', 'high', s.id, 'manual', NOW(), NOW()
FROM company c, spec_devops s
UNION ALL
SELECT
    c.id,
    'Planejar projetos Q1',
    'Planejar carteira de projetos para o próximo trimestre',
    'backlog', 'high', s.id, 'manual', NOW(), NOW()
FROM company c, spec_pm s
UNION ALL
SELECT
    c.id,
    'Criar documentação técnica inicial',
    'Documentar padrões técnicos e arquitetura',
    'backlog', 'high', s.id, 'manual', NOW(), NOW()
FROM company c, spec_tw s;

-- Atualizar heartbeat de todos os agentes (incluindo os 4 de suporte existentes)
UPDATE agents SET last_heartbeat_at = NOW(), status = 'idle', lifecycle_state = 'ready'
WHERE company_id = (SELECT id FROM companies WHERE issue_prefix = 'NET' ORDER BY created_at DESC LIMIT 1);

-- Relatório final de todos os agentes
SELECT code, name, role, title, status, reports_to, adapter_type, budget_monthly_cents
FROM agents
WHERE company_id = (SELECT id FROM companies WHERE issue_prefix = 'NET' ORDER BY created_at DESC LIMIT 1)
ORDER BY code;
