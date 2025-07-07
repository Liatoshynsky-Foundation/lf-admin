import Link from 'next/link';
import { ListElement } from '../list-element/ListElement';
import { LinkElementProps } from 'app/types/sideNavigation';

export const LinkElement: React.FC<LinkElementProps> = ({
  element,
  open,
  handleClick,
  sxItem = {},
  children,
}) => {
  return (
    <Link href={element.href ?? '/'} key={element.href}>
      <ListElement
        element={element}
        open={open}
        handleClick={handleClick}
        children={children}
        sxItem={sxItem}
      />
    </Link>
  );
};
