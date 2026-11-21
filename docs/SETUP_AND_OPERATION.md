# NETTOSCORP ENTERPRISE PLATFORM
## Manual de Instalação, Arquitetura e Operação

Este documento detalha o funcionamento, parametrização, governança e operação técnica da **NettosCorp Enterprise Platform**.

---

### 1. Visão Geral da Arquitetura

A plataforma é composta por:
1. **Frontend**: React 19 + TypeScript + Tailwind CSS v4, sob o tema corporativo escuro, com fidelidade tipográfica (Plus Jakarta Sans e JetBrains Mono) e disciplina zero-pill.
2. **Backend & Autenticação**: Integração nativa com Supabase Auth e PostgreSQL com Row Level Security (RLS).
3. **Parque de Agentes de IA**: Orquestração de agentes autônomos (família Gemini 2.5 Pro e Flash) com vinculação departamental e supervisão humana.
4. **Governança & Rastreabilidade**: Triangulação normativa entre:
   - **CNS**: Deliberações do Conselheiro e atas de quórum.
   - **DEC**: Decretos e decisões institucionais da Diretoria.
   - **DELIB**: Documentos e atas integrais autenticados.
5. **Trilha de Auditoria**: Registro imutável de mutações, sessões e alterações de papéis.

---

### 2. Configuração de Ambiente (.env)

Copie o arquivo `.env.example` para `.env` e configure as credenciais da sua instância Supabase:

```bash
# Supabase Configuration
VITE_SUPABASE_URL="https://seu-projeto.supabase.co"
VITE_SUPABASE_ANON_KEY="sua-chave-anonima-publica"
SUPABASE_SERVICE_ROLE_KEY="sua-chave-service-role-privada"

# Paperclip Integration
PAPERCLIP_API_URL="https://api.paperclip.internal/v1"
PAPERCLIP_API_KEY="seu-token-paperclip"
```

> **Modo Standalone / Avaliação:** Quando as variáveis do Supabase não estiverem configuradas ou apontarem para o placeholder, a plataforma ativa automaticamente o motor de repositório local persistente (`LocalSupabaseStore`), garantindo que 100% dos fluxos (login, CRUDs, filtros e auditoria) funcionem imediatamente no navegador sem quebras.

---

### 3. Execução de Migrações no Banco de Dados

O arquivo de migração versionado está localizado em:
`supabase/migrations/20261107000001_initial_schema.sql`

Para aplicar as migrações na CLI do Supabase:
```bash
supabase db push
# ou via psql:
psql -h db.seu-projeto.supabase.co -U postgres -d postgres -f supabase/migrations/20261107000001_initial_schema.sql
```

A migração cria:
- Extensões `uuid-ossp` e `pgcrypto`.
- 14 tabelas com integridade referencial:
  - `organizations`, `profiles`, `departments`, `positions`, `organization_memberships`, `role_permissions`
  - `agents`, `projects`, `project_members`, `tasks`, `task_assignments`
  - `decisions`, `deliberations`, `documents`, `audit_logs`
- Triggers automáticos de `updated_at`.
- Políticas RLS rigorosas para cada tabela, segregando acessos por `organization_id` e papel (`super_admin`, `admin`, `director`, `manager`, `member`, `viewer`).

---

### 4. Matriz de Papéis e Permissões (RBAC / RLS)

| Papel | Descrição | Permissões |
|---|---|---|
| `super_admin` | Super Administrador | Acesso irrestrito a configurações, parametrização estatutária e exclusões |
| `admin` | Administrador | Gestão integral de departamentos, usuários, agentes, projetos e documentos |
| `director` | Diretor Executivo | Emissão e homologação de DEC, CNS, gestão de departamentos e projetos |
| `manager` | Gerente Operacional | Gestão de projetos do departamento, atribuição de tarefas a humanos e IA |
| `member` | Membro / Especialista | Execução de tarefas atribuídas e visualização de projetos vinculados |
| `viewer` | Auditor / Observador | Leitura estrita de registros, relatórios e trilha de auditoria |

---

### 5. Rotas da Aplicação

| Rota | Descrição |
|---|---|
| `/login` | Acesso com credenciais e seletor rápido para avaliação |
| `/forgot-password` | Fluxo de recuperação de senha institucional |
| `/dashboard` | Visão executiva com métricas calculadas em tempo real |
| `/organization` | Organograma e estrutura organizacional |
| `/organization/departments` | CRUD de departamentos corporativos |
| `/organization/positions` | CRUD de cargos e níveis hierárquicos |
| `/agents` | Diretório e homologação de agentes de IA |
| `/agents/:id` | Parâmetros de execução e tarefas do agente |
| `/projects` | Portfólio de projetos estratégicos |
| `/projects/:id` | Detalhes do projeto com cálculo real de progresso |
| `/tasks` | Fila de tarefas para humanos e agentes cognitivos |
| `/governance` | Portal de governança e resolutor de referências cruzadas |
| `/decisions` | Registro oficial DEC com fundamentação jurídica |
| `/deliberations` | Atas de sessões colegiadas CNS com quórum |
| `/documents` | Repositório de atas integrais (DELIB) e políticas |
| `/audit` | Trilha de auditoria com exportação para CSV |
| `/settings` | Diagnósticos de infraestrutura e bateria de testes |
| `/settings/users` | Gestão de identidades e privilégios |
| `/profile` | Perfil do usuário e redefinição de senha |
