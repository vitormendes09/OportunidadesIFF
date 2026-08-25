'use client';

import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Paper,
  Snackbar,
  Stack,
  Typography,
} from '@mui/material';
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import OpenInNewOutlinedIcon from '@mui/icons-material/OpenInNewOutlined';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { api, extractErrorMessage } from '@/lib/api';
import type { JobResponseDto } from '@/types/api';

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [job, setJob] = useState<JobResponseDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shareMessage, setShareMessage] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<JobResponseDto>(`/jobs/${id}`)
      .then((response) => setJob(response.data))
      .catch((err) => setError(extractErrorMessage(err, 'Vaga não encontrada.')))
      .finally(() => setIsLoading(false));
  }, [id]);

  async function handleShare() {
    if (!job) return;
    const url = window.location.href;

    // Requisito técnico #3 da Etapa 06: sempre checar navigator.share antes de usar,
    // com fallback funcional de copiar link — nunca deixar o botão sem ação.
    if (navigator.share) {
      try {
        await navigator.share({ title: job.title, url });
      } catch {
        // Usuário cancelou o compartilhamento nativo — não é um erro a reportar.
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(url);
      setShareMessage('Link copiado para a área de transferência.');
    } catch {
      setShareMessage('Não foi possível copiar o link automaticamente.');
    }
  }

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !job) {
    return <Alert severity="error">{error ?? 'Vaga não encontrada.'}</Alert>;
  }

  const publishedDate = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long' }).format(new Date(job.publishedAt));

  return (
    <Box sx={{ maxWidth: 1120, mx: 'auto', pb: 5 }}>
      <Button component={Link} href="/vagas" color="inherit" startIcon={<ArrowBackOutlinedIcon />} sx={{ mb: 2 }}>
        Voltar para vagas
      </Button>

      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          borderRadius: 2,
          px: { xs: 2.5, md: 4 },
          py: { xs: 3, md: 4 },
          mb: 3,
        }}
      >
        <Typography variant="overline" sx={{ display: 'block', letterSpacing: '0.12em', opacity: 0.82 }}>
          Oportunidade profissional
        </Typography>
        <Typography variant="h2" component="h1" sx={{ color: 'inherit', mb: 1 }}>
          {job.title}
        </Typography>
        <Typography sx={{ color: 'inherit', fontSize: 18, fontWeight: 600, mb: 1 }}>
          {job.companyName}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, opacity: 0.86 }}>
          <CalendarTodayOutlinedIcon sx={{ fontSize: 17 }} />
          <Typography variant="body2">Publicado em {publishedDate}</Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1.6fr) minmax(280px, 0.8fr)' }, gap: 3, alignItems: 'start' }}>
        <Paper variant="outlined" sx={{ p: { xs: 2.5, md: 4 } }}>
          <Typography variant="h3" component="h2" gutterBottom>
            Sobre a oportunidade
          </Typography>
          <Typography variant="body1" sx={{ whiteSpace: 'pre-line', mb: 4 }}>
            {job.description}
          </Typography>

          {job.hasBenefits && job.benefitsDescription && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="h3" component="h2" gutterBottom>
                Benefícios
              </Typography>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                {job.benefitsDescription}
              </Typography>
            </Box>
          )}

          <Divider sx={{ mb: 3 }} />
          <Typography variant="h3" component="h2" gutterBottom>
            Empresa
          </Typography>
          <Typography variant="body1" sx={{ mb: 4 }}>
            {job.companyLocation}
          </Typography>

          <Typography variant="h3" component="h2" gutterBottom>
            Formação desejada
          </Typography>
          <Stack direction="row" sx={{ mb: 3, flexWrap: 'wrap', gap: 1 }}>
            {job.courses.map((course) => (
              <Chip key={course.id} label={course.name ?? '(curso removido)'} sx={{ bgcolor: 'surfaceContainer' }} />
            ))}
          </Stack>
          {job.specialties.length > 0 && (
            <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1 }}>
              {job.specialties.map((specialty) => (
                <Chip key={specialty} label={specialty} variant="outlined" color="primary" />
              ))}
            </Stack>
          )}
        </Paper>

        <Paper variant="outlined" sx={{ p: { xs: 2.5, md: 3 }, position: { md: 'sticky' }, top: { md: 24 } }}>
          <Typography variant="h3" component="h2" sx={{ mb: 2 }}>
            Resumo da vaga
          </Typography>
          <Stack spacing={2} sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <LocationOnOutlinedIcon color="primary" />
              <Box><Typography variant="caption" color="text.secondary">Modalidade e local</Typography><Typography variant="body2">{job.workModel} — {job.workLocation}</Typography></Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <DescriptionOutlinedIcon color="primary" />
              <Box><Typography variant="caption" color="text.secondary">Tipo de contrato</Typography><Typography variant="body2">{job.contractType}</Typography></Box>
            </Box>
            {job.requiredPeriod !== undefined && (
              <Box><Typography variant="caption" color="text.secondary">Período exigido</Typography><Typography variant="body2">A partir do {job.requiredPeriod}º período</Typography></Box>
            )}
          </Stack>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="caption" color="text.secondary">Remuneração</Typography>
          <Typography variant="h3" sx={{ color: 'primary.main', mb: 3 }}>{job.salary ?? 'A combinar'}</Typography>
          <Stack spacing={1.5}>
            <Button component="a" href={job.applicationUrl} target="_blank" rel="noopener noreferrer" variant="contained" size="large" fullWidth endIcon={<OpenInNewOutlinedIcon />}>
              Ir para o processo seletivo
            </Button>
            <Button variant="outlined" size="large" fullWidth startIcon={<ShareOutlinedIcon />} onClick={handleShare}>
              Compartilhar vaga
            </Button>
          </Stack>
        </Paper>
      </Box>

      <Snackbar
        open={shareMessage !== null}
        autoHideDuration={4000}
        onClose={() => setShareMessage(null)}
        message={shareMessage}
      />
    </Box>
  );
}
