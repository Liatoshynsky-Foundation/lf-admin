'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

export function useStayPage(shouldBlock: boolean, checkPaths: any[] = []) {
  const router = useRouter();
  const pathname = usePathname();
  const prevPath = useRef(pathname);
  const [pendingPath, setPendingPath] = useState<string | null>(null);

  useEffect(() => {
    if (pathname !== prevPath.current) {
      const temp = prevPath.current.split('/').filter(Boolean).pop() as string;
      const check = Object.keys(checkPaths).length > 0 ? checkPaths.hasOwnProperty(temp) : true;
      if (shouldBlock && check) {
        setPendingPath(pathname);
        router.push(prevPath.current);
      } else {
        prevPath.current = pathname;
      }
    }
  }, [pathname, checkPaths, shouldBlock, router]);

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
