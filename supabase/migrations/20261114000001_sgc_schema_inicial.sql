-- =====================================================================
-- MIGRAÇÃO: Esquema inicial do Sistema de Gestão Corporativa (SGC)
-- Versão: 20261114000001
-- Tabelas: usuarios, projetos, tarefas, entregas
-- Dependência: NET-4 (mapeamento de projetos — MAPEAMENTO_PROJETOS.md)
-- =====================================================================

-- Habilitar extensão necessária para geração de UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ---------------------------------------------------------------------
-- Função utilitária para updated_at automático (reutiliza se existir)
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================================
-- 1. Usuários do sistema de gestão (pessoas internas da NettosCorp)
-- =====================================================================
CREATE TABLE IF NOT EXISTS usuarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL UNIQUE,             -- sub JWT do Supabase Auth
  email TEXT NOT NULL UNIQUE,               -- e-mail verificado
  nome TEXT NOT NULL,                       -- nome apresentado ao sistema
  role TEXT NOT NULL DEFAULT 'operador',    -- operador, gerente, admin
  ativo BOOLEAN NOT NULL DEFAULT TRUE,      -- inativo desativa acesso
  CONSTRAINT usuarios_role_check CHECK (role IN ('operador','gerente','admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices de usuários
CREATE INDEX IF NOT EXISTS idx_usuarios_user_id ON usuarios(user_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_role ON usuarios(role);
CREATE INDEX IF NOT EXISTS idx_usuarios_ativo ON usuarios(ativo);

-- Especificações de colunas
COMMENT ON TABLE usuarios IS 'Usuários da plataforma de gestão. Isolamento de acesso por JWT + RLS.';
COMMENT ON COLUMN usuarios.id IS 'Chave primária surrogate (UUID).';
COMMENT ON COLUMN usuarios.user_id IS 'sub JWT do Supabase Auth. Único por usuário.';
COMMENT ON COLUMN usuarios.email IS 'E-mail verificado. Único.';
COMMENT ON COLUMN usuarios.nome IS 'Nome apresentado ao sistema.';
COMMENT ON COLUMN usuarios.role IS 'Papéis: operador, gerente, admin. Controla permissões em usuarios, projetos, tarefas, entregas.';
COMMENT ON COLUMN usuarios.ativo IS 'Usuário inativo não consegue autenticar.';

-- =====================================================================
-- 2. Projetos de gestão
-- =====================================================================
-- Agrupamento de tarefas sob uma entidade de trabalho (tempo/horizonte).
CREATE TABLE IF NOT EXISTS projetos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  codigo TEXT NOT NULL UNIQUE,              -- PROJ-2026-001
  nome TEXT NOT NULL,                       -- nome apresentado
  descricao TEXT,                           -- contexto / escopo
  status TEXT NOT NULL DEFAULT 'planejamento', -- planejamento, ativo, pausado, concluido
  CONSTRAINT projetos_status_check CHECK (status IN ('planejamento','ativo','pausado','concluido')),
  owner_usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices de projetos
CREATE INDEX IF NOT EXISTS idx_projetos_codigo ON projetos(codigo);
CREATE INDEX IF NOT EXISTS idx_projetos_status ON projetos(status);
CREATE INDEX IF NOT EXISTS idx_projetos_owner ON projetos(owner_usuario_id);

-- Especificações de colunas
COMMENT ON TABLE projetos IS 'Projetos de gestão. Cada projeto agrupa tarefas e seus entregas.';
COMMENT ON COLUMN projetos.codigo IS 'Código de negócio (PROJ-AAAA-NNN). Único.';
COMMENT ON COLUMN projetos.owner_usuario_id IS 'Responsável pelo projeto (com restrição de deleção).';

-- =====================================================================
-- 3. Tarefas
-- =====================================================================
-- Unidade de trabalho dentro de um projeto, com prioridade e status.
CREATE TABLE IF NOT EXISTS tarefas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  codigo TEXT NOT NULL UNIQUE,              -- TAR-0001
  projeto_id UUID NOT NULL REFERENCES projetos(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,                     -- título da tarefa
  descricao TEXT,                           -- detalhes / aceitos / pendentes
  status TEXT NOT NULL DEFAULT 'pendente',  -- pendente, em_andamento, concluido, bloqueado
  prioridade TEXT NOT NULL DEFAULT 'media', -- baixa, media, alta, urgente
  CONSTRAINT tarefas_status_check CHECK (status IN ('pendente','em_andamento','concluido','bloqueado')),
  CONSTRAINT tarefas_prioridade_check CHECK (prioridade IN ('baixa','media','alta','urgente')),
  responsavel_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  criado_por_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices de tarefas
CREATE INDEX IF NOT EXISTS idx_tarefas_projeto_id ON tarefas(projeto_id);
CREATE INDEX IF NOT EXISTS idx_tarefas_status ON tarefas(status);
CREATE INDEX IF NOT EXISTS idx_tarefas_prioridade ON tarefas(prioridade);
CREATE INDEX IF NOT EXISTS idx_tarefas_responsavel ON tarefas(responsavel_id);
CREATE INDEX IF NOT EXISTS idx_tarefas_criado_por ON tarefas(criado_por_id);

-- Especificações de colunas
COMMENT ON TABLE tarefas IS 'Tarefas de um projeto. Status e prioridade controlam o fluxo de trabalho.';
COMMENT ON COLUMN tarefas.codigo IS 'Código de negócio (TAR-000N). Único dentro do projeto.';
COMMENT ON COLUMN tarefas.projeto_id IS 'Projeto ao qual a tarefa pertence.';
COMMENT ON COLUMN tarefas.status IS 'pendente | em_andamento | concluido | bloqueado.';
COMMENT ON COLUMN tarefas.prioridade IS 'baixa | media | alta | urgente.';
COMMENT ON COLUMN tarefas.responsavel_id IS 'Pessoa responsável pela execução (nullable).';
COMMENT ON COLUMN tarefas.criado_por_id IS 'Usuário que criou a tarefa.';

-- =====================================================================
-- 4. Entregas
-- =====================================================================
-- Resultados/entregas produzidos por uma tarefa.
CREATE TABLE IF NOT EXISTS entregas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  codigo TEXT NOT NULL UNIQUE,              -- ENT-0001
  tarefa_id UUID NOT NULL REFERENCES tarefas(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,                     -- nome da entrega
  descricao TEXT,                           -- descrição / entrega realizada
  tipo_entrega TEXT NOT NULL DEFAULT 'documento', -- documento, relatorio, evidencia, artefato
  CONSTRAINT entregas_tipo_check CHECK (tipo_entrega IN ('documento','relatorio','evidencia','artefato')),
  status TEXT NOT NULL DEFAULT 'rascunho',  -- rascunho, submetido, aprovado, rejeitado
  CONSTRAINT entregas_status_check CHECK (status IN ('rascunho','submetido','aprovado','rejeitado')),
  criado_por_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'               -- metadados extensos (não usado como fonte de verdade)
);

-- Índices de entregas
CREATE INDEX IF NOT EXISTS idx_entregas_tarefa_id ON entregas(tarefa_id);
CREATE INDEX IF NOT EXISTS idx_entregas_status ON entregas(status);
CREATE INDEX IF NOT EXISTS idx_entregas_tipo ON entregas(tipo_entrega);

-- Especificações de colunas
COMMENT ON TABLE entregas IS 'Entregas produzidas por uma tarefa. Série de aprovação: rascunho -> submetido -> aprovado/rejeitado.';
COMMENT ON COLUMN entregas.codigo IS 'Código de negócio (ENT-000N). Único dentro da tarefa.';
COMMENT ON COLUMN entregas.tarefa_id IS 'Tarefa que gerou a entrega.';
COMMENT ON COLUMN entregas.tipo_entrega IS 'documento | relatorio | evidencia | artefato.';
COMMENT ON COLUMN entregas.status IS 'rascunho | submetido | aprovado | rejeitado.';
COMMENT ON COLUMN entregas.criado_por_id IS 'Usuário que criou a entrega.';
COMMENT ON COLUMN entregas.metadata IS 'Metadados opcionais em JSONB. Não usado como fonte de verdade.';

-- =====================================================================
-- 5. Triggers de atualização automática de updated_at
-- =====================================================================
CREATE TRIGGER update_usuarios_modtime BEFORE UPDATE ON usuarios
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projetos_modtime BEFORE UPDATE ON projetos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tarefas_modtime BEFORE UPDATE ON tarefas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_entregas_modtime BEFORE UPDATE ON entregas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================================
-- COMO APLICAR:
-- 1. No painel do Supabase: SQL Editor → colar este script → Run
-- 2. Ou via psql: psql "<connection_string>" -f 20261114000001_sgc_schema_inicial.sql
-- =====================================================================
