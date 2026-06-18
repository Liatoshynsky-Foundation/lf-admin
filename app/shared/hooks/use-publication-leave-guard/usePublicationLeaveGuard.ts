'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

export function usePublicationLeaveGuard(hasUnsavedChanges: boolean) {
  const router = useRouter();
  const pathname = usePathname();

  const prevPath = useRef(pathname);
  const [pendingPath, setPendingPath] = useState<string | null>(null);

  useEffect(() => {
    if (pathname !== prevPath.current) {
      if (hasUnsavedChanges) {
        setPendingPath(pathname);
        router.push(prevPath.current);
      } else {
        prevPath.current = pathname;
      }
    }
  }, [pathname, router, hasUnsavedChanges]);

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

  return {
    pendingPath,
    confirmNavigation,
    cancelNavigation
  };
}
