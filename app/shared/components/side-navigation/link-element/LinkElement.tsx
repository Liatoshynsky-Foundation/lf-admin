'use client';

import { LinkElementProps } from 'app/types/sideNavigation';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { ListElement } from '../list-element/ListElement';
import { useStore } from '~/store';

export const LinkElement: React.FC<LinkElementProps> = ({ element, open, handleClick, sxItem = {}, children }) => {
  const pathname = usePathname();

  const dirtyPaths = useStore((state) => state.dirtyPaths);
  const setPendingNavigation = useStore((state) => state.setPendingNavigation);
  const setDiscardModalOpen = useStore((state) => state.setDiscardModalOpen);

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const href = element.href ?? '/';

    if (dirtyPaths[pathname]) {
      e.preventDefault();

      setPendingNavigation(href);
      setDiscardModalOpen(true);
    }
  };

  return (
    <Link href={element.href ?? '/'} key={element.href} onClick={handleLinkClick}>
      <ListElement element={element} open={open} handleClick={handleClick} sxItem={sxItem} />
      {children}
    </Link>
  );
};
