'use client';

import { useEffect, useState } from 'react';
import { Alert, Box, CircularProgress, Typography } from '@mui/material';
import { useParams, useRouter } from 'next/navigation';
import { JobForm } from '@/components/admin/JobForm';
import { api, extractErrorMessage } from '@/lib/api';
import type { CreateJobRequestDto, JobResponseDto } from '@/types/api';

export default function EditJobPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [job, setJob] = useState<JobResponseDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api
      .get<JobResponseDto>(`/jobs/${id}`)
      .then((response) => setJob(response.data))
      .catch((err) => setError(extractErrorMessage(err, 'Vaga não encontrada.')))
      .finally(() => setIsLoading(false));
  }, [id]);

  async function handleSubmit(payload: CreateJobRequestDto) {
    await api.patch<JobResponseDto>(`/jobs/${id}`, payload);
    router.push('/admin/jobs');
  }

  return (
    <Box>
      <Typography variant="h3" component="h2" gutterBottom>
        Editar vaga
      </Typography>
      {isLoading && <CircularProgress />}
      {error && <Alert severity="error">{error}</Alert>}
      {job && <JobForm initialJob={job} submitLabel="Salvar alterações" onSubmit={handleSubmit} />}
    </Box>
  );
}
