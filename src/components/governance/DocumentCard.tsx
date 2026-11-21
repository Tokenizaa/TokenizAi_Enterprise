/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { GovernanceDocument } from '../../types';
import { StatusBadge } from '../organization/StatusBadge';
import { FileText, Download, ExternalLink, Calendar, Hash } from 'lucide-react';

interface DocumentCardProps {
  document: GovernanceDocument;
  onPreview?: (doc: GovernanceDocument) => void;
  onNavigateCrossref?: (refCode: string) => void;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({
  document,
  onPreview,
  onNavigateCrossref,
}) => {
  const formatBytes = (bytes?: number) => {
    if (!bytes) return '420 KB';
    return `${(bytes / 1024).toFixed(1)} KB`;
  };

  return (
    <div className="p-5 bg-zinc-900/80 border border-zinc-800 rounded-lg hover:border-zinc-700 transition-all flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-zinc-800 text-amber-400 flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-mono text-zinc-500 uppercase">
                  {document.doc_code}
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-300 border border-zinc-700/60">
                  v{document.version}
                </span>
              </div>
              <h4 className="text-sm font-semibold text-zinc-100">{document.title}</h4>
            </div>
          </div>
          <StatusBadge status={document.doc_type} />
        </div>

        {/* Cross-reference Badges */}
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
          {document.cns_ref && (
            <button
              onClick={() => onNavigateCrossref?.(document.cns_ref!)}
              className="px-2 py-0.5 rounded bg-zinc-950 border border-sky-800/40 text-sky-400 hover:text-sky-300 font-mono text-[11px] flex items-center gap-1 transition-colors"
            >
              <Hash className="w-3 h-3" /> CNS: {document.cns_ref}
            </button>
          )}

          {document.dec_ref && (
            <button
              onClick={() => onNavigateCrossref?.(document.dec_ref!)}
              className="px-2 py-0.5 rounded bg-zinc-950 border border-amber-800/40 text-amber-400 hover:text-amber-300 font-mono text-[11px] flex items-center gap-1 transition-colors"
            >
              <Hash className="w-3 h-3" /> DEC: {document.dec_ref}
            </button>
          )}

          {document.delib_ref && (
            <button
              onClick={() => onNavigateCrossref?.(document.delib_ref!)}
              className="px-2 py-0.5 rounded bg-zinc-950 border border-emerald-800/40 text-emerald-400 hover:text-emerald-300 font-mono text-[11px] flex items-center gap-1 transition-colors"
            >
              <Hash className="w-3 h-3" /> DELIB: {document.delib_ref}
            </button>
          )}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
        <span className="font-mono text-zinc-500">
          {formatBytes(document.file_size_bytes)} · {document.author_name || 'Conselho'}
        </span>

        <div className="flex items-center gap-2">
          {onPreview && (
            <button
              onClick={() => onPreview(document)}
              className="px-2.5 py-1 text-xs text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800 rounded border border-zinc-800 transition-colors inline-flex items-center gap-1"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Visualizar</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
