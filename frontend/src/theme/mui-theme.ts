import { createTheme } from '@mui/material/styles';
import { colors, typography, borderRadius } from './tokens';

export const muiTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: colors.primary,
      light: colors.primaryContainer,
      contrastText: colors.onPrimary,
    },
    secondary: {
      main: colors.secondary,
      contrastText: colors.onPrimary,
    },
    error: {
      main: colors.error,
      light: colors.errorContainer,
    },
    background: {
      default: colors.background,
      paper: colors.surfaceContainerLowest,
    },
    text: {
      primary: colors.onSurface,
      secondary: colors.onSurfaceVariant,
    },
    divider: colors.outlineVariant,
  },
  shape: {
    borderRadius: 4, // borderRadius.DEFAULT (0.25rem)
  },
  typography: {
    fontFamily: 'var(--font-manrope), Arial, Helvetica, sans-serif',
    h1: typography.displayLg,
    h2: typography.headlineLg,
    h3: typography.titleMd,
    body1: typography.bodyMd,
    caption: typography.labelSm,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: borderRadius.DEFAULT,
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
});

export default muiTheme;
