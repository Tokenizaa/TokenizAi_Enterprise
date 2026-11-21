-- =====================================================================
-- MIGRACAO: Criacao do Agente Corporativo Global de Orquestracao e ativacao de diretores/especialistas
-- Aprovado pelo Conselheiro (DELIB-010), homologado pelo fundador (DELIB-014)
-- Modelo de Autoridade v1.2 ja homologado - nao pedir aprovacao novamente
-- =====================================================================

-- 1. Criar o Orquestrador Global
WITH company AS (
    SELECT id FROM companies WHERE issue_prefix = 'NET' ORDER BY created_at DESC LIMIT 1
)
INSERT INTO agents (
    company_id, code, name, role, title, status, lifecycle_state,
    reports_to, capabilities, adapter_type, adapter_config,
    budget_monthly_cents
)
SELECT
    c.id, 'ORC-GLOBAL-001', 'Agente Corporativo Global de Orquestracao', 'orchestrator',
    'Agente Corporativo Global de Orquestracao', 'idle', 'ready',
    NULL,
    'distribuicao e coordenacao de tarefas entre agentes e projetos; acompanhamento de execucoes; monitoramento de dependencias; comunicacao com supervisores locais dos projetos existentes',
    'process', '{"native": true}', 0
FROM company c
RETURNING id, code, name, role, title, status;

-- 2. Ativar os 2 diretores (idle -> active)
UPDATE agents SET status = 'active', last_heartbeat_at = NOW()
WHERE code IN ('DIR-TEC-001', 'DIR-PROJ-001')
AND company_id = (SELECT id FROM companies WHERE issue_prefix = 'NET' ORDER BY created_at DESC LIMIT 1);

-- 3. Ativar os 6 especialistas (idle -> active)
UPDATE agents SET status = 'active', last_heartbeat_at = NOW()
WHERE code LIKE 'SPEC-%'
AND company_id = (SELECT id FROM companies WHERE issue_prefix = 'NET' ORDER BY created_at DESC LIMIT 1);

-- 4. Relatório final
SELECT code, name, role, title, status, reports_to, adapter_type, budget_monthly_cents, last_heartbeat_at
FROM agents
WHERE company_id = (SELECT id FROM companies WHERE issue_prefix = 'NET' ORDER BY created_at DESC LIMIT 1)
ORDER BY code;
