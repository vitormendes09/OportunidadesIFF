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
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
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

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      <Paper variant="outlined" sx={{ p: 4 }}>
        <Typography variant="h2" component="h1" gutterBottom>
          {job.title}
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          {job.companyName}
        </Typography>

        <Stack direction="row" spacing={3} sx={{ my: 2, color: 'text.secondary' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <LocationOnOutlinedIcon fontSize="small" />
            <Typography variant="body2">{job.workModel} — {job.workLocation}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <DescriptionOutlinedIcon fontSize="small" />
            <Typography variant="body2">{job.contractType}</Typography>
          </Box>
        </Stack>

        <Typography variant="body1" sx={{ fontWeight: 600, mb: 2 }}>
          {job.salary ?? 'A combinar'}
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Typography variant="h3" component="h2" gutterBottom>
          Descrição
        </Typography>
        <Typography variant="body1" sx={{ whiteSpace: 'pre-line', mb: 2 }}>
          {job.description}
        </Typography>

        {job.hasBenefits && job.benefitsDescription && (
          <>
            <Typography variant="h3" component="h2" gutterBottom>
              Benefícios
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {job.benefitsDescription}
            </Typography>
          </>
        )}

        <Typography variant="h3" component="h2" gutterBottom>
          Empresa
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          {job.companyLocation}
        </Typography>

        {job.requiredPeriod !== undefined && (
          <Typography variant="body1" sx={{ mb: 2 }}>
            Período exigido: {job.requiredPeriod}º
          </Typography>
        )}

        <Typography variant="h3" component="h2" gutterBottom>
          Cursos
        </Typography>
        <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
          {job.courses.map((course) => (
            <Chip key={course.id} label={course.name ?? '(curso removido)'} />
          ))}
        </Stack>

        {job.specialties.length > 0 && (
          <>
            <Typography variant="h3" component="h2" gutterBottom>
              Especialidades
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mb: 3, flexWrap: 'wrap', gap: 1 }}>
              {job.specialties.map((specialty) => (
                <Chip key={specialty} label={specialty} variant="outlined" />
              ))}
            </Stack>
          </>
        )}

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <Button
            component="a"
            href={job.applicationUrl}
            target="_blank"
            rel="noopener noreferrer"
            variant="contained"
            size="large"
          >
            Ir para o processo seletivo
          </Button>
          <Button
            variant="outlined"
            size="large"
            startIcon={<ShareOutlinedIcon />}
            onClick={handleShare}
          >
            Compartilhar
          </Button>
        </Stack>
      </Paper>

      <Snackbar
        open={shareMessage !== null}
        autoHideDuration={4000}
        onClose={() => setShareMessage(null)}
        message={shareMessage}
      />
    </Box>
  );
}
