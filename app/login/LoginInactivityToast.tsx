'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import toast from 'react-hot-toast';

export function LoginInactivityToast() {
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get('reason') === 'inactivity') {
      toast.error('Сесію завершено через бездіяльність. Будь ласка, увійдіть знову.');
    }
  }, [searchParams]);

  return null;
}
