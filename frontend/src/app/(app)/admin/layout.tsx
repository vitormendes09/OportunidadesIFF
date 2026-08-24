'use client';

import { Box, Tab, Tabs, Typography } from '@mui/material';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

const NAV_ITEMS = [
  { label: 'Vagas', href: '/admin/jobs' },
  { label: 'Cursos', href: '/admin/courses' },
  { label: 'Alunos', href: '/admin/students' },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const activeIndex = NAV_ITEMS.findIndex((item) => pathname.startsWith(item.href));

  return (
    <Box>
      <Typography variant="h2" component="h1" gutterBottom>
        Painel do Admin
      </Typography>
      <Tabs value={activeIndex === -1 ? false : activeIndex} sx={{ mb: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
        {NAV_ITEMS.map((item) => (
          <Tab key={item.href} label={item.label} component={Link} href={item.href} />
        ))}
      </Tabs>
      {children}
    </Box>
  );
}
