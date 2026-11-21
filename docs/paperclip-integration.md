# CONTRATO DE INTEGRAÇÃO — PAPERCLIP & NETTOSCORP
## Especificação Técnica de Interoperabilidade Documental

**Versão do Protocolo:** 2026.1-enterprise  
**Padrão de Autenticação:** Bearer Token via Header `Authorization: Bearer <PAPERCLIP_API_KEY>`  
**Diretiva de Isolamento:** Leitura somente de metadados; nenhuma modificação ou escrita direta no repositório Paperclip é permitida.

---

### 1. Escopo e Princípios de Arquitetura

1. **Custódia Imutável**: O repositório documental Paperclip é a autoridade de custódia primária de arquivos digitais. A NettosCorp Enterprise Platform consome apenas hashes de integridade (`sha256`) e referências normativas.
2. **Zero Duplicação Operacional**: Arquivos binários pesados não são duplicados no banco transacional da NettosCorp; apenas metadados e ponteiros de acesso autenticado são indexados.
3. **Desacoplamento Assíncrono**: A comunicação entre os sistemas utiliza webhooks assinados e endpoints REST em modo idempotente.

---

### 2. Entidades Suportadas no Contrato

#### 2.1 GovernanceDocument (`DELIB`)
Representa arquivos integrais de atas do Conselho Consultivo.
- **Campos do Schema**:
  - `doc_code` (string, único) — Ex: `DELIB-2026-001`
  - `title` (string) — Título da ata ou parecer
  - `version` (string) — Versão formal (ex: `1.0`)
  - `sha256_hash` (string) — Hash criptográfico de validação
  - `cns_ref` (string, opcional) — Código da deliberação CNS vinculada
  - `dec_ref` (string, opcional) — Código do decreto DEC vinculado
  - `published_at` (string ISO-8601)

#### 2.2 DecisionRecord (`DEC`)
Metadados estruturados de decretos e decisões emitidas.
- **Campos do Schema**:
  - `dec_code` (string, único) — Ex: `DEC-2026-001`
  - `title` (string)
  - `summary` (string)
  - `status` (string) — `in_effect` | `ratified` | `revoked`
  - `decided_at` (string DATE)
  - `cns_code` (string, opcional)

#### 2.3 DeliberationRecord (`CNS`)
Registros de sessões deliberativas.
- **Campos do Schema**:
  - `cns_code` (string, único) — Ex: `CNS-2026-001`
  - `session_date` (string DATE)
  - `president` (string)
  - `quorum` (string)
  - `decision_summary` (string)

---

### 3. Eventos Webhook Homologados

| Evento | Gatilho | Ação na Plataforma NettosCorp |
|---|---|---|
| `paperclip.document.indexed` | Novo arquivo autenticado no Paperclip | Gera registro em `documents` e aciona auditoria |
| `paperclip.document.archived` | Documento transferido para custódia fria | Atualiza status para `archived` |
| `paperclip.signature.verified` | Confirmação de assinatura digital | Atualiza flag de validade estatutária |

---

### 4. Camada de Serviço

A implementação do cliente desacoplado na NettosCorp reside em:
`src/services/paperclipService.ts`

O serviço provê:
- `getContractSpecification()`: Retorna os schemas e eventos formais para inspeção na interface em `/settings`.
- `testConnection()`: Healthcheck do endpoint remoto quando parametrizado no ambiente.
