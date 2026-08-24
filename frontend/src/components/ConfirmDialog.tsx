'use client';

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  confirmColor?: 'primary' | 'error';
  isLoading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

// Toda ação destrutiva/de revogação de acesso (Etapa 05, requisito técnico #2) usa
// este Dialog em vez de window.confirm nativo, para manter consistência visual MUI.
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirmar',
  confirmColor = 'error',
  isLoading = false,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{description}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isLoading}>
          Cancelar
        </Button>
        <Button onClick={onConfirm} color={confirmColor} variant="contained" disabled={isLoading}>
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
