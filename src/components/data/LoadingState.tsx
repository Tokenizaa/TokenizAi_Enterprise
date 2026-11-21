/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface LoadingStateProps {
  rows?: number;
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ rows = 5, className = '' }) => {
  return (
    <div className={`space-y-3 p-4 bg-zinc-900/40 border border-zinc-800 rounded-lg animate-pulse ${className}`}>
      <div className="h-4 bg-zinc-800 rounded w-1/4"></div>
      <div className="space-y-2 pt-2">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="h-8 bg-zinc-800/60 rounded w-full"></div>
        ))}
      </div>
    </div>
  );
};
