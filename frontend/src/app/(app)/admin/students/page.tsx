'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Chip,
  CircularProgress,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import BlockIcon from '@mui/icons-material/BlockOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircleOutlined';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { useCourses } from '@/hooks/useCourses';
import { useFeedback } from '@/hooks/useFeedback';
import { api, extractErrorMessage } from '@/lib/api';
import { StudentStatusFilter, type UserResponseDto } from '@/types/api';

const STATUS_LABELS: Record<StudentStatusFilter, string> = {
  [StudentStatusFilter.ACTIVE]: 'Ativos',
  [StudentStatusFilter.INACTIVE]: 'Inativos',
};

export default function AdminStudentsPage() {
  const { courses } = useCourses(true);
  const feedback = useFeedback();

  const [students, setStudents] = useState<UserResponseDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StudentStatusFilter | ''>('');
  const [courseFilter, setCourseFilter] = useState('');

  const [pendingStudent, setPendingStudent] = useState<UserResponseDto | null>(null);
  const [isToggling, setIsToggling] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);

  const courseNameById = useMemo(() => {
    const map = new Map<string, string>();
    courses.forEach((course) => map.set(course.id, course.name));
    return map;
  }, [courses]);

  useEffect(() => {
    let cancelled = false;

    async function loadStudents() {
      setIsLoading(true);
      try {
        const response = await api.get<UserResponseDto[]>('/users/students', {
          params: {
            status: statusFilter || undefined,
            course: courseFilter || undefined,
          },
        });
        if (!cancelled) setStudents(response.data);
      } catch (err) {
        if (!cancelled) feedback.notifyError(extractErrorMessage(err, 'Não foi possível carregar os alunos.'));
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void loadStudents();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, courseFilter, reloadToken]);

  async function handleToggleActive() {
    if (!pendingStudent) return;
    setIsToggling(true);
    try {
      const action = pendingStudent.isActive ? 'deactivate' : 'activate';
      await api.patch(`/users/students/${pendingStudent.id}/${action}`);
      feedback.notifySuccess(pendingStudent.isActive ? 'Aluno desativado.' : 'Aluno reativado.');
      setPendingStudent(null);
      setReloadToken((token) => token + 1);
    } catch (err) {
      feedback.notifyError(extractErrorMessage(err, 'Não foi possível concluir a ação.'));
    } finally {
      setIsToggling(false);
    }
  }

  return (
    <Box>
      <Typography variant="h3" component="h2" gutterBottom>
        Alunos
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
        {students.length} {students.length === 1 ? 'aluno cadastrado' : 'alunos cadastrados'}
      </Typography>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
        <TextField
          select
          label="Status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StudentStatusFilter | '')}
          sx={{ minWidth: 200 }}
        >
          <MenuItem value="">Todos</MenuItem>
          {Object.values(StudentStatusFilter).map((status) => (
            <MenuItem key={status} value={status}>
              {STATUS_LABELS[status]}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          label="Curso"
          value={courseFilter}
          onChange={(e) => setCourseFilter(e.target.value)}
          sx={{ minWidth: 240 }}
        >
          <MenuItem value="">Todos os cursos</MenuItem>
          {courses.map((course) => (
            <MenuItem key={course.id} value={course.id}>
              {course.name}
            </MenuItem>
          ))}
        </TextField>
      </Stack>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nome</TableCell>
                <TableCell>E-mail</TableCell>
                <TableCell>Curso</TableCell>
                <TableCell>Período</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {students.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ color: 'text.secondary' }}>
                    Nenhum aluno encontrado.
                  </TableCell>
                </TableRow>
              )}
              {students.map((student) => (
                <TableRow key={student.id} hover>
                  <TableCell>{student.name}</TableCell>
                  <TableCell>{student.email}</TableCell>
                  <TableCell>{student.course ? (courseNameById.get(student.course) ?? '—') : '—'}</TableCell>
                  <TableCell>{student.period ?? '—'}</TableCell>
                  <TableCell>
                    <Chip
                      label={student.isActive ? 'Ativo' : 'Inativo'}
                      color={student.isActive ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title={student.isActive ? 'Desativar' : 'Reativar'}>
                      <IconButton onClick={() => setPendingStudent(student)} size="small">
                        {student.isActive ? (
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
        open={pendingStudent !== null}
        title={pendingStudent?.isActive ? 'Desativar aluno' : 'Reativar aluno'}
        description={
          pendingStudent?.isActive
            ? `Tem certeza que deseja desativar "${pendingStudent?.name}"? O acesso dele ao sistema será revogado.`
            : `Tem certeza que deseja reativar "${pendingStudent?.name}"?`
        }
        confirmLabel={pendingStudent?.isActive ? 'Desativar' : 'Reativar'}
        confirmColor={pendingStudent?.isActive ? 'error' : 'primary'}
        isLoading={isToggling}
        onConfirm={handleToggleActive}
        onClose={() => setPendingStudent(null)}
      />
      {feedback.Snackbar}
    </Box>
  );
}
