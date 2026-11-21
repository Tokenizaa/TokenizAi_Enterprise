import React, { useEffect, useState } from 'react';

interface AgencyOriginalSourceProps {
  sourceFile: string;
}

export const AgencyOriginalSource: React.FC<AgencyOriginalSourceProps> = ({ sourceFile }) => {
  const [markdown, setMarkdown] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const relativePath = String(sourceFile || '').replace(/[`'"]/g, '').trim();
    if (!relativePath || relativePath.startsWith('/') || relativePath.split('/').some(part => part === '..')) {
      setMarkdown('');
      setError('Caminho da fonte original inválido.');
      return () => { active = false; };
    }

    setLoading(true);
    setError('');
    setMarkdown('');
    const assetPath = relativePath.split('/').map(encodeURIComponent).join('/');
    fetch(`/agency-source/${assetPath}`)
      .then(response => {
        if (!response.ok) throw new Error('Documento de origem ainda não sincronizado nesta versão da plataforma.');
        return response.text();
      })
      .then(content => { if (active) setMarkdown(content); })
      .catch(cause => { if (active) setError(cause instanceof Error ? cause.message : String(cause)); })
      .finally(() => { if (active) setLoading(false); });

    return () => { active = false; };
  }, [sourceFile]);

  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3">
      <details>
        <summary className="cursor-pointer text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Documento original integral (idioma de origem)
        </summary>
        <div className="mt-3">
          {loading && <p className="text-xs text-zinc-500">Carregando documento de origem…</p>}
          {error && <p role="status" className="text-xs text-amber-300">{error}</p>}
          {markdown && <pre className="max-h-[60vh] overflow-auto whitespace-pre-wrap break-words rounded-lg bg-zinc-950 p-4 text-xs leading-5 text-zinc-300">{markdown}</pre>}
        </div>
      </details>
    </section>
  );
};
