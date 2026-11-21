#!/usr/bin/env node
/**
 * Vendoriza os arquivos Markdown originais do Agency Agents dentro da Enterprise.
 * Execução: bun run sync:agency-source -- --source /caminho/para/agency-agents
 * A sincronização é explícita e local; a aplicação em runtime não consulta o upstream.
 */
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';

const args = process.argv.slice(2);
const sourceFlag = args.indexOf('--source');
const sourceArg = sourceFlag >= 0 ? args[sourceFlag + 1] : process.env.AGENCY_AGENTS_SOURCE_DIR;
if (!sourceArg) {
  console.error('Informe --source com o caminho do clone local de msitarzewski/agency-agents.');
  process.exit(1);
}

const enterpriseRoot = resolve(process.cwd());
const sourceRoot = resolve(sourceArg);
const publicRoot = resolve(enterpriseRoot, 'public');
const outputRoot = resolve(publicRoot, 'agency-source');
const importPath = resolve(publicRoot, 'agency-profiles-import.json');

if (!existsSync(importPath) || !existsSync(sourceRoot)) {
  console.error('Não encontrei o catálogo importado ou o diretório de origem informado.');
  process.exit(1);
}

const profiles = JSON.parse(readFileSync(importPath, 'utf8'));
if (!Array.isArray(profiles) || profiles.length !== 283) {
  throw new Error(`Esperados 283 perfis no catálogo; encontrados: ${profiles?.length ?? 'inválido'}.`);
}

const codes = new Set();
const paths = new Set();
const documents = profiles.map(profile => {
  if (!profile.code || codes.has(profile.code)) throw new Error(`Código ausente ou duplicado: ${profile.code}`);
  codes.add(profile.code);

  const sourcePath = String(profile.source_file || '').replace(/[`'"]/g, '').trim();
  if (!sourcePath || isAbsolute(sourcePath) || sourcePath.split('/').some(part => part === '..')) {
    throw new Error(`Caminho de origem inválido para ${profile.code}: ${sourcePath}`);
  }
  if (paths.has(sourcePath)) throw new Error(`Arquivo de origem duplicado: ${sourcePath}`);
  paths.add(sourcePath);

  const absoluteSource = resolve(sourceRoot, sourcePath);
  const relativeSource = relative(sourceRoot, absoluteSource);
  if (relativeSource.startsWith('..' + sep) || relativeSource === '..' || !existsSync(absoluteSource)) {
    throw new Error(`Arquivo original não encontrado: ${sourcePath}`);
  }

  const markdown = readFileSync(absoluteSource, 'utf8');
  if (!markdown.trim() || !markdown.startsWith('---')) {
    throw new Error(`Markdown original vazio ou sem frontmatter: ${sourcePath}`);
  }
  return {
    code: profile.code,
    name: profile.name,
    source_path: sourcePath,
    markdown,
    sha256: createHash('sha256').update(markdown, 'utf8').digest('hex'),
    bytes: Buffer.byteLength(markdown, 'utf8'),
  };
});

if (documents.length !== 283 || paths.size !== 283) {
  throw new Error('A validação de integridade do corpus não foi satisfeita; nada foi gravado.');
}

const licensePath = resolve(sourceRoot, 'LICENSE');
if (!existsSync(licensePath)) throw new Error('LICENSE não encontrado no repositório de origem.');

const upstreamCommit = (() => {
  try { return execFileSync('git', ['-C', sourceRoot, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(); }
  catch { return 'unknown'; }
})();

mkdirSync(outputRoot, { recursive: true });
copyFileSync(licensePath, resolve(outputRoot, 'UPSTREAM-LICENSE.txt'));

for (const document of documents) {
  const destination = resolve(outputRoot, document.source_path);
  const relativeDestination = relative(outputRoot, destination);
  if (relativeDestination.startsWith('..' + sep) || relativeDestination === '..') {
    throw new Error(`Destino fora da pasta de origem: ${document.source_path}`);
  }
  mkdirSync(dirname(destination), { recursive: true });
  writeFileSync(destination, document.markdown, 'utf8');
}

const manifest = {
  source_repository: 'https://github.com/msitarzewski/agency-agents',
  source_ref: 'local-checkout',
  source_commit: upstreamCommit,
  synced_at: new Date().toISOString(),
  profile_count: documents.length,
  profiles: documents.map(({ code, name, source_path, sha256, bytes }) => ({ code, name, source_path, sha256, bytes })),
};
writeFileSync(resolve(publicRoot, 'agency-source-index.json'), JSON.stringify(manifest, null, 2) + '\n', 'utf8');

const searchIndex = {
  source_repository: 'https://github.com/msitarzewski/agency-agents',
  source_commit: upstreamCommit,
  profile_count: documents.length,
  profiles: documents.map(({ code, name, source_path, markdown }) => {
    const body = markdown.startsWith('---') ? markdown.split('---').slice(2).join(' ') : markdown;
    const terms = body.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase().match(/[a-z0-9]{3,}/g) || [];
    return { code, name, source_path, search_text: Array.from(new Set(terms)).join(' ') };
  }),
};
writeFileSync(resolve(publicRoot, 'agency-profile-search-index.json'), JSON.stringify(searchIndex) + '\n', 'utf8');
console.log(JSON.stringify({
  status: 'success',
  profiles: documents.length,
  sourceCommit: upstreamCommit,
  totalBytes: documents.reduce((sum, document) => sum + document.bytes, 0),
  output: 'public/agency-source/',
  manifest: 'public/agency-source-index.json',
  searchIndex: 'public/agency-profile-search-index.json',
}, null, 2));
