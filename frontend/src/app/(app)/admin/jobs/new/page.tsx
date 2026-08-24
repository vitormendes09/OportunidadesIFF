'use client';

import { Box, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';
import { JobForm } from '@/components/admin/JobForm';
import { api } from '@/lib/api';
import type { CreateJobRequestDto, JobResponseDto } from '@/types/api';

export default function NewJobPage() {
  const router = useRouter();

  async function handleSubmit(payload: CreateJobRequestDto) {
    await api.post<JobResponseDto>('/jobs', payload);
    router.push('/admin/jobs');
  }

  return (
    <Box>
      <Typography variant="h3" component="h2" gutterBottom>
        Nova vaga
      </Typography>
      <JobForm submitLabel="Criar vaga" onSubmit={handleSubmit} />
    </Box>
  );
}
