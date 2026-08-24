'use client';

import { useState, type FormEvent } from 'react';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  Paper,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useAuth } from '@/contexts/AuthContext';
import { useCourses } from '@/hooks/useCourses';
import { api, extractErrorMessage } from '@/lib/api';
import { Role, type CourseResponseDto, type UserResponseDto } from '@/types/api';

export default function PerfilPage() {
  const { user, refreshUser } = useAuth();
  const isStudent = user?.role === Role.STUDENT;
  const { courses, isLoading: isLoadingCourses } = useCourses();

  // O layout (app)/layout.tsx só renderiza esta página depois que o AuthContext
  // termina de carregar (isLoading=false), então `user` já vem populado no primeiro
  // render — os campos podem partir direto dele, sem efeito de sincronização.
  const [name, setName] = useState(user?.name ?? '');
  const [period, setPeriod] = useState(user?.period !== undefined ? String(user.period) : '');

  // `courses` chega de forma assíncrona (hook próprio), então o curso selecionado é
  // derivado a cada render em vez de copiado para state via efeito; `courseOverride`
  // só existe depois que o aluno mexe no Autocomplete.
  const [courseOverride, setCourseOverride] = useState<CourseResponseDto | null | undefined>(undefined);
  const derivedCourse = courses.find((c) => c.id === user?.course) ?? null;
  const course = courseOverride !== undefined ? courseOverride : derivedCourse;

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (isStudent && !course) {
      setError('Selecione um curso.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Admin não possui curso/período — UpdateMeDto rejeita esses campos para
      // esse perfil, então só o Student os envia.
      await api.patch<UserResponseDto>('/users/me', {
        name,
        ...(isStudent ? { course: course!.id, period: Number(period) } : {}),
      });
      await refreshUser();
      setShowSuccess(true);
    } catch (err) {
      setError(extractErrorMessage(err, 'Não foi possível salvar o perfil.'));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 480 }}>
      <Typography variant="h2" component="h1" gutterBottom>
        Meu perfil
      </Typography>

      <Paper variant="outlined" sx={{ p: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Stack spacing={2}>
            <TextField label="E-mail" value={user.email} disabled fullWidth />
            <TextField
              label="Nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              fullWidth
            />
            {isStudent && (
              <>
                <Autocomplete
                  options={courses}
                  value={course}
                  loading={isLoadingCourses}
                  getOptionLabel={(option) => option.name}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  onChange={(_event, value) => setCourseOverride(value)}
                  renderInput={(params) => <TextField {...params} label="Curso" required />}
                />
                <TextField
                  label="Período"
                  type="number"
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  required
                  fullWidth
                  slotProps={{ htmlInput: { min: 1 } }}
                />
              </>
            )}
            <Box>
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={isSubmitting}
                startIcon={isSubmitting ? <CircularProgress size={18} color="inherit" /> : undefined}
              >
                Salvar alterações
              </Button>
            </Box>
          </Stack>
        </Box>
      </Paper>

      <Snackbar
        open={showSuccess}
        autoHideDuration={3000}
        onClose={() => setShowSuccess(false)}
        message="Perfil atualizado com sucesso."
      />
    </Box>
  );
}
