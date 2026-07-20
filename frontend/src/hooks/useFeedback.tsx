'use client';

import { Alert, Snackbar } from '@mui/material';
import { useCallback, useState } from 'react';

interface FeedbackState {
  open: boolean;
  message: string;
  severity: 'success' | 'error';
}

const INITIAL_STATE: FeedbackState = { open: false, message: '', severity: 'success' };

// Snackbar de sucesso/erro reaproveitado pelas 3 telas de gestão (Vagas, Cursos,
// Alunos) — cada uma só chama notifySuccess/notifyError e renderiza <feedback.Snackbar />.
export function useFeedback() {
  const [state, setState] = useState<FeedbackState>(INITIAL_STATE);

  const notifySuccess = useCallback((message: string) => setState({ open: true, message, severity: 'success' }), []);
  const notifyError = useCallback((message: string) => setState({ open: true, message, severity: 'error' }), []);
  const close = useCallback(() => setState((prev) => ({ ...prev, open: false })), []);

  const Snackbar_ = (
    <Snackbar open={state.open} autoHideDuration={4000} onClose={close}>
      <Alert onClose={close} severity={state.severity} variant="filled" sx={{ width: '100%' }}>
        {state.message}
      </Alert>
    </Snackbar>
  );

  return { notifySuccess, notifyError, Snackbar: Snackbar_ };
}
