/**
 * NettosCorp — StatCard
 * Primary KPI card built on the design-system Card primitive.
 */

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Card } from '../../design-system';

interface StatCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  subtext?: string;
  trend?: {
    direction: 'up' | 'down' | 'neutral';
    text: string;
  };
  icon?: LucideIcon;
  onClick?: () => void;
  className?: string;
}

const TREND_CLASSES: Record<
  'up' | 'down' | 'neutral',
  { color: string; marker: string }
> = {
  up: { color: 'text-emerald-400', marker: '↑' },
  down: { color: 'text-rose-400', marker: '↓' },
  neutral: { color: 'text-nc-text-muted', marker: '·' },
};

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subValue,
  subtext,
  trend,
  icon: Icon,
  onClick,
  className = '',
}) => {
  const trendStyle =
    TREND_CLASSES[
      (trend?.direction ?? 'neutral') as keyof typeof TREND_CLASSES
    ];

  return (
    <Card
      padded
      paddingSize="md"
      className={`${onClick ? 'cursor-pointer hover:border-nc-border-hover transition-all' : ''} ${className}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between text-nc-text-muted mb-2">
        <span className="text-xs font-medium tracking-wide uppercase">{label}</span>
        {Icon && <Icon className="w-4 h-4 text-nc-text-muted" />}
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold tracking-tight text-nc-text font-mono tabular-nums">
          {value}
        </span>
        {(subtext || subValue) && (
          <span className="text-xs text-nc-text-muted font-normal">
            {subtext || subValue}
          </span>
        )}
      </div>

      {trend && (
        <div className="mt-2 text-xs flex items-center gap-1.5 font-mono">
          <span className={trendStyle.color}>{trendStyle.marker}</span>
          <span className="text-nc-text-secondary">{trend.text}</span>
        </div>
      )}
    </Card>
  );
};

StatCard.displayName = 'StatCard';
