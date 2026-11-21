import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { recommendTeamComposition, PlannerRunbook } from '../src/services/agencyTeamPlanner';
import { AgencyAgentProfile } from '../src/types';
import { translateAgentName, translateAgentCategory, translateDivision, translateRunbookGroup, translateActivation, translateRunbookMode } from '../src/utils/agencyPresentation';

function profile(code: string, name: string, sourceFile: string, competencies: string[]): AgencyAgentProfile {
  return {
    id: code,
    organization_id: 'test-org',
    category: 'technology',
    specialty: 'engineering',
    name,
    code,
    identity: name,
    specialty_description: competencies.join(', '),
    competencies,
    personality: 'Analítico e colaborativo',
    responsibilities: competencies,
    methodology: 'Planejar, executar e validar',
    status: 'disponivel',
    source_file: sourceFile,
    source_hash: 'test-hash',
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
  } as AgencyAgentProfile;
}

const profiles = [
  profile('backend-architect', 'Backend Architect', '`engineering/engineering-backend-architect.md`', ['incidente', 'recuperação', 'integração', 'arquitetura']),
  profile('growth-hacker', 'Growth Hacker', '`marketing/marketing-growth-hacker.md`', ['campanha', 'aquisição', 'leads', 'growth']),
  profile('agents-orchestrator', 'Agents Orchestrator', '`specialized/agents-orchestrator.md`', ['orquestração', 'equipes', 'planejamento']),
];

const runbooks: PlannerRunbook[] = [
  { slug: 'incident-response', title: 'Incident Response', mode: 'NEXUS-Micro', duration: 'P0-P3', summary: 'Incidente em produção', doc: 'incident.md', roster: [{ group: 'Resposta crítica', activation: 'always', agents: ['engineering-backend-architect'] }] },
  { slug: 'marketing-campaign', title: 'Marketing Campaign', mode: 'NEXUS-Sprint', duration: '4 semanas', summary: 'Campanha multicanal', doc: 'marketing.md', roster: [{ group: 'Campaign Core', activation: 'always', agents: ['marketing-growth-hacker'] }] },
  { slug: 'startup-mvp', title: 'Startup MVP', mode: 'NEXUS-Sprint', duration: '6 semanas', summary: 'Construção de MVP', doc: 'mvp.md', roster: [{ group: 'Core Team', activation: 'always', agents: ['agents-orchestrator'] }] },
  { slug: 'enterprise-feature', title: 'Enterprise Feature', mode: 'NEXUS-Sprint', duration: '8 semanas', summary: 'Feature enterprise', doc: 'feature.md', roster: [{ group: 'Core Team', activation: 'always', agents: ['engineering-backend-architect'] }] },
];

const incident = recommendTeamComposition('Responder a incidente de indisponibilidade em produção', profiles, runbooks);
assert.equal(incident.runbook?.slug, 'incident-response');
assert.equal(incident.recommendations[0]?.profile.code, 'backend-architect');
assert.equal(incident.recommendations[0]?.group, 'Resposta crítica');
assert.equal(incident.analysis.phases[0]?.name, 'Resposta crítica');
assert.ok(incident.recommendations[0]?.dimensions.runbookFit === 1);
assert.ok(incident.analysis.objectiveDomains.length > 0);
assert.ok(incident.analysis.coveredDomains.length > 0);

const marketing = recommendTeamComposition('Planejar campanha de marketing e aquisição de leads', profiles, runbooks);
assert.equal(marketing.runbook?.slug, 'marketing-campaign');
assert.equal(marketing.recommendations[0]?.profile.code, 'growth-hacker');

const startup = recommendTeamComposition('Construir um novo produto SaaS MVP e protótipo', profiles, runbooks);
assert.equal(startup.runbook?.slug, 'startup-mvp');
assert.equal(startup.recommendations[0]?.profile.code, 'agents-orchestrator');

const enterprise = recommendTeamComposition('Desenvolver funcionalidade com integração e compliance em plataforma existente', profiles, runbooks);
assert.equal(enterprise.runbook?.slug, 'enterprise-feature');


const sourceOnlyProfile = profile('spatial-specialist', 'Spatial Specialist', '`gis/spatial-specialist.md`', ['cartografia']);
const sourceOnly = recommendTeamComposition(
  'Construir visualização geoespacial com LiDAR e Cesium',
  [sourceOnlyProfile],
  [],
  { 'spatial-specialist': 'lidar cesium pointcloud geospatial 3dtiles terrain' },
);
assert.equal(sourceOnly.recommendations[0]?.profile.code, 'spatial-specialist');
assert.ok(sourceOnly.recommendations[0]?.matches.includes('lidar'));
assert.ok(sourceOnly.recommendations[0]?.dimensions.evidence.includes('documento original indexado'));

