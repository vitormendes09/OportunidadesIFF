'use client';

import { useEffect, useState } from 'react';

// Requisito técnico #2 da Etapa 06: debounce (~300-500ms) em filtros que disparam
// requisição automaticamente.
export function useDebouncedValue<T>(value: T, delayMs = 400): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}
