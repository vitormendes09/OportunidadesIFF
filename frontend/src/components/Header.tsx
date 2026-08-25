'use client';

import { AppBar, Avatar, Box, Button, Toolbar, Typography } from '@mui/material';
import Image from 'next/image';
import Link from 'next/link';
import { Role } from '@/types/api';
import { useAuth } from '@/contexts/AuthContext';
import iffLogo from '@/imgs/ifflogo-removebg-preview.png';

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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.5 }, minWidth: 0 }}>
          <Image
            src={iffLogo}
            alt="Instituto Federal Fluminense"
            width={40}
            height={40}
            priority
            style={{ width: 'clamp(30px, 4vw, 40px)', height: 'auto', flexShrink: 0 }}
          />
          <Typography
            variant="h3"
            component="span"
            sx={{ fontWeight: 700, whiteSpace: 'nowrap', fontSize: { xs: 16, sm: 18 } }}
          >
            Oportunidades IFF
          </Typography>
        </Box>

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
      <Box sx={{ height: 4, bgcolor: 'primary.main' }} />
    </AppBar>
  );
}
