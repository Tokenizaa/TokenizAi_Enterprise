-- Ativar o Orquestrador Global e apontar reports_to para Hermes (relacao administrativa)
UPDATE agents SET status = 'active', last_heartbeat_at = NOW(), reports_to = (SELECT id FROM agents WHERE code = 'HERMES-001')
WHERE code = 'ORC-GLOBAL-001'
AND company_id = (SELECT id FROM companies WHERE issue_prefix = 'NET' ORDER BY created_at DESC LIMIT 1);

-- Marcar as primeiras 2 issues como em_progress (inicio de execucao real)
UPDATE issues SET status = 'in_progress', monitor_next_check_at = NOW() + INTERVAL '1 day'
WHERE id IN ('78b9ad80-11c8-4691-944e-7edffd4e73fd', 'ea7af1a3-9fd6-401d-93a0-22062649c24a')
AND company_id = (SELECT id FROM companies WHERE issue_prefix = 'NET' ORDER BY created_at DESC LIMIT 1)
RETURNING id, title, status, assignee_agent_id;

-- Relatório final completo
SELECT
    a.code,
    a.name,
    a.role,
    a.title,
    a.status,
    CASE
        WHEN a.reports_to IS NULL THEN 'raiz (Fundador)'
        WHEN a.reports_to = h.id THEN 'Hermes (Chefe de Gabinete)'
        WHEN a.reports_to = dt.id THEN 'Diretor de Tecnologia'
        WHEN a.reports_to = dp.id THEN 'Diretor de Gestao de Projetos'
        WHEN a.reports_to = o.id THEN 'Orquestrador Global'
        ELSE 'outro'
    END AS reports_to_label,
    a.last_heartbeat_at
FROM agents a
CROSS JOIN (SELECT id FROM agents WHERE code = 'HERMES-001') h
CROSS JOIN (SELECT id FROM agents WHERE code = 'DIR-TEC-001') dt
CROSS JOIN (SELECT id FROM agents WHERE code = 'DIR-PROJ-001') dp
CROSS JOIN (SELECT id FROM agents WHERE code = 'ORC-GLOBAL-001') o
WHERE a.company_id = (SELECT id FROM companies WHERE issue_prefix = 'NET' ORDER BY created_at DESC LIMIT 1)
ORDER BY
    CASE a.role
        WHEN 'executive' THEN 1
        WHEN 'orchestrator' THEN 2
        WHEN 'direction' THEN 3
        WHEN 'specialist' THEN 4
        WHEN 'monitoring' THEN 5
        WHEN 'documentation' THEN 6
        WHEN 'operations' THEN 7
        WHEN 'support' THEN 8
        ELSE 9
    END,
    a.code;
