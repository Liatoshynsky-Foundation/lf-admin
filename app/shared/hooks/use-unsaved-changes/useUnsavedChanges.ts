import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

import { useStore } from '~/store';

export const useUnsavedChanges = (hasUnsavedChanges: boolean) => {
  const pathname = usePathname();
  const setDirtyPath = useStore((state) => state.setDirtyPath);

  useEffect(() => {
    setDirtyPath(pathname, hasUnsavedChanges);
  }, [pathname, hasUnsavedChanges, setDirtyPath]);

  useEffect(() => {
    return () => {
      setDirtyPath(pathname, false);
    };
  }, [pathname, setDirtyPath]);
};
