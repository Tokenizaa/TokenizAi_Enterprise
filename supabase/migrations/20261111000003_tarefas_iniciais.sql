-- Tarefas iniciais para os 4 agentes
WITH company AS (
    SELECT id FROM companies WHERE issue_prefix='NET' ORDER BY created_at DESC LIMIT 1
),
agents_map AS (
    SELECT code, id FROM agents WHERE company_id = (SELECT id FROM company)
)
INSERT INTO issues (company_id, title, description, status, priority, assignee_agent_id, origin_kind)
SELECT 
    c.id,
    v.title,
    v.description,
    'backlog',
    'high',
    a.id,
    'manual'
FROM company c, agents_map a, (VALUES
    ('NET-AG-001', 'Verificar saude da plataforma enterprise', 'Checar build, dependencias, conexao Supabase e status geral'),
    ('NET-AG-002', 'Criar documento de boas-vindas', 'REG-001 - documento de boas-vindas da NettosCorp'),
    ('NET-AG-003', 'Criar primeira tarefa operacional', 'NET-OP-001 - tarefa de rotina operacional para validacao do fluxo'),
    ('NET-AG-004', 'Registrar primeiro atendimento', 'LOG-001 - boas-vindas ao fundador')
) AS v(code, title, description)
WHERE a.code = v.code
RETURNING id, title, assignee_agent_id;
