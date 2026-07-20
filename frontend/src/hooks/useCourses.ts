'use client';

import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { CourseResponseDto } from '@/types/api';

// Compartilhado entre o formulário de vaga (Etapa 05), o filtro de alunos (Etapa 05)
// e o cadastro de Student (Etapa 04) — evita repetir o mesmo fetch em cada tela.
export function useCourses(includeInactive = false) {
  const [courses, setCourses] = useState<CourseResponseDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Incrementado por `reload()` para forçar o efeito a rodar de novo, sem
  // depender da identidade de uma função memoizada dentro do próprio efeito.
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function fetchCourses() {
      setIsLoading(true);
      setError(null);
      try {
        const response = await api.get<CourseResponseDto[]>('/courses', {
          params: includeInactive ? { includeInactive: true } : undefined,
        });
        if (!cancelled) setCourses(response.data);
      } catch {
        if (!cancelled) setError('Não foi possível carregar a lista de cursos.');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void fetchCourses();
    return () => {
      cancelled = true;
    };
  }, [includeInactive, reloadToken]);

  const reload = useCallback(() => setReloadToken((token) => token + 1), []);

  return { courses, isLoading, error, reload };
}
