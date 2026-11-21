-- =====================================================================
-- MIGRACAO: Reconstrucao da equipe NettosCorp - diretores e especialistas
-- =====================================================================

WITH company AS (
    SELECT id FROM companies WHERE issue_prefix = 'NET' ORDER BY created_at DESC LIMIT 1
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
        NULL,
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
        c.id, 'DIR-PROJ-001', 'Diretor de Gestao de Projetos', 'direction',
        'Diretor de Gestao de Projetos', 'idle', 'ready',
        NULL,
        'gerenciar carteira de projetos, prazos, entregas, riscos, dependencias',
        'process', '{"native": true}', 0
    FROM company c
    RETURNING id, code, name
),
specs AS (
    INSERT INTO agents (
        company_id, code, name, role, title, status, lifecycle_state,
        reports_to, capabilities, adapter_type, adapter_config,
        budget_monthly_cents
    )
    SELECT
        c.id, v.code, v.name, v.role, v.title, 'idle', 'ready',
        CASE v.reports_to
            WHEN 'tech' THEN d.id
            WHEN 'proj' THEN p.id
        END,
        v.capabilities, 'process', '{"native": true}', 0
    FROM company c
    CROSS JOIN dir_tech d
    CROSS JOIN dir_proj p
    CROSS JOIN (VALUES
        ('SPEC-ARCH-001', 'Software Architect', 'specialist', 'Arquiteto de Software', 'tech', 'projetar sistemas escalaveis, DDD, ADRs, estrategia de evolucao do sistema'),
        ('SPEC-BACK-001', 'Backend Architect', 'specialist', 'Arquiteto de Backend', 'tech', 'design de APIs, arquitetura de banco, escalabilidade'),
        ('SPEC-FRONT-001', 'Frontend Developer', 'specialist', 'Desenvolvedor Frontend', 'tech', 'React/Vue/Angular, implementacao de UI, desenvolvimento de interfaces'),
        ('SPEC-DEVOPS-001', 'DevOps Automator', 'specialist', 'Automatizador DevOps', 'tech', 'CI/CD, infraestrutura, cloud ops'),
        ('SPEC-PM-001', 'Project Manager Senior', 'specialist', 'Gerente de Projeto Senior', 'proj', 'planejar projetos, acompanhar execucao, gerenciar dependencias, relatar status'),
        ('SPEC-TW-001', 'Technical Writer', 'specialist', 'Escritor Tecnico', 'tech', 'documentacao tecnica, criar e manter docs, versionar documentos')
    ) AS v(code, name, role, title, reports_to, capabilities)
    RETURNING id, code, name, role, title, reports_to
)
SELECT * FROM specs ORDER BY code;
