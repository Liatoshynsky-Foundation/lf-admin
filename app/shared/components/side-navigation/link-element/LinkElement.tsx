'use client';

import { LinkElementProps } from 'app/types/sideNavigation';
import Link from 'next/link';

import { ListElement } from '../list-element/ListElement';
import { useNavigationGuard } from '~/shared/hooks/use-navigation-guard/useNavigationGuard';

export const LinkElement: React.FC<LinkElementProps> = ({ element, open, handleClick, sxItem = {}, children }) => {
  const { interceptLinkClick } = useNavigationGuard();

  const href = element.href ?? '/';

  return (
    <Link href={element.href ?? '/'} key={element.href} onClick={(e) => interceptLinkClick(e, href)}>
      <ListElement element={element} open={open} handleClick={handleClick} sxItem={sxItem} />
      {children}
    </Link>
  );
};