const empty = recommendTeamComposition('', profiles, runbooks);
assert.equal(empty.runbook, null);
assert.equal(empty.recommendations.length, 0);
assert.equal(empty.analysis.phases.length, 0);
assert.ok(empty.analysis.selectionGuidance.length > 0);



const importedProfiles = JSON.parse(readFileSync(resolve('public/agency-profiles-import.json'), 'utf8')) as { code: string; name: string; category: string; source_file: string }[];
assert.equal(importedProfiles.length, 283);
for (const imported of importedProfiles) {
  const displayName = translateAgentName(imported.name, imported.code);
  assert.ok(displayName.trim().length > 0, `Nome de apresentação vazio: ${imported.code}`);
  assert.notEqual(displayName, imported.name, `Nome não localizado: ${imported.code}`);
  assert.ok(translateAgentCategory(imported.category).trim().length > 0);
}
assert.equal(translateDivision('engineering'), 'Engenharia');
assert.equal(translateRunbookGroup('Core Team'), 'Equipe principal');
assert.equal(translateActivation('as needed'), 'Sob demanda');
assert.equal(translateRunbookMode('NEXUS-Sprint'), 'NEXUS Ciclo Rápido');

const profileIdentifiers = new Set(importedProfiles.flatMap(profile => [
  profile.code,
  String(profile.source_file || '').replace(/[`'"]/g, '').split('/').pop()?.replace(/\.md$/i, '') || '',
]));
const sourceRunbooks = JSON.parse(readFileSync(resolve('public/agency-runbooks.json'), 'utf8'));
const runbookAgentSlugs = sourceRunbooks.runbooks.flatMap((runbook: { roster: { agents: string[] }[] }) => runbook.roster.flatMap(group => group.agents));
const unresolvedRunbookAgents = [...new Set(runbookAgentSlugs.filter((slug: string) => !profileIdentifiers.has(slug)))];
assert.equal(runbookAgentSlugs.length, 64);
assert.deepEqual(unresolvedRunbookAgents, []);
assert.equal(sourceRunbooks.runbooks.length, 4);
for (const runbook of sourceRunbooks.runbooks as { slug: string; asset?: string; doc: string }[]) {
  assert.ok(runbook.asset, `Runbook sem asset local: ${runbook.slug}`);
  const assetPath = runbook.asset!.startsWith('/') ? runbook.asset!.slice(1) : runbook.asset!;
  const localRunbook = readFileSync(resolve('public', assetPath), 'utf8');
  assert.ok(localRunbook.length > 1000, `Documento de runbook vazio ou incompleto: ${runbook.slug}`);
  assert.ok(localRunbook.includes('## '), `Documento sem seções estruturadas: ${runbook.slug}`);
}

const manifest = JSON.parse(readFileSync(resolve('public/agency-source-index.json'), 'utf8'));
const sourceSearchIndex = JSON.parse(readFileSync(resolve('public/agency-profile-search-index.json'), 'utf8'));
assert.equal(manifest.profile_count, 283);
assert.equal(manifest.profiles.length, 283);
assert.equal(new Set(manifest.profiles.map((item: { code: string }) => item.code)).size, 283);
assert.equal(new Set(manifest.profiles.map((item: { source_path: string }) => item.source_path)).size, 283);
assert.equal(sourceSearchIndex.profile_count, 283);
assert.equal(sourceSearchIndex.profiles.length, 283);
const searchCodes = new Set(sourceSearchIndex.profiles.map((item: { code: string }) => item.code));
for (const item of manifest.profiles as { code: string; source_path: string; sha256: string }[]) {
  assert.ok(searchCodes.has(item.code), `Índice pesquisável sem o perfil ${item.code}`);
  assert.ok(!item.source_path.split('/').includes('..'), `Caminho inseguro: ${item.source_path}`);
  const markdown = readFileSync(resolve('public/agency-source', item.source_path));
  const actualHash = createHash('sha256').update(markdown).digest('hex');
  assert.equal(actualHash, item.sha256, `Hash divergente: ${item.source_path}`);
}

console.log('OK: composição por runbook, busca no conteúdo original e integridade dos 283 documentos passaram.');
