'use client';

import { AppRouterCacheProvider } from '@mui/material-nextjs/v16-appRouter';
import { CssBaseline, ThemeProvider } from '@mui/material';
import type { ReactNode } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { muiTheme } from './mui-theme';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AppRouterCacheProvider options={{ key: 'mui' }}>
      <ThemeProvider theme={muiTheme}>
        <CssBaseline />
        <AuthProvider>{children}</AuthProvider>
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}
