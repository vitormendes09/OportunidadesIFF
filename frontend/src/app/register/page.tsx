'use client';

import { useEffect, useState, type FormEvent } from 'react';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { api, extractErrorMessage } from '@/lib/api';
import type { CourseResponseDto } from '@/types/api';

const INSTITUTIONAL_DOMAIN = '@gsuite.iff.edu.br';

export default function RegisterPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<CourseResponseDto[]>([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [course, setCourse] = useState<CourseResponseDto | null>(null);
  const [period, setPeriod] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    api
      .get<CourseResponseDto[]>('/courses')
      .then((response) => setCourses(response.data))
      .catch(() => setError('Não foi possível carregar a lista de cursos.'))
      .finally(() => setIsLoadingCourses(false));
  }, []);

  // Validação client-side é só UX — a validação real (domínio institucional,
  // regras de negócio) é sempre feita pelo backend (RN01).
  const emailLooksInstitutional = email === '' || email.toLowerCase().endsWith(INSTITUTIONAL_DOMAIN);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (!course) {
      setError('Selecione um curso.');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post('/auth/register', {
        name,
        email,
        password,
        course: course.id,
        period: Number(period),
      });
      router.push('/login?registered=1');
    } catch (err) {
      setError(extractErrorMessage(err, 'Não foi possível concluir o cadastro.'));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        p: 2,
      }}
    >
      <Paper elevation={0} variant="outlined" sx={{ p: 4, width: '100%', maxWidth: 480 }}>
        <Typography variant="h2" component="h1" gutterBottom>
          Criar conta
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Cadastro exclusivo para alunos do IFF ({INSTITUTIONAL_DOMAIN}).
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            fullWidth
            autoComplete="name"
          />
          <TextField
            label="E-mail institucional"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            fullWidth
            autoComplete="email"
            error={!emailLooksInstitutional}
            helperText={!emailLooksInstitutional ? `Use um e-mail ${INSTITUTIONAL_DOMAIN}` : ' '}
          />
          <TextField
            label="Senha"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            fullWidth
            autoComplete="new-password"
            helperText="Mínimo de 8 caracteres"
          />
          <Autocomplete
            options={courses}
            getOptionLabel={(option) => option.name}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            loading={isLoadingCourses}
            value={course}
            onChange={(_event, value) => setCourse(value)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Curso"
                required
                slotProps={{
                  ...params.slotProps,
                  input: {
                    ...params.slotProps.input,
                    endAdornment: (
                      <>
                        {isLoadingCourses ? <CircularProgress size={16} /> : null}
                        {params.slotProps.input.endAdornment}
                      </>
                    ),
                  },
                }}
              />
            )}
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
          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={18} color="inherit" /> : undefined}
          >
            Cadastrar
          </Button>
        </Box>

        <Typography variant="body1" sx={{ mt: 3 }}>
          Já tem conta?{' '}
          <Button href="/login" size="small">
            Entrar
          </Button>
        </Typography>
      </Paper>
    </Box>
  );
}
