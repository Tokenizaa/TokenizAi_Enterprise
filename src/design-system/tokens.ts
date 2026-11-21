/**
 * NettosCorp — Design System Tokens (v1)
 *
 * Single source of truth for the platform's visual language:
 * colors, typography, spacing, radius, shadows, transitions and z-index.
 *
 * Values are consumed by:
 *  - src/index.css  -> Tailwind v4 @theme custom properties (--nc-*)
 *  - components   -> direct JS consumption for non-CSS concerns (charts, canvas, measurements)
 *
 * Palette: deep zinc dark surface with amber brand accent (ISO-aligned contrast on dark).
 */

export const ncColors = {
  // Brand
  brand: '#f59e0b', // amber-500
  brandHover: '#d97706', // amber-600
  brandText: '#0b0c0d', // ink on brand
  brandSoft: '#fcd34d', // amber-400 soft

  // Surfaces (dark-first)
  surface: '#09090b', // zinc-950 — body / app background
  surfaceElevated: '#0f0f11', // zinc-900 — cards, sheets, modals
  surfaceHover: '#17181a', // hover state inside elevated surfaces
  surfaceInput: '#0f0f11', // form fields

  // Borders
  border: '#27272a', // zinc-800
  borderHover: '#3f3f46', // zinc-700
  borderFocus: '#f59e0b', // brand focus ring

  // Text
  text: '#fafafa', // zinc-50 — primary
  textSecondary: '#a1a1aa', // zinc-400 — secondary
  textMuted: '#71717a', // zinc-500 — auxiliary / captions
  textInverse: '#09090b', // text on light/brand surfaces

  // Semantics
  success: '#22c55e', // emerald-500
  successSoft: '#064e3b', // emerald-950 soft bg
  warn: '#f59e0b', // amber-500
  warnSoft: '#451a03', // amber-950 soft bg
  error: '#ef4444', // red-500
  errorSoft: '#450a0a', // red-950 soft bg
  info: '#38bdf8', // sky-400
  infoSoft: '#0c4a6e', // blue-900 soft bg
} as const;

export const ncTypography = {
  fontSans:
    "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  fontMono: "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  // font-size / line-height pairs
  xs: { size: '0.75rem', leading: '1rem' }, // 12px
  sm: { size: '0.875rem', leading: '1.25rem' }, // 14px
  base: { size: '1rem', leading: '1.5rem' }, // 16px
  lg: { size: '1.125rem', leading: '1.75rem' }, // 18px
  xl: { size: '1.25rem', leading: '1.75rem' }, // 20px
  '2xl': { size: '1.5rem', leading: '2rem' }, // 24px
  '3xl': { size: '1.875rem', leading: '2.25rem' }, // 30px
  fontWeight: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    black: 800,
  },
} as const;

export const ncRadius = {
  sm: '0.375rem',
  md: '0.5rem',
  lg: '0.75rem',
  xl: '1rem',
  full: '9999px',
} as const;

export const ncShadows = {
  xs: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  sm: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
} as const;

export const ncTransitions = {
  fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
  normal: '250ms cubic-bezier(0.4, 0, 0.2, 1)',
  slow: '350ms cubic-bezier(0.4, 0, 0.2, 1)',
} as const;

export const ncZIndex = {
  dropdown: 40,
  sticky: 50,
  drawer: 60,
  modal: 70,
  tooltip: 80,
} as const;

export const ncBreakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
} as const;

export interface DesignTokens {
  colors: typeof ncColors;
  typography: typeof ncTypography;
  radius: typeof ncRadius;
  shadows: typeof ncShadows;
  transitions: typeof ncTransitions;
  zIndex: typeof ncZIndex;
  breakpoints: typeof ncBreakpoints;
}

export const tokens: DesignTokens = {
  colors: ncColors,
  typography: ncTypography,
  radius: ncRadius,
  shadows: ncShadows,
  transitions: ncTransitions,
  zIndex: ncZIndex,
  breakpoints: ncBreakpoints,
};

export default tokens;
