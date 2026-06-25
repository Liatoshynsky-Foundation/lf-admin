'use client';

import { usePathname, useRouter } from 'next/navigation';

import { BACK_NAVIGATION } from '~/constants/navigation';
import { useStore } from '~/store';

export const useNavigationGuard = () => {
  const pathname = usePathname();
  const router = useRouter();

  const dirtyPaths = useStore((state) => state.dirtyPaths);
  const setPendingNavigation = useStore((state) => state.setPendingNavigation);
  const setDiscardModalOpen = useStore((state) => state.setDiscardModalOpen);

  const navigate = (href: string) => {
    if (dirtyPaths[pathname]) {
      setPendingNavigation(href);
      setDiscardModalOpen(true);
      return;
    }

    router.push(href);
  };

  const interceptLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (dirtyPaths[pathname]) {
      e.preventDefault();

      setPendingNavigation(href);
      setDiscardModalOpen(true);
    }
  };

  const navigateBack = () => {
    if (dirtyPaths[pathname]) {
      setPendingNavigation(BACK_NAVIGATION);
      setDiscardModalOpen(true);
      return;
    }

    router.back();
  };

  return {
    navigate,
    navigateBack,
    interceptLinkClick
  };
};
