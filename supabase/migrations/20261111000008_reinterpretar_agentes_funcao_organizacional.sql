-- Atualizar metadados dos agentes para refletir funcao organizacional (nao IA autonoma)
-- Hermes permanece como unico agente de IA (executive)
-- Os demais sao funcoes organizacionais com registro no banco, mas sem ciclo de vida autonomo de IA

-- Atualizar Diretor de Tecnologia
UPDATE agents 
SET capabilities = 'Funcao organizacional: definir arquitetura empresarial, padroes tecnicos, pilha de tecnologia, organizar engenharia e infraestrutura. Nao e agente de IA autonomo.',
    title = 'Diretor de Tecnologia (Funcao Organizacional)'
WHERE code = 'DIR-TEC-001'
AND company_id = (SELECT id FROM companies WHERE issue_prefix = 'NET' ORDER BY created_at DESC LIMIT 1);

-- Atualizar Diretor de Gestao de Projetos
UPDATE agents 
SET capabilities = 'Funcao organizacional: gerenciar carteira de projetos, prazos, entregas, riscos, dependencias. Nao e agente de IA autonomo.',
    title = 'Diretor de Gestao de Projetos (Funcao Organizacional)'
WHERE code = 'DIR-PROJ-001'
AND company_id = (SELECT id FROM companies WHERE issue_prefix = 'NET' ORDER BY created_at DESC LIMIT 1);

-- Atualizar Orquestrador Global
UPDATE agents 
SET capabilities = 'Funcao organizacional: coordenacao tecnica de distribuicao de tarefas entre agentes e projetos. Nao e agente de IA autonomo.',
    title = 'Agente Corporativo Global de Orquestracao (Funcao de Coordenacao)'
WHERE code = 'ORC-GLOBAL-001'
AND company_id = (SELECT id FROM companies WHERE issue_prefix = 'NET' ORDER BY created_at DESC LIMIT 1);

-- Atualizar Especialista Software Architect
UPDATE agents 
SET capabilities = 'Funcao organizacional: projetar sistemas escalaveis, DDD, ADRs, estrategia de evolucao do sistema. Nao e agente de IA autonomo.',
    title = 'Arquiteto de Software (Funcao Organizacional)'
WHERE code = 'SPEC-ARCH-001'
AND company_id = (SELECT id FROM companies WHERE issue_prefix = 'NET' ORDER BY created_at DESC LIMIT 1);

-- Atualizar Especialista Backend Architect
UPDATE agents 
SET capabilities = 'Funcao organizacional: design de APIs, arquitetura de banco, escalabilidade. Nao e agente de IA autonomo.',
    title = 'Arquiteto de Backend (Funcao Organizacional)'
WHERE code = 'SPEC-BACK-001'
AND company_id = (SELECT id FROM companies WHERE issue_prefix = 'NET' ORDER BY created_at DESC LIMIT 1);

-- Atualizar Especialista Frontend Developer
UPDATE agents 
SET capabilities = 'Funcao organizacional: React/Vue/Angular, implementacao de UI, desenvolvimento de interfaces. Nao e agente de IA autonomo.',
    title = 'Desenvolvedor Frontend (Funcao Organizacional)'
WHERE code = 'SPEC-FRONT-001'
AND company_id = (SELECT id FROM companies WHERE issue_prefix = 'NET' ORDER BY created_at DESC LIMIT 1);

-- Atualizar Especialista DevOps Automator
UPDATE agents 
SET capabilities = 'Funcao organizacional: CI/CD, infraestrutura, cloud ops. Nao e agente de IA autonomo.',
    title = 'Automatizador DevOps (Funcao Organizacional)'
WHERE code = 'SPEC-DEVOPS-001'
AND company_id = (SELECT id FROM companies WHERE issue_prefix = 'NET' ORDER BY created_at DESC LIMIT 1);

-- Atualizar Especialista Project Manager Senior
UPDATE agents 
SET capabilities = 'Funcao organizacional: planejar projetos, acompanhar execucao, gerenciar dependencias, relatar status. Nao e agente de IA autonomo.',
    title = 'Gerente de Projeto Senior (Funcao Organizacional)'
WHERE code = 'SPEC-PM-001'
AND company_id = (SELECT id FROM companies WHERE issue_prefix = 'NET' ORDER BY created_at DESC LIMIT 1);

-- Atualizar Especialista Technical Writer
UPDATE agents 
SET capabilities = 'Funcao organizacional: documentacao tecnica, criar e manter docs, versionar documentos. Nao e agente de IA autonomo.',
    title = 'Escritor Tecnico (Funcao Organizacional)'
WHERE code = 'SPEC-TW-001'
AND company_id = (SELECT id FROM companies WHERE issue_prefix = 'NET' ORDER BY created_at DESC LIMIT 1);

-- Atualizar Monitor Enterprise (Suporte de Hermes)
UPDATE agents 
SET capabilities = 'Funcao de suporte operacional: acompanhar plataforma enterprise, detectar falhas, reportar status, alertar Hermes. Nao e agente de IA autonomo.',
    title = 'Agente de Monitoramento Enterprise (Suporte Operacional)'
WHERE code = 'NET-AG-001'
AND company_id = (SELECT id FROM companies WHERE issue_prefix = 'NET' ORDER BY created_at DESC LIMIT 1);

-- Atualizar Documentacao Institucional (Suporte de Hermes)
UPDATE agents 
SET capabilities = 'Funcao de suporte operacional: manter documentacao atualizada, sincronizar institutional/, versionar documentos. Nao e agente de IA autonomo.',
    title = 'Agente de Documentacao Institucional (Suporte Operacional)'
WHERE code = 'NET-AG-002'
AND company_id = (SELECT id FROM companies WHERE issue_prefix = 'NET' ORDER BY created_at DESC LIMIT 1);

-- Atualizar Operacional (Suporte de Hermes)
UPDATE agents 
SET capabilities = 'Funcao de suporte operacional: tarefas gerais, coordenacao, lembretes, acompanhamento de prazos. Nao e agente de IA autonomo.',
    title = 'Agente Operacional (Suporte Operacional)'
WHERE code = 'NET-AG-003'
AND company_id = (SELECT id FROM companies WHERE issue_prefix = 'NET' ORDER BY created_at DESC LIMIT 1);

-- Atualizar Atendimento (Suporte de Hermes)
UPDATE agents 
SET capabilities = 'Funcao de suporte operacional: filtrar mensagens, responder duvidas simples, escalar para Hermes. Nao e agente de IA autonomo.',
    title = 'Agente de Atendimento (Suporte Operacional)'
WHERE code = 'NET-AG-004'
AND company_id = (SELECT id FROM companies WHERE issue_prefix = 'NET' ORDER BY created_at DESC LIMIT 1);

-- Relatório final
SELECT code, name, role, title, status, reports_to, adapter_type, budget_monthly_cents, last_heartbeat_at
FROM agents
WHERE company_id = (SELECT id FROM companies WHERE issue_prefix = 'NET' ORDER BY created_at DESC LIMIT 1)
ORDER BY role, code;
