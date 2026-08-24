'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// A experiência principal pós-login (Admin ou Student) é a listagem de vagas.
export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/vagas');
  }, [router]);

  return null;
}
