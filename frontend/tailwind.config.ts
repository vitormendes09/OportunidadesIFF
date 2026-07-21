import type { Config } from 'tailwindcss';
import { colors, fontFamily, spacing, containerMax, borderRadius } from './src/theme/tokens';

const config: Config = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: colors.primary,
        'primary-container': colors.primaryContainer,
        'on-primary': colors.onPrimary,
        'on-primary-container': colors.onPrimaryContainer,
        secondary: colors.secondary,
        'secondary-container': colors.secondaryContainer,
        tertiary: colors.tertiary,
        'tertiary-container': colors.tertiaryContainer,
        error: colors.error,
        'error-container': colors.errorContainer,
        background: colors.background,
        surface: colors.surface,
        'surface-container-lowest': colors.surfaceContainerLowest,
        'surface-container-low': colors.surfaceContainerLow,
        'surface-container': colors.surfaceContainer,
        'surface-container-high': colors.surfaceContainerHigh,
        'on-surface': colors.onSurface,
        'on-surface-variant': colors.onSurfaceVariant,
        outline: colors.outline,
        'outline-variant': colors.outlineVariant,
      },
      fontFamily: {
        sans: fontFamily.sans,
      },
      spacing: {
        base: spacing.base,
        xs: spacing.xs,
        sm: spacing.sm,
        md: spacing.md,
        lg: spacing.lg,
        xl: spacing.xl,
      },
      maxWidth: {
        container: containerMax,
      },
      borderRadius: {
        DEFAULT: borderRadius.DEFAULT,
        lg: borderRadius.lg,
        xl: borderRadius.xl,
        full: borderRadius.full,
      },
    },
  },
  plugins: [],
};

export default config;
