import React, { useMemo, useState } from 'react';
import {
  X, Download, FileText, Settings2, UserRound, BrainCircuit,
  Activity, Wrench, Copy, Check, Package
} from 'lucide-react';
import type { AgencyAgentProfile } from '../../types';
import { translateAgentName, translateProfileText } from '../../utils/agencyPresentation';

type InstructionFile = 'AGENTS.md' | 'SOUL.md' | 'HEARTBEAT.md' | 'TOOLS.md';
type Tab = 'identity' | 'instructions' | 'runtime';

interface Props {
  profile: AgencyAgentProfile;
  onClose: () => void;
}

const inputClass = 'w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-blue-500 focus:outline-none';
const labelClass = 'mb-1.5 block text-xs font-medium text-zinc-400';

function buildInstructions(profile: AgencyAgentProfile): Record<InstructionFile, string> {
  const list = (items: string[]) => items?.length ? items.map(item => `- ${item}`).join('\n') : '- A definir durante a configuração institucional.';
  return {
    'AGENTS.md': `# ${profile.name}

## Identificação
- Código do perfil: ${profile.code}
- Categoria: ${profile.category}
- Especialidade: ${profile.specialty || 'A definir'}
- Origem: Agency Agents (perfil mestre ${profile.code})

## Missão e identidade
${profile.identity}

## Descrição da especialidade
${profile.specialty_description}

## Responsabilidades
${list(profile.responsibilities || [])}

## Competências
${list(profile.competencies || [])}

## Metodologia de trabalho
${profile.methodology || 'A definir com a liderança responsável.'}

## Contexto NettosCorp
Este perfil é um modelo profissional de referência. A instância operacional deve respeitar a estrutura organizacional, as políticas institucionais, a cadeia de reporte e os limites de autoridade definidos pela NettosCorp.

## Limites e escalonamento
- Não assumir autoridade executiva, legal ou financeira que não tenha sido delegada.
- Escalonar decisões fora do escopo do cargo ao superior hierárquico.
- Não declarar tarefas concluídas sem evidências verificáveis.
- Registrar decisões, entregas, riscos e bloqueios nos sistemas institucionais aplicáveis.

## Critérios de conclusão
- Entrega compatível com a missão e responsabilidades atribuídas.
- Evidências verificáveis dos resultados.
- Comunicação de riscos, dependências e pendências.
- Respeito às políticas e instruções institucionais vigentes.

> Revisar e complementar este arquivo antes de criar a instância no Paperclip.
`,
    'SOUL.md': `# SOUL — ${profile.name}

## Personalidade profissional
${profile.personality || 'A definir pela liderança.'}

## Arquétipo e postura
Derivar do perfil profissional e validar com a liderança responsável antes da implantação.

## Comunicação
- Comunicar de forma objetiva, contextual e profissional.
- Diferenciar fatos confirmados, hipóteses, recomendações e decisões.
- Informar bloqueios e riscos sem ocultá-los.
- Adaptar o nível de detalhe ao público e à responsabilidade da mensagem.

## Estilo de trabalho
- Trabalhar orientado a entregas, prioridades e evidências.
- Preservar rastreabilidade das alterações e decisões.
- Evitar retrabalho e não duplicar fontes oficiais de informação.

## Critérios de decisão
${profile.methodology || 'Definir critérios específicos do cargo com o superior hierárquico.'}

## Limites
- Não ultrapassar a autoridade delegada.
- Não inventar dados, credenciais, resultados ou permissões.
- Pedir escalonamento quando houver conflito de instruções ou risco institucional.
`,
    'HEARTBEAT.md': `# HEARTBEAT — ${profile.name}

## Rotinas recorrentes
- Frequência: definir conforme o cargo e a política operacional.
- Janela de execução: definir com o superior hierárquico.
- Fonte de tarefas: Paperclip e sistemas institucionais autorizados.

## Verificações em cada ciclo
1. Consultar tarefas atribuídas e prioridades vigentes.
2. Identificar prazos, bloqueios e dependências.
3. Executar somente atividades dentro do escopo autorizado.
4. Atualizar o estado das tarefas com evidências.
5. Comunicar riscos e solicitar decisão quando necessário.

## Condições para não executar
- Ausência de autorização ou contexto indispensável.
- Conflito com política institucional.
- Risco de ação irreversível fora da autoridade delegada.

## Relatório do ciclo
Registrar: atividades verificadas, ações executadas, resultados, bloqueios e próximo passo.

> Frequência e comportamento de heartbeat devem ser configurados também nos campos próprios do Paperclip.
`,
    'TOOLS.md': `# TOOLS — ${profile.name}

## Ferramentas autorizadas
A definir conforme o adapter, as permissões e as integrações disponibilizadas à instância Paperclip.

## Regras de uso
- Utilizar somente ferramentas efetivamente habilitadas para esta instância.
- Não presumir acesso a arquivos, APIs, bancos ou ambientes.
- Proteger segredos e nunca registrar tokens ou credenciais neste arquivo.
- Preferir integrações oficiais e operações auditáveis.

## Integrações necessárias
A definir durante a configuração operacional.

## Skills
Relacionar habilidades reutilizáveis aprovadas para o cargo. As habilidades devem permanecer como unidades independentes (SKILL.md e seus recursos), não ser copiadas integralmente para este arquivo.

## Restrições
Não executar ações destrutivas, compromissos financeiros ou alterações de autoridade sem a delegação institucional aplicável.
`,
  };
}

