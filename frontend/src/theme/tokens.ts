// Fonte única de tokens visuais (Oportunidades IFF), extraídos de agents/design-system.md.
// Consumido por tailwind.config.ts e por src/theme/mui-theme.ts — nunca duplicar estes
// valores hardcoded em outro lugar.

export const colors = {
  primary: '#237a3b',
  primaryContainer: '#2f9e44',
  onPrimary: '#ffffff',
  onPrimaryContainer: '#dff3e3',
  secondary: '#526057',
  secondaryContainer: '#dfe9e1',
  tertiary: '#a10219',
  tertiaryContainer: '#c4262e',
  error: '#ba1a1a',
  errorContainer: '#ffdad6',
  background: '#f7faf8',
  surface: '#f7faf8',
  surfaceContainerLowest: '#ffffff',
  surfaceContainerLow: '#edf6ef',
  surfaceContainer: '#e2efe4',
  surfaceContainerHigh: '#d6e9da',
  onSurface: '#10261a',
  onSurfaceVariant: '#435248',
  outline: '#748178',
  outlineVariant: '#c6d2c8',
} as const;

export const fontFamily = {
  sans: ['var(--font-manrope)', 'Arial', 'Helvetica', 'sans-serif'],
} as const;

export const typography = {
  displayLg: { fontSize: '48px', lineHeight: '56px', fontWeight: 800, letterSpacing: '-0.02em' },
  headlineLg: { fontSize: '32px', lineHeight: '40px', fontWeight: 700, letterSpacing: '-0.01em' },
  headlineLgMobile: { fontSize: '24px', lineHeight: '32px', fontWeight: 700 },
  titleMd: { fontSize: '18px', lineHeight: '24px', fontWeight: 600 },
  bodyMd: { fontSize: '16px', lineHeight: '24px', fontWeight: 400 },
  labelSm: { fontSize: '12px', lineHeight: '16px', fontWeight: 600, letterSpacing: '0.05em' },
} as const;

export const spacing = {
  base: '4px',
  xs: '8px',
  sm: '16px',
  md: '24px',
  lg: '32px',
  xl: '48px',
} as const;

export const containerMax = '1200px';

export const borderRadius = {
  DEFAULT: '0.25rem',
  lg: '0.5rem',
  xl: '0.75rem',
  full: '9999px',
} as const;

export const tokens = {
  colors,
  fontFamily,
  typography,
  spacing,
  containerMax,
  borderRadius,
} as const;

export default tokens;
