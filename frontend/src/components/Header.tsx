'use client';

import { AppBar, Avatar, Box, Button, Toolbar, Typography } from '@mui/material';
import Link from 'next/link';
import { Role } from '@/types/api';
import { useAuth } from '@/contexts/AuthContext';

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

export function Header() {
  const { user, logout } = useAuth();

  return (
    <AppBar
      position="static"
      color="inherit"
      elevation={0}
      sx={{ borderBottom: '1px solid', borderColor: 'divider' }}
    >
      <Toolbar sx={{ maxWidth: 'container', width: '100%', mx: 'auto', gap: 3 }}>
        <Typography variant="h3" component="span" sx={{ fontWeight: 700 }}>
          Oportunidades IFF
        </Typography>

        {user && (
          <Box sx={{ display: { xs: 'none', sm: 'flex' }, gap: 1 }}>
            <Button component={Link} href="/vagas" color="inherit">
              Vagas
            </Button>
            <Button component={Link} href="/perfil" color="inherit">
              Meu perfil
            </Button>
            {user.role === Role.ADMIN && (
              <Button component={Link} href="/admin" color="inherit">
                Painel Admin
              </Button>
            )}
          </Box>
        )}

        <Box sx={{ flexGrow: 1 }} />

        {user && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32, fontSize: 14 }}>
              {getInitials(user.name)}
            </Avatar>
            <Typography variant="body1" sx={{ display: { xs: 'none', sm: 'block' } }}>
              {user.name}
            </Typography>
            <Button variant="outlined" size="small" onClick={logout}>
              Sair
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}
