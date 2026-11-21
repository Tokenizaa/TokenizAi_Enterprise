/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export interface FormActionsProps {
  onCancel?: () => void;
  submitLabel?: string;
  cancelLabel?: string;
  isSubmitting?: boolean;
  className?: string;
}

export const FormActions: React.FC<FormActionsProps> = ({
  onCancel,
  submitLabel = 'Salvar Alterações',
  cancelLabel = 'Cancelar',
  isSubmitting = false,
  className = '',
}) => {
  return (
    <div className={`flex items-center justify-end gap-3 pt-4 border-t border-zinc-800 ${className}`}>
      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-4 py-2 text-xs font-medium text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800 border border-zinc-800 rounded transition-colors whitespace-nowrap"
        >
          {cancelLabel}
        </button>
      )}
      <button
        type="submit"
        disabled={isSubmitting}
        className="px-4 py-2 text-xs font-medium text-zinc-950 bg-amber-400 hover:bg-amber-300 rounded transition-colors whitespace-nowrap font-medium disabled:opacity-50"
      >
        {isSubmitting ? 'Salvando...' : submitLabel}
      </button>
    </div>
  );
};