const FILES: { name: InstructionFile; description: string; icon: React.ReactNode }[] = [
  { name: 'AGENTS.md', description: 'Missão, responsabilidades, limites e critérios de conclusão', icon: <FileText className="h-4 w-4" /> },
  { name: 'SOUL.md', description: 'Personalidade, comunicação e estilo de decisão', icon: <BrainCircuit className="h-4 w-4" /> },
  { name: 'HEARTBEAT.md', description: 'Rotinas, verificações e ciclos de execução', icon: <Activity className="h-4 w-4" /> },
  { name: 'TOOLS.md', description: 'Ferramentas, integrações e habilidades habilitadas', icon: <Wrench className="h-4 w-4" /> },
];

export const PaperclipAgentStudio: React.FC<Props> = ({ profile, onClose }) => {
  const initialFiles = useMemo(() => buildInstructions(profile), [profile]);
  const [files, setFiles] = useState<Record<InstructionFile, string>>(initialFiles);
  const [activeFile, setActiveFile] = useState<InstructionFile>('AGENTS.md');
  const [tab, setTab] = useState<Tab>('identity');
  const [role, setRole] = useState(profile.specialty || '');
  const [reportsTo, setReportsTo] = useState('');
  const [adapter, setAdapter] = useState('');
  const [model, setModel] = useState('');
  const [workingDirectory, setWorkingDirectory] = useState('');
  const [monthlyBudget, setMonthlyBudget] = useState('');
  const [skills, setSkills] = useState('');
  const [copied, setCopied] = useState(false);

  const config = {
    source_profile_id: profile.id,
    source_profile_code: profile.code,
    name: profile.name,
    title: role,
    reports_to: reportsTo || null,
    adapter: adapter || null,
    model: model || null,
    working_directory: workingDirectory || null,
    monthly_budget: monthlyBudget ? Number(monthlyBudget) : null,
    skills: skills.split(',').map(value => value.trim()).filter(Boolean),
    instruction_files: files,
    status: 'draft',
    note: 'Pacote de preparação. Nenhum agente foi criado no Paperclip.',
  };

  const download = (filename: string, text: string) => {
    const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const downloadConfig = () => {
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${profile.code.toLowerCase()}-paperclip-config.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const copyActive = async () => {
    await navigator.clipboard.writeText(files[activeFile]);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'identity', label: 'Perfil mestre', icon: <UserRound className="h-4 w-4" /> },
    { id: 'instructions', label: 'Arquivos Markdown', icon: <FileText className="h-4 w-4" /> },
    { id: 'runtime', label: 'Configuração Paperclip', icon: <Settings2 className="h-4 w-4" /> },
  ];

  return (
    <div className="fixed inset-0 z-[70] flex items-stretch justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-label={`Preparar agente ${translateAgentName(profile.name, profile.code)}`}>
      <section className="flex h-full w-full max-w-6xl flex-col overflow-hidden border border-zinc-800 bg-zinc-950 shadow-2xl sm:h-[min(92vh,900px)] sm:rounded-2xl">
        <header className="flex items-center justify-between gap-4 border-b border-zinc-800 px-4 py-3 sm:px-6">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs text-zinc-500"><Package className="h-3.5 w-3.5" /> ESTÚDIO DE PREPARAÇÃO PARA PAPERCLIP</div>
            <h2 className="mt-1 truncate text-lg font-semibold text-white">{translateAgentName(profile.name, profile.code)}</h2>
            <p className="text-xs text-zinc-500">{profile.code} · Perfil profissional de origem</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white" aria-label="Fechar"><X className="h-5 w-5" /></button>
        </header>

        <nav className="flex gap-1 overflow-x-auto border-b border-zinc-800 px-3 sm:px-6">
          {tabs.map(item => <button key={item.id} onClick={() => setTab(item.id)} className={`flex shrink-0 items-center gap-2 border-b-2 px-3 py-3 text-sm ${tab === item.id ? 'border-blue-500 text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}>{item.icon}{item.label}</button>)}
        </nav>

        <main className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
          {tab === 'identity' && <div className="mx-auto max-w-4xl space-y-5">
            <div className="rounded-xl border border-blue-900/60 bg-blue-950/20 p-4 text-sm text-blue-100">O perfil mestre é preservado. Os campos abaixo complementam a instância organizacional sem alterar os 283 registros de origem.</div>
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-3 text-xs leading-5 text-zinc-400">Os nomes, categorias e elementos de navegação são apresentados em português brasileiro. Os textos técnicos originais do perfil permanecem no idioma de origem para preservar a referência usada na preparação dos agentes.</div>
            <div className="grid gap-4 md:grid-cols-2">
              <div><label className={labelClass}>Identidade profissional</label><div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3 text-sm leading-6 text-zinc-300">{translateProfileText(profile.identity)}</div></div>
              <div><label className={labelClass}>Especialidade</label><div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3 text-sm leading-6 text-zinc-300">{translateProfileText(profile.specialty_description)}</div></div>
              <div><label className={labelClass}>Personalidade</label><div className="min-h-28 rounded-lg border border-zinc-800 bg-zinc-900/60 p-3 text-sm leading-6 text-zinc-300">{translateProfileText(profile.personality)}</div></div>
              <div><label className={labelClass}>Metodologia</label><div className="min-h-28 rounded-lg border border-zinc-800 bg-zinc-900/60 p-3 text-sm leading-6 text-zinc-300">{translateProfileText(profile.methodology)}</div></div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div><label className={labelClass}>Competências</label><ul className="space-y-1 text-sm text-zinc-300">{profile.competencies.map(item => <li key={item}>• {translateProfileText(item)}</li>)}</ul></div>
              <div><label className={labelClass}>Responsabilidades</label><ul className="space-y-1 text-sm text-zinc-300">{profile.responsibilities.map(item => <li key={item}>• {translateProfileText(item)}</li>)}</ul></div>
            </div>
          </div>}

          {tab === 'instructions' && <div className="grid min-h-[560px] gap-4 lg:grid-cols-[260px_minmax(0,1fr)]">
            <aside className="space-y-2">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">Arquivos de instrução</p>
              {FILES.map(file => <button key={file.name} onClick={() => setActiveFile(file.name)} className={`w-full rounded-xl border p-3 text-left ${activeFile === file.name ? 'border-blue-600 bg-blue-950/30' : 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-700'}`}><div className="flex items-center gap-2 text-sm font-semibold text-zinc-200">{file.icon}{file.name}</div><p className="mt-1 text-xs leading-5 text-zinc-500">{file.description}</p></button>)}
              <p className="pt-2 text-xs leading-5 text-zinc-600">Edite o conteúdo antes de exportar. Habilidades reutilizáveis permanecem em arquivos SKILL.md próprios.</p>
            </aside>
            <section className="flex min-h-[500px] min-w-0 flex-col overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/40">
              <div className="flex items-center justify-between gap-2 border-b border-zinc-800 px-3 py-2"><div className="flex items-center gap-2 text-sm font-medium text-zinc-200"><FileText className="h-4 w-4 text-zinc-500" />{activeFile}</div><div className="flex gap-1"><button onClick={copyActive} className="rounded-md p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white" title="Copiar conteúdo">{copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}</button><button onClick={() => download(activeFile, files[activeFile])} className="rounded-md p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white" title="Baixar arquivo"><Download className="h-4 w-4" /></button></div></div>
              <textarea value={files[activeFile]} onChange={event => setFiles(current => ({ ...current, [activeFile]: event.target.value }))} spellCheck={false} className="min-h-[480px] flex-1 resize-y bg-transparent p-4 font-mono text-xs leading-6 text-zinc-300 outline-none" aria-label={`Conteúdo de ${activeFile}`} />
            </section>
          </div>}

          {tab === 'runtime' && <div className="mx-auto max-w-3xl space-y-5">
            <div className="rounded-xl border border-amber-900/60 bg-amber-950/20 p-4 text-sm text-amber-100">Preencha os parâmetros da instância. Adaptador, modelo, diretório e orçamento não são presumidos: precisam corresponder ao ambiente real da NettosCorp.</div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div><label className={labelClass}>Cargo</label><input className={inputClass} value={role} onChange={e => setRole(e.target.value)} placeholder="Cargo na estrutura NettosCorp" /></div>
              <div><label className={labelClass}>Reporta-se a</label><input className={inputClass} value={reportsTo} onChange={e => setReportsTo(e.target.value)} placeholder="Agente ou cargo superior" /></div>
              <div><label className={labelClass}>Adaptador do Paperclip</label><input className={inputClass} value={adapter} onChange={e => setAdapter(e.target.value)} placeholder="Definir conforme runtime disponível" /></div>
              <div><label className={labelClass}>Modelo</label><input className={inputClass} value={model} onChange={e => setModel(e.target.value)} placeholder="Provedor / identificador do modelo" /></div>
              <div><label className={labelClass}>Diretório de trabalho</label><input className={inputClass} value={workingDirectory} onChange={e => setWorkingDirectory(e.target.value)} placeholder="/workspace/..." /></div>
              <div><label className={labelClass}>Orçamento mensal</label><input className={inputClass} type="number" min="0" step="0.01" value={monthlyBudget} onChange={e => setMonthlyBudget(e.target.value)} placeholder="Definir limite mensal" /></div>
            </div>
            <div><label className={labelClass}>Habilidades (nomes separados por vírgula)</label><input className={inputClass} value={skills} onChange={e => setSkills(e.target.value)} placeholder="ex.: revisão-de-código, resposta-a-incidentes" /><p className="mt-1 text-xs text-zinc-600">Referencie habilidades existentes e aprovadas. Não cole seus conteúdos aqui.</p></div>
            <div className="rounded-xl border border-zinc-800 p-4"><h3 className="text-sm font-semibold text-zinc-200">Checklist antes da criação</h3><ul className="mt-3 space-y-2 text-xs text-zinc-400"><li>• Superior hierárquico definido e existente no Paperclip.</li><li>• Adaptador e modelo disponíveis no ambiente.</li><li>• Diretório de trabalho válido e permissões conferidas.</li><li>• Orçamento aprovado e compatível com o caixa.</li><li>• Arquivos Markdown revisados e habilidades existentes.</li></ul></div>
          </div>}
        </main>

        <footer className="flex flex-col gap-3 border-t border-zinc-800 bg-zinc-950 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="text-xs text-zinc-600">Rascunho local · Nenhum agente foi criado ou alterado no Paperclip.</p>
          <div className="flex flex-wrap gap-2"><button onClick={() => FILES.forEach(file => download(file.name, files[file.name]))} className="flex items-center gap-2 rounded-lg border border-zinc-700 px-3 py-2 text-xs font-medium text-zinc-300 hover:bg-zinc-800"><Download className="h-4 w-4" /> Baixar .md</button><button onClick={downloadConfig} className="flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-500"><Package className="h-4 w-4" /> Exportar configuração JSON</button></div>
        </footer>
      </section>
    </div>
  );
};
