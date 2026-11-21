import { AgencyAgentProfile } from '../types';

export interface PlannerRunbook {
  slug: string;
  title: string;
  mode: string;
  duration: string;
  summary: string;
  doc: string;
  asset?: string;
  roster: { group: string; activation: string; agents: string[] }[];
}

export type CapabilityDomain =
  | 'strategy' | 'product' | 'design' | 'engineering' | 'data'
  | 'security' | 'quality' | 'growth' | 'operations' | 'governance'
  | 'customer' | 'finance';

export interface RecommendationDimensions {
  objectiveFit: number;
  runbookFit: number;
  capabilityDomains: CapabilityDomain[];
  evidence: string[];
}

export interface TeamRecommendation {
  profile: AgencyAgentProfile;
  score: number;
  matches: string[];
  group?: string;
  activation?: string;
  reason: string;
  dimensions: RecommendationDimensions;
}

export interface TeamPlanAnalysis {
  objectiveDomains: CapabilityDomain[];
  coveredDomains: CapabilityDomain[];
  uncoveredDomains: CapabilityDomain[];
  phases: { name: string; activation: string; professionals: string[]; count: number }[];
  strengths: string[];
  risks: string[];
  selectionGuidance: string[];
}

export interface TeamCompositionResult {
  runbook: PlannerRunbook | null;
  scenarioMatches: string[];
  recommendations: TeamRecommendation[];
  analysis: TeamPlanAnalysis;
}

const SCENARIO_RULES: Record<string, string[]> = {
  'incident-response': ['incidente', 'indisponibilidade', 'outage', 'vazamento', 'ataque', 'resposta a incidente', 'falha crítica', 'produção fora'],
  'marketing-campaign': ['campanha', 'marketing', 'aquisição', 'tráfego pago', 'redes sociais', 'lançamento', 'growth', 'geração de leads'],
  'enterprise-feature': ['funcionalidade', 'feature', 'integração', 'compliance', 'produto existente', 'plataforma existente', 'enterprise'],
  'startup-mvp': ['mvp', 'startup', 'novo produto', 'produto novo', 'protótipo', 'validar ideia', 'construir plataforma', 'desenvolver plataforma', 'saas'],
};

const DOMAIN_TERMS: Record<CapabilityDomain, string[]> = {
  strategy: ['estrategia', 'planejamento estrategico', 'roadmap', 'priorizacao', 'governanca estrategica'],
  product: ['produto', 'product', 'mvp', 'discovery', 'requisito', 'backlog', 'validacao'],
  design: ['design', 'ux', 'ui', 'experiencia', 'interface', 'pesquisa com usuario', 'usabilidade', 'marca'],
  engineering: ['engenharia', 'desenvolvimento', 'software', 'frontend', 'backend', 'api', 'integracao', 'arquitetura', 'codigo', 'infraestrutura', 'devops'],
  data: ['dados', 'data', 'analytics', 'analise', 'metricas', 'machine learning', 'ia', 'inteligencia artificial', 'relatorio'],
  security: ['seguranca', 'security', 'privacidade', 'vulnerabilidade', 'ataque', 'incidente', 'protecao', 'lgpd'],
  quality: ['qa', 'qualidade', 'teste', 'testing', 'validacao', 'performance', 'observabilidade', 'confiabilidade'],
  growth: ['marketing', 'campanha', 'aquisicao', 'growth', 'trafego', 'leads', 'vendas', 'seo', 'conteudo'],
  operations: ['operacao', 'operacoes', 'processo', 'suporte', 'atendimento', 'execucao', 'automacao'],
  governance: ['compliance', 'conformidade', 'juridico', 'legal', 'auditoria', 'risco', 'politica'],
  customer: ['cliente', 'customer', 'sucesso do cliente', 'retencao', 'onboarding', 'suporte ao cliente'],
  finance: ['financeiro', 'financas', 'orcamento', 'custos', 'receita', 'precificacao', 'faturamento'],
};

const STOP_WORDS = new Set([
  'para', 'com', 'uma', 'uns', 'umas', 'que', 'por', 'das', 'dos', 'the', 'and',
  'from', 'into', 'this', 'that', 'will', 'need', 'needs', 'build', 'make',
  'realizar', 'desenvolver', 'criar', 'fazer', 'projeto', 'equipe', 'precisa',
  'precisamos', 'sobre', 'entre', 'como', 'ser', 'ter', 'sua', 'seu', 'nas', 'nos',
]);

