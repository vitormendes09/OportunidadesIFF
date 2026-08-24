'use client';

import { Box, CircularProgress } from '@mui/material';
import type { ReactNode } from 'react';
import { Header } from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';

export default function AppLayout({ children }: { children: ReactNode }) {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <Box component="main" sx={{ flexGrow: 1, maxWidth: 'container', width: '100%', mx: 'auto', p: 3 }}>
        {children}
      </Box>
    </Box>
  );
}
