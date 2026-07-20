'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// "/admin" sozinho não tem tela própria — a área do Admin começa em /admin/jobs.
export default function AdminIndexPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/jobs');
  }, [router]);

  return null;
}
