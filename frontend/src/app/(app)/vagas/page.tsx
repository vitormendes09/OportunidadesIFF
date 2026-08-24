'use client';

import { useEffect, useMemo, useState } from 'react';
import { Alert, Autocomplete, Box, CircularProgress, TextField, Typography } from '@mui/material';
import { JobCard } from '@/components/student/JobCard';
import { useCourses } from '@/hooks/useCourses';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { api, extractErrorMessage } from '@/lib/api';
import type { CourseResponseDto, JobResponseDto } from '@/types/api';

// Filtros restritos exatamente ao que ListJobsQueryDto aceita no backend
// (backend/src/jobs/dto/list-jobs-query.dto.ts): course (1 curso, não multi-select —
// o parâmetro é uma string única), requiredPeriod (número) e specialty (string única,
// comparada com match exato case-insensitive no backend, não substring).
interface JobFilters {
  course: CourseResponseDto | null;
  requiredPeriod: string;
  specialty: string;
}

export default function VagasPage() {
  const { courses } = useCourses();
  const [filters, setFilters] = useState<JobFilters>({ course: null, requiredPeriod: '', specialty: '' });
  const debouncedFilters = useDebouncedValue(filters, 400);

  const [jobs, setJobs] = useState<JobResponseDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadJobs() {
      setIsLoading(true);
      setError(null);
      try {
        const response = await api.get<JobResponseDto[]>('/jobs', {
          params: {
            course: debouncedFilters.course?.id || undefined,
            requiredPeriod: debouncedFilters.requiredPeriod || undefined,
            specialty: debouncedFilters.specialty || undefined,
          },
        });
        // A API já retorna ordenado por publishedAt desc (RN15) — nunca reordenar aqui.
        if (!cancelled) setJobs(response.data);
      } catch (err) {
        if (!cancelled) setError(extractErrorMessage(err, 'Não foi possível carregar as vagas.'));
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void loadJobs();
    return () => {
      cancelled = true;
    };
  }, [debouncedFilters]);

  // Opções de especialidade derivadas das vagas já carregadas — não existe endpoint
  // de "lista de especialidades" no backend, e o match de `specialty` é exato, então
  // sugerir os valores realmente em uso ajuda o aluno a acertar o texto.
  const specialtyOptions = useMemo(() => {
    const set = new Set<string>();
    jobs.forEach((job) => job.specialties.forEach((s) => set.add(s)));
    return Array.from(set).sort();
  }, [jobs]);

  return (
    <Box>
      <Typography variant="h2" component="h1" gutterBottom>
        Vagas disponíveis
      </Typography>

      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 2,
          mb: 3,
        }}
      >
        <Autocomplete
          options={courses}
          value={filters.course}
          getOptionLabel={(option) => option.name}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          onChange={(_event, value) => setFilters((prev) => ({ ...prev, course: value }))}
          sx={{ minWidth: 240 }}
          renderInput={(params) => <TextField {...params} label="Curso" />}
        />
        <TextField
          label="Período exigido"
          type="number"
          value={filters.requiredPeriod}
          onChange={(e) => setFilters((prev) => ({ ...prev, requiredPeriod: e.target.value }))}
          slotProps={{ htmlInput: { min: 1 } }}
          sx={{ minWidth: 180 }}
        />
        <Autocomplete
          freeSolo
          options={specialtyOptions}
          inputValue={filters.specialty}
          onInputChange={(_event, value) => setFilters((prev) => ({ ...prev, specialty: value }))}
          sx={{ minWidth: 240 }}
          renderInput={(params) => <TextField {...params} label="Especialidade" />}
        />
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : jobs.length === 0 ? (
        <Alert severity="info">Nenhuma vaga encontrada para os filtros selecionados.</Alert>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </Box>
  );
}
