'use client';

import { useState, type FormEvent } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
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
import EditIcon from '@mui/icons-material/EditOutlined';
import BlockIcon from '@mui/icons-material/BlockOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircleOutlined';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { useCourses } from '@/hooks/useCourses';
import { useFeedback } from '@/hooks/useFeedback';
import { api, extractErrorMessage } from '@/lib/api';
import type { CourseResponseDto } from '@/types/api';

export default function AdminCoursesPage() {
  const { courses, isLoading, reload } = useCourses(true);
  const feedback = useFeedback();

  const [editingCourse, setEditingCourse] = useState<CourseResponseDto | 'new' | null>(null);
  const [name, setName] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [pendingCourse, setPendingCourse] = useState<CourseResponseDto | null>(null);
  const [isToggling, setIsToggling] = useState(false);

  function openCreateDialog() {
    setName('');
    setFormError(null);
    setEditingCourse('new');
  }

  function openEditDialog(course: CourseResponseDto) {
    setName(course.name);
    setFormError(null);
    setEditingCourse(course);
  }

  async function handleFormSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);
    setIsSubmitting(true);
    try {
      if (editingCourse === 'new') {
        await api.post('/courses', { name });
        feedback.notifySuccess('Curso criado.');
      } else if (editingCourse) {
        await api.patch(`/courses/${editingCourse.id}`, { name });
        feedback.notifySuccess('Curso atualizado.');
      }
      setEditingCourse(null);
      await reload();
    } catch (err) {
      setFormError(extractErrorMessage(err, 'Não foi possível salvar o curso.'));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleToggleActive() {
    if (!pendingCourse) return;
    setIsToggling(true);
    try {
      if (pendingCourse.isActive) {
        await api.delete(`/courses/${pendingCourse.id}`);
        feedback.notifySuccess('Curso desativado.');
      } else {
        await api.patch(`/courses/${pendingCourse.id}`, { isActive: true });
        feedback.notifySuccess('Curso reativado.');
      }
      setPendingCourse(null);
      await reload();
    } catch (err) {
      feedback.notifyError(extractErrorMessage(err, 'Não foi possível concluir a ação.'));
    } finally {
      setIsToggling(false);
    }
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h3" component="h2">
          Cursos
        </Typography>
        <Button variant="contained" onClick={openCreateDialog}>
          Novo curso
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
                <TableCell>Nome</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {courses.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} align="center" sx={{ color: 'text.secondary' }}>
                    Nenhum curso cadastrado ainda.
                  </TableCell>
                </TableRow>
              )}
              {courses.map((course) => (
                <TableRow key={course.id} hover>
                  <TableCell>{course.name}</TableCell>
                  <TableCell>
                    <Chip
                      label={course.isActive ? 'Ativo' : 'Inativo'}
                      color={course.isActive ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Editar">
                      <IconButton onClick={() => openEditDialog(course)} size="small">
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={course.isActive ? 'Desativar' : 'Reativar'}>
                      <IconButton onClick={() => setPendingCourse(course)} size="small">
                        {course.isActive ? (
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

      <Dialog open={editingCourse !== null} onClose={() => setEditingCourse(null)} fullWidth maxWidth="xs">
        <DialogTitle>{editingCourse === 'new' ? 'Novo curso' : 'Editar curso'}</DialogTitle>
        <Box component="form" onSubmit={handleFormSubmit}>
          <DialogContent>
            {formError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {formError}
              </Alert>
            )}
            <TextField
              autoFocus
              label="Nome do curso"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              fullWidth
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditingCourse(null)} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting}
              startIcon={isSubmitting ? <CircularProgress size={18} color="inherit" /> : undefined}
            >
              Salvar
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      <ConfirmDialog
        open={pendingCourse !== null}
        title={pendingCourse?.isActive ? 'Desativar curso' : 'Reativar curso'}
        description={
          pendingCourse?.isActive
            ? `Tem certeza que deseja desativar "${pendingCourse?.name}"? Ele deixará de poder ser vinculado a novas vagas ou cadastros.`
            : `Tem certeza que deseja reativar "${pendingCourse?.name}"?`
        }
        confirmLabel={pendingCourse?.isActive ? 'Desativar' : 'Reativar'}
        confirmColor={pendingCourse?.isActive ? 'error' : 'primary'}
        isLoading={isToggling}
        onConfirm={handleToggleActive}
        onClose={() => setPendingCourse(null)}
      />
      {feedback.Snackbar}
    </Box>
  );
}
