'use client';

import { useEffect, useMemo, useState } from 'react';
import { Alert, Autocomplete, Box, Button, CircularProgress, Paper, TextField, Typography } from '@mui/material';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import RestartAltOutlinedIcon from '@mui/icons-material/RestartAltOutlined';
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

  const hasActiveFilters = Boolean(filters.course || filters.requiredPeriod || filters.specialty);

  function clearFilters() {
    setFilters({ course: null, requiredPeriod: '', specialty: '' });
  }

  return (
    <Box sx={{ pb: 5 }}>
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
        <Typography variant="overline" sx={{ display: 'block', letterSpacing: '0.12em', opacity: 0.8 }}>
          Oportunidades IFF
        </Typography>
        <Typography variant="h2" component="h1" sx={{ color: 'inherit', mb: 1 }}>
          Encontre sua próxima oportunidade
        </Typography>
        <Typography sx={{ color: 'inherit', opacity: 0.88, maxWidth: 650 }}>
          Explore vagas de estágio e emprego conectadas à sua formação.
        </Typography>
      </Box>

      <Paper
        variant="outlined"
        sx={{
          p: { xs: 2, md: 2.5 },
          mb: 4,
          borderColor: 'divider',
          borderTop: '3px solid',
          borderTopColor: 'primary.main',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <FilterAltOutlinedIcon color="primary" />
          <Typography variant="h3">Filtre as oportunidades</Typography>
          <Box sx={{ flexGrow: 1 }} />
          {hasActiveFilters && (
            <Button size="small" color="inherit" startIcon={<RestartAltOutlinedIcon />} onClick={clearFilters}>
              Limpar filtros
            </Button>
          )}
        </Box>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'minmax(240px, 1.4fr) minmax(160px, 0.7fr) minmax(240px, 1.4fr)' }, gap: 2 }}>
          <Autocomplete
            options={courses}
            value={filters.course}
            getOptionLabel={(option) => option.name}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            onChange={(_event, value) => setFilters((prev) => ({ ...prev, course: value }))}
            renderInput={(params) => <TextField {...params} label="Curso" />}
          />
          <TextField
            label="Período exigido"
            type="number"
            value={filters.requiredPeriod}
            onChange={(e) => setFilters((prev) => ({ ...prev, requiredPeriod: e.target.value }))}
            slotProps={{ htmlInput: { min: 1 } }}
          />
          <Autocomplete
            freeSolo
            options={specialtyOptions}
            inputValue={filters.specialty}
            onInputChange={(_event, value) => setFilters((prev) => ({ ...prev, specialty: value }))}
            renderInput={(params) => <TextField {...params} label="Especialidade" />}
          />
        </Box>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {!isLoading && !error && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {jobs.length} {jobs.length === 1 ? 'oportunidade encontrada' : 'oportunidades encontradas'}
        </Typography>
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