const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase();
const tokenize = (value: string) => normalize(value).split(/[^a-z0-9]+/).filter(token => token.length > 2 && !STOP_WORDS.has(token));

function sourceIdentifier(profile: AgencyAgentProfile): string {
  return String(profile.source_file || '').replace(/[`'"]/g, '').split('/').pop()?.replace(/\.md$/i, '') || '';
}

function profileSearchText(profile: AgencyAgentProfile, originalSourceText = ''): string {
  return [
    profile.name, profile.code, profile.identity, profile.specialty,
    profile.specialty_description, profile.personality, profile.methodology,
    ...(profile.competencies || []), ...(profile.responsibilities || []), originalSourceText,
  ].join(' ');
}

function domainMatches(text: string, domain: CapabilityDomain): string[] {
  const normalized = normalize(text);
  return DOMAIN_TERMS[domain].filter(term => normalized.includes(normalize(term)));
}

function detectDomains(text: string): CapabilityDomain[] {
  return (Object.keys(DOMAIN_TERMS) as CapabilityDomain[])
    .filter(domain => domainMatches(text, domain).length > 0);
}

function emptyAnalysis(): TeamPlanAnalysis {
  return {
    objectiveDomains: [], coveredDomains: [], uncoveredDomains: [], phases: [],
    strengths: [], risks: [], selectionGuidance: ['Descreva o resultado esperado, as restrições e as entregas para iniciar a análise.'],
  };
}

/**
 * Planejador determinístico e explicável. Usa os documentos originais como evidência,
 * mas não se apresenta como LLM nem como avaliação de senioridade/disponibilidade.
 */
export function recommendTeamComposition(
  objective: string,
  profiles: AgencyAgentProfile[],
  runbooks: PlannerRunbook[],
  originalSearchTextByCode: Record<string, string> = {},
): TeamCompositionResult {
  const normalizedObjective = normalize(objective.trim());
  const objectiveTokens = new Set(tokenize(objective));
  if (!normalizedObjective || !objectiveTokens.size) {
    return { runbook: null, scenarioMatches: [], recommendations: [], analysis: emptyAnalysis() };
  }

  const scenarioCandidates = runbooks.map(runbook => {
    const keywords = SCENARIO_RULES[runbook.slug] || [];
    const matches = keywords.filter(keyword => normalizedObjective.includes(normalize(keyword)));
    return { runbook, matches, score: matches.length };
  }).sort((a, b) => b.score - a.score || a.runbook.title.localeCompare(b.runbook.title));
  const selectedScenario = scenarioCandidates[0]?.score ? scenarioCandidates[0] : null;

  const profileByIdentifier = new Map<string, AgencyAgentProfile>();
  for (const profile of profiles) {
    profileByIdentifier.set(normalize(profile.code), profile);
    const sourceId = sourceIdentifier(profile);
    if (sourceId) profileByIdentifier.set(normalize(sourceId), profile);
  }

  const rosterAssignments = new Map<string, { group: string; activation: string }>();
  if (selectedScenario) {
    for (const group of selectedScenario.runbook.roster) {
      for (const agentSlug of group.agents) {
        const profile = profileByIdentifier.get(normalize(agentSlug));
        if (profile && !rosterAssignments.has(profile.id)) {
          rosterAssignments.set(profile.id, { group: group.group, activation: group.activation });
        }
      }
    }
  }

  const objectiveDomains = detectDomains(objective);
  const candidates = profiles.map(profile => {
    const sourceText = originalSearchTextByCode[profile.code] || '';
    const searchableText = profileSearchText(profile, sourceText);
    const profileTokens = new Set(tokenize(searchableText));
    const matches = [...objectiveTokens].filter(token => profileTokens.has(token));
    const objectiveFit = matches.length / Math.max(1, objectiveTokens.size);
    const assignment = rosterAssignments.get(profile.id);
    const runbookFit = assignment ? 1 : 0;
    const capabilityDomains = detectDomains(searchableText);
    const domainFit = objectiveDomains.length
      ? objectiveDomains.filter(domain => capabilityDomains.includes(domain)).length / objectiveDomains.length
      : 0;
    const score = Math.min(1, objectiveFit * 0.55 + runbookFit * 0.25 + domainFit * 0.20);
    const evidence = [
      ...matches.slice(0, 5).map(term => `termo do objetivo: ${term}`),
      ...objectiveDomains.filter(domain => capabilityDomains.includes(domain)).map(domain => `capacidade: ${domain}`),
      ...(assignment ? [`runbook: ${assignment.group}`] : []),
      ...(sourceText ? ['documento original indexado'] : []),
    ];
    const reason = assignment
      ? `Previsto no grupo ${assignment.group}; ativação: ${assignment.activation}. Evidências: ${evidence.slice(0, 4).join('; ')}.`
      : evidence.length
        ? `Correspondência identificada no perfil e no conteúdo original. Evidências: ${evidence.slice(0, 4).join('; ')}.`
        : '';
    return {
      profile, score, matches, group: assignment?.group, activation: assignment?.activation, reason,
      dimensions: { objectiveFit, runbookFit, capabilityDomains, evidence },
    };
  }).filter(item => item.score > 0);

  // Diversifica a lista inicial para não preencher todas as vagas com uma única especialidade.
  const remaining = [...candidates];
  const recommendations: TeamRecommendation[] = [];
  const covered = new Set<CapabilityDomain>();
  while (remaining.length && recommendations.length < 18) {
    remaining.sort((a, b) => {
      const marginalA = a.dimensions.capabilityDomains.filter(domain => objectiveDomains.includes(domain) && !covered.has(domain)).length;
      const marginalB = b.dimensions.capabilityDomains.filter(domain => objectiveDomains.includes(domain) && !covered.has(domain)).length;
      return (b.score + marginalB * 0.035) - (a.score + marginalA * 0.035)
        || a.profile.name.localeCompare(b.profile.name);
    });
    const next = remaining.shift()!;
    recommendations.push(next);
    next.dimensions.capabilityDomains.forEach(domain => covered.add(domain));
  }

  const teamDomains = new Set<CapabilityDomain>();
  recommendations.forEach(item => item.dimensions.capabilityDomains.forEach(domain => teamDomains.add(domain)));
  const uncoveredDomains = objectiveDomains.filter(domain => !teamDomains.has(domain));
  const phases = (selectedScenario?.runbook.roster || []).map(group => {
    const names = group.agents.map(slug => profileByIdentifier.get(normalize(slug))?.name || slug);
    return { name: group.group, activation: group.activation, professionals: names, count: names.length };
  });
  const strengths: string[] = [];
  const risks: string[] = [];
  const selectionGuidance: string[] = [];

  if (selectedScenario) strengths.push(`Há um runbook de referência compatível: ${selectedScenario.runbook.title}.`);
  if (recommendations.some(item => item.dimensions.runbookFit > 0)) strengths.push('Parte da composição está ancorada em um roster operacional de origem.');
  if (objectiveDomains.length && uncoveredDomains.length === 0) strengths.push('As áreas de capacidade identificadas no texto do objetivo aparecem na lista recomendada.');
  if (uncoveredDomains.length) risks.push(`Cobertura não identificada para: ${uncoveredDomains.join(', ')}. A busca pode não ter encontrado os termos equivalentes nos documentos.`);
  if (!selectedScenario) risks.push('Nenhum runbook foi identificado com confiança pelas regras atuais; a composição depende mais da correspondência textual.');
  if (recommendations.length < 3) risks.push('A lista inicial contém menos de três profissionais; valide se o objetivo está suficientemente descrito.');
  if (!objectiveDomains.length) risks.push('O objetivo ainda não permite identificar áreas de capacidade com as regras atuais.');
  selectionGuidance.push('Trate a lista como ponto de partida: valide escopo, senioridade, disponibilidade e dependências antes de homologar.');
  selectionGuidance.push('Os percentuais representam aderência textual e estrutural, não probabilidade de sucesso nem avaliação de desempenho.');
  if (phases.length) selectionGuidance.push('Use os grupos e momentos de ativação do runbook como sequência sugerida, ajustando-os ao escopo real.');

  return {
    runbook: selectedScenario?.runbook || null,
    scenarioMatches: selectedScenario?.matches || [],
    recommendations,
    analysis: {
      objectiveDomains,
      coveredDomains: objectiveDomains.filter(domain => teamDomains.has(domain)),
      uncoveredDomains,
      phases,
      strengths,
      risks,
      selectionGuidance,
    },
  };
}
