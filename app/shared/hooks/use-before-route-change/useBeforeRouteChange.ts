'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

export function useBeforeRouteChange(callback: (prev: string, next: string) => void) {
  const pathname = usePathname();
  const prevPath = useRef(pathname);

  useEffect(() => {
    if (prevPath.current !== pathname) {
      callback(prevPath.current, pathname);
      prevPath.current = pathname;
    }
  }, [pathname, callback]);
}
