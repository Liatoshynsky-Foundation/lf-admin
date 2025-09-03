'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { useHasUnsavedChanges } from '../use-has-unsaved-changes/useHasUnsavedChanges';

export function useStayPage() {
  const router = useRouter();
  const pathname = usePathname();
  const prevPath = useRef(pathname);
  const [pendingPath, setPendingPath] = useState<string | null>(null);
  const shouldBlock = useHasUnsavedChanges(prevPath.current);
  useEffect(() => {
    if (pathname !== prevPath.current) {
      if (shouldBlock) {
        setPendingPath(pathname);
        router.push(prevPath.current);
      } else {
        prevPath.current = pathname;
      }
    }
  }, [pathname, shouldBlock, router]);

  const confirmNavigation = () => {
    if (pendingPath) {
      prevPath.current = pendingPath;
      router.push(pendingPath);
      setPendingPath(null);
    }
  };

  const cancelNavigation = () => {
    setPendingPath(null);
  };

  return { pendingPath, confirmNavigation, cancelNavigation };
}
