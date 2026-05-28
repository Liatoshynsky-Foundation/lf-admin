import { ListItemButton, ListItemIcon, ListItemText, type SxProps, type Theme } from '@mui/material';
import { LinkElementProps } from 'app/types/sideNavigation';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

import { styles as SideNavigationStyles } from '../SideNavigation.styles';
import { styles } from './ListElement.styles';

const isActivePath = (href: string | undefined, pathName: string | null) => {
  if (!href || !pathName) {
    return false;
  }

  if (href === '/') {
    return pathName === href;
  }

  return pathName === href || pathName.startsWith(`${href}/`);
};

export const ListElement: React.FC<LinkElementProps> = ({
  element,
  open,
  handleClick,
  sxItem = { padding: '4px 16px' },
  children
}) => {
  const { title, href, iconSrc } = element;
  const pathName = usePathname();
  const listItemSx: SxProps<Theme> = Array.isArray(sxItem) ? [styles.listItem, ...sxItem] : [styles.listItem, sxItem];

  return (
    <ListItemButton sx={listItemSx} selected={isActivePath(href, pathName)} onClick={handleClick}>
      {iconSrc && (
        <ListItemIcon sx={styles.listItemIcon}>
          <Image src={`/icons/${iconSrc}.svg`} alt={title} width={24} height={24} />
        </ListItemIcon>
      )}
      <ListItemText
        sx={SideNavigationStyles.hideInClosed(open)}
        slotProps={{
          primary: styles.listItemText
        }}
        primary={title}
        inset={!iconSrc}
      />
      {children}
    </ListItemButton>
  );
};
