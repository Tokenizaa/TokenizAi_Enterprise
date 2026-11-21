/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  message = 'Ocorreu uma falha ao sincronizar os dados com o banco corporativo.',
  onRetry,
  className = '',
}) => {
  return (
    <div className={`p-6 bg-rose-950/20 border border-rose-900/40 rounded-lg text-center ${className}`}>
      <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-rose-900/30 flex items-center justify-center text-rose-400">
        <AlertCircle className="w-4 h-4" />
      </div>
      <p className="text-xs font-medium text-rose-300 max-w-md mx-auto">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-300 hover:text-white bg-rose-900/40 hover:bg-rose-900/60 border border-rose-800/50 rounded transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Tentar novamente</span>
        </button>
      )}
    </div>
  );
};
