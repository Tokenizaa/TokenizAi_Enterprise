/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface PaperclipContract {
  protocol_version: string;
  endpoint: string;
  authentication: {
    type: 'Bearer' | 'APIKey';
    header: string;
  };
  supported_entities: Array<{
    name: string;
    description: string;
    schema_fields: string[];
    read_only: boolean;
  }>;
  webhook_events: string[];
}

export const PAPERCLIP_INTEGRATION_SPEC: PaperclipContract = {
  protocol_version: '2026.1-enterprise',
  endpoint: import.meta.env.PAPERCLIP_API_URL || 'https://api.paperclip.internal/v1',
  authentication: {
    type: 'Bearer',
    header: 'Authorization: Bearer <PAPERCLIP_API_KEY>',
  },
  supported_entities: [
    {
      name: 'GovernanceDocument (DELIB)',
      description: 'Documentos integrais de atas e pareceres deliberativos do Conselho.',
      schema_fields: ['doc_code', 'title', 'version', 'sha256_hash', 'cns_ref', 'dec_ref', 'published_at'],
      read_only: true,
    },
    {
      name: 'DecisionRecord (DEC)',
      description: 'Metadados normativos de decisões corporativas referenciadas.',
      schema_fields: ['dec_code', 'title', 'summary', 'status', 'decided_at', 'cns_code'],
      read_only: true,
    },
    {
      name: 'DeliberationRecord (CNS)',
      description: 'Registro de sessões colegiadas e atas de quórum deliberativo.',
      schema_fields: ['cns_code', 'session_date', 'president', 'quorum', 'decision_summary'],
      read_only: true,
    },
  ],
  webhook_events: [
    'paperclip.document.indexed',
    'paperclip.document.archived',
    'paperclip.signature.verified',
  ],
};

export const paperclipService = {
  getContractSpecification(): PaperclipContract {
    return PAPERCLIP_INTEGRATION_SPEC;
  },

  async testConnection(): Promise<{
    status: 'unconfigured' | 'connected' | 'error';
    latencyMs?: number;
    message: string;
  }> {
    const apiUrl = import.meta.env.PAPERCLIP_API_URL;
    const apiKey = import.meta.env.PAPERCLIP_API_KEY;

    if (!apiUrl || !apiKey || apiUrl.includes('internal')) {
      return {
        status: 'unconfigured',
        message: 'Endpoint Paperclip não configurado no ambiente (.env). O serviço opera em modo standby com contrato formalizado.',
      };
    }

    try {
      const start = performance.now();
      const res = await fetch(`${apiUrl}/health`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      });
      const latencyMs = Math.round(performance.now() - start);

      if (res.ok) {
        return {
          status: 'connected',
          latencyMs,
          message: 'Conexão ativa e validada com o repositório Paperclip.',
        };
      } else {
        return {
          status: 'error',
          latencyMs,
          message: `Falha na verificação de integridade Paperclip (HTTP ${res.status}).`,
        };
      }
    } catch {
      return {
        status: 'error',
        message: 'Não foi possível alcançar o servidor Paperclip especificado.',
      };
    }
  },
};
