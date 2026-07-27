'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef } from 'react';

import { logoutAction } from '~/shared/actions/auth';
import { useStore } from '~/store';
import { Wrapper } from '~/types/common';

const DEFAULT_TIMEOUT_MINUTES = 60;
const THROTTLE_MS = 1000;

const getTimeoutMs = () => {
  const minutes = Number(process.env.NEXT_PUBLIC_SESSION_INACTIVITY_TIMEOUT_MINUTES) || DEFAULT_TIMEOUT_MINUTES;
  return minutes * 60 * 1000;
};

const ACTIVITY_EVENTS = ['mousemove', 'mousedown', 'keydown', 'scroll', 'click', 'pointerdown'] as const;

export function SessionTimeoutProvider({ children }: Wrapper) {
  const router = useRouter();
  const logout = useStore((state) => state.logout);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastResetRef = useRef(0);

  const handleInactivity = useCallback(async () => {
    try {
      await logoutAction();
    } catch (error) {
      console.error('Failed to clear session on inactivity logout:', error);
    }

    logout();
    router.push('/login?reason=inactivity');
    router.refresh();
  }, [logout, router]);

  const resetTimer = useCallback(() => {
    const now = Date.now();
    if (now - lastResetRef.current < THROTTLE_MS) return;
    lastResetRef.current = now;

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(handleInactivity, getTimeoutMs());
  }, [handleInactivity]);

  useEffect(() => {
    resetTimer();

    ACTIVITY_EVENTS.forEach((event) => window.addEventListener(event, resetTimer));

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      ACTIVITY_EVENTS.forEach((event) => window.removeEventListener(event, resetTimer));
    };
  }, [resetTimer]);

  return <>{children}</>;
}
