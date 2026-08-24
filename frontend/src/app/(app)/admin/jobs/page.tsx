'use client';

import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import EditIcon from '@mui/icons-material/EditOutlined';
import BlockIcon from '@mui/icons-material/BlockOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircleOutlined';
import Link from 'next/link';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { useFeedback } from '@/hooks/useFeedback';
import { api, extractErrorMessage } from '@/lib/api';
import type { JobResponseDto } from '@/types/api';

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState<JobResponseDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingJob, setPendingJob] = useState<JobResponseDto | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);
  const feedback = useFeedback();

  useEffect(() => {
    let cancelled = false;

    async function loadJobs() {
      setIsLoading(true);
      try {
        const response = await api.get<JobResponseDto[]>('/jobs/admin');
        if (!cancelled) setJobs(response.data);
      } catch (err) {
        if (!cancelled) feedback.notifyError(extractErrorMessage(err, 'Não foi possível carregar as vagas.'));
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void loadJobs();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reloadToken]);

  async function handleToggleActive() {
    if (!pendingJob) return;
    setIsSubmitting(true);
    try {
      if (pendingJob.isActive) {
        // Desativação: soft delete real (RN22 — nunca exclusão física).
        await api.delete(`/jobs/${pendingJob.id}`);
        feedback.notifySuccess('Vaga desativada.');
      } else {
        // Não existe endpoint dedicado de reativação (equivalente a
        // /users/students/:id/activate) — o backend aceita `isActive` no
        // PATCH genérico de update, então reativamos por aí.
        await api.patch(`/jobs/${pendingJob.id}`, { isActive: true });
        feedback.notifySuccess('Vaga reativada.');
      }
      setPendingJob(null);
      setReloadToken((token) => token + 1);
    } catch (err) {
      feedback.notifyError(extractErrorMessage(err, 'Não foi possível concluir a ação.'));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h3" component="h2">
          Vagas
        </Typography>
        <Button variant="contained" component={Link} href="/admin/jobs/new">
          Nova vaga
        </Button>
      </Box>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Título</TableCell>
                <TableCell>Empresa</TableCell>
                <TableCell>Contrato</TableCell>
                <TableCell>Modelo</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Publicada em</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {jobs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ color: 'text.secondary' }}>
                    Nenhuma vaga cadastrada ainda.
                  </TableCell>
                </TableRow>
              )}
              {jobs.map((job) => (
                <TableRow key={job.id} hover>
                  <TableCell>{job.title}</TableCell>
                  <TableCell>{job.companyName}</TableCell>
                  <TableCell>{job.contractType}</TableCell>
                  <TableCell>{job.workModel}</TableCell>
                  <TableCell>
                    <Chip
                      label={job.isActive ? 'Ativa' : 'Inativa'}
                      color={job.isActive ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{new Date(job.publishedAt).toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="Editar">
                      <IconButton component={Link} href={`/admin/jobs/${job.id}/edit`} size="small">
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={job.isActive ? 'Desativar' : 'Reativar'}>
                      <IconButton onClick={() => setPendingJob(job)} size="small">
                        {job.isActive ? (
                          <BlockIcon fontSize="small" color="error" />
                        ) : (
                          <CheckCircleIcon fontSize="small" color="success" />
                        )}
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <ConfirmDialog
        open={pendingJob !== null}
        title={pendingJob?.isActive ? 'Desativar vaga' : 'Reativar vaga'}
        description={
          pendingJob?.isActive
            ? `Tem certeza que deseja desativar "${pendingJob?.title}"? Ela deixará de aparecer para os alunos.`
            : `Tem certeza que deseja reativar "${pendingJob?.title}"? Ela voltará a aparecer para os alunos.`
        }
        confirmLabel={pendingJob?.isActive ? 'Desativar' : 'Reativar'}
        confirmColor={pendingJob?.isActive ? 'error' : 'primary'}
        isLoading={isSubmitting}
        onConfirm={handleToggleActive}
        onClose={() => setPendingJob(null)}
      />
      {feedback.Snackbar}
    </Box>
  );
}
