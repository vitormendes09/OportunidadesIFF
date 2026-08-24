'use client';

import { useState, type FormEvent } from 'react';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  FormControlLabel,
  MenuItem,
  Paper,
  Stack,
  Switch,
  TextField,
} from '@mui/material';
import { useCourses } from '@/hooks/useCourses';
import { extractErrorMessage } from '@/lib/api';
import {
  ContractType,
  WorkModel,
  type CourseResponseDto,
  type CreateJobRequestDto,
  type JobResponseDto,
} from '@/types/api';

const CONTRACT_TYPE_OPTIONS = Object.values(ContractType);
const WORK_MODEL_OPTIONS = Object.values(WorkModel);

interface JobFormProps {
  initialJob?: JobResponseDto;
  submitLabel: string;
  onSubmit: (payload: CreateJobRequestDto) => Promise<void>;
}

export function JobForm({ initialJob, submitLabel, onSubmit }: JobFormProps) {
  // includeInactive: true — se a vaga já referenciar um curso desde então
  // desativado, ele precisa continuar aparecendo como selecionado no formulário.
  const { courses, isLoading: isLoadingCourses } = useCourses(true);

  const [title, setTitle] = useState(initialJob?.title ?? '');
  const [companyName, setCompanyName] = useState(initialJob?.companyName ?? '');
  const [description, setDescription] = useState(initialJob?.description ?? '');
  const [contractType, setContractType] = useState<ContractType | ''>(initialJob?.contractType ?? '');
  const [workModel, setWorkModel] = useState<WorkModel | ''>(initialJob?.workModel ?? '');
  const [companyLocation, setCompanyLocation] = useState(initialJob?.companyLocation ?? '');
  const [workLocation, setWorkLocation] = useState(initialJob?.workLocation ?? '');
  const [hasBenefits, setHasBenefits] = useState(initialJob?.hasBenefits ?? false);
  const [benefitsDescription, setBenefitsDescription] = useState(initialJob?.benefitsDescription ?? '');
  const [salary, setSalary] = useState(initialJob?.salary ?? '');
  const [applicationUrl, setApplicationUrl] = useState(initialJob?.applicationUrl ?? '');
  const [selectedCourses, setSelectedCourses] = useState<CourseResponseDto[]>(
    () =>
      initialJob?.courses.map((c) => ({
        id: c.id,
        name: c.name ?? '(curso removido)',
        isActive: true,
        createdAt: '',
        updatedAt: '',
      })) ?? [],
  );
  const [requiredPeriod, setRequiredPeriod] = useState(
    initialJob?.requiredPeriod !== undefined ? String(initialJob.requiredPeriod) : '',
  );
  const [specialties, setSpecialties] = useState<string[]>(initialJob?.specialties ?? []);

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mesma regra condicional do backend (Etapa 05, requisito técnico #3): só
  // feedback imediato, a validação de verdade continua no servidor.
  const benefitsDescriptionMissing = hasBenefits && benefitsDescription.trim() === '';

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (!contractType || !workModel) {
      setError('Selecione o tipo de contrato e o modelo de trabalho.');
      return;
    }
    if (selectedCourses.length === 0) {
      setError('Selecione ao menos um curso.');
      return;
    }
    if (benefitsDescriptionMissing) {
      setError('Descreva os benefícios ou desligue a opção "Possui benefícios".');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        title,
        companyName,
        description,
        contractType,
        workModel,
        companyLocation,
        workLocation,
        hasBenefits,
        benefitsDescription: hasBenefits ? benefitsDescription : undefined,
        salary: salary || undefined,
        applicationUrl,
        courses: selectedCourses.map((c) => c.id),
        requiredPeriod: requiredPeriod ? Number(requiredPeriod) : undefined,
        specialties,
      });
    } catch (err) {
      setError(extractErrorMessage(err, 'Não foi possível salvar a vaga.'));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Paper variant="outlined" sx={{ p: 3, maxWidth: 720 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Stack spacing={2}>
          <TextField label="Título" value={title} onChange={(e) => setTitle(e.target.value)} required fullWidth />
          <TextField
            label="Empresa"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            required
            fullWidth
          />
          <TextField
            label="Descrição"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            fullWidth
            multiline
            minRows={4}
          />

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              select
              label="Tipo de contrato"
              value={contractType}
              onChange={(e) => setContractType(e.target.value as ContractType)}
              required
              fullWidth
            >
              {CONTRACT_TYPE_OPTIONS.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Modelo de trabalho"
              value={workModel}
              onChange={(e) => setWorkModel(e.target.value as WorkModel)}
              required
              fullWidth
            >
              {WORK_MODEL_OPTIONS.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
          </Stack>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label="Local da empresa"
              value={companyLocation}
              onChange={(e) => setCompanyLocation(e.target.value)}
              required
              fullWidth
            />
            <TextField
              label="Local de trabalho"
              value={workLocation}
              onChange={(e) => setWorkLocation(e.target.value)}
              required
              fullWidth
            />
          </Stack>

          <FormControlLabel
            control={<Switch checked={hasBenefits} onChange={(e) => setHasBenefits(e.target.checked)} />}
            label="Possui benefícios"
          />
          {hasBenefits && (
            <TextField
              label="Descrição dos benefícios"
              value={benefitsDescription}
              onChange={(e) => setBenefitsDescription(e.target.value)}
              required
              fullWidth
              multiline
              minRows={2}
              error={benefitsDescriptionMissing}
              helperText={benefitsDescriptionMissing ? 'Obrigatório quando "Possui benefícios" está ligado.' : ' '}
            />
          )}

          <TextField
            label="Salário (opcional)"
            value={salary}
            onChange={(e) => setSalary(e.target.value)}
            fullWidth
            helperText="Deixe em branco para exibir “A combinar”."
          />

          <TextField
            label="URL do processo seletivo"
            type="url"
            value={applicationUrl}
            onChange={(e) => setApplicationUrl(e.target.value)}
            required
            fullWidth
          />

          <Autocomplete
            multiple
            options={courses}
            value={selectedCourses}
            loading={isLoadingCourses}
            getOptionLabel={(option) => (option.isActive ? option.name : `${option.name} (inativo)`)}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            onChange={(_event, value) => setSelectedCourses(value)}
            renderInput={(params) => <TextField {...params} label="Cursos" required={selectedCourses.length === 0} />}
          />

          <TextField
            label="Período exigido (opcional)"
            type="number"
            value={requiredPeriod}
            onChange={(e) => setRequiredPeriod(e.target.value)}
            fullWidth
            slotProps={{ htmlInput: { min: 1 } }}
            helperText="Deixe em branco para aceitar alunos de qualquer período."
          />

          <Autocomplete
            multiple
            freeSolo
            options={[]}
            value={specialties}
            onChange={(_event, value) => setSpecialties(value as string[])}
            renderInput={(params) => (
              <TextField {...params} label="Especialidades" helperText="Digite e pressione Enter para adicionar uma tag." />
            )}
          />

          <Box>
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={isSubmitting}
              startIcon={isSubmitting ? <CircularProgress size={18} color="inherit" /> : undefined}
            >
              {submitLabel}
            </Button>
          </Box>
        </Stack>
      </Box>
    </Paper>
  );
}
