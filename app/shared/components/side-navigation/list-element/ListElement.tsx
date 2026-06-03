import { ListItemButton, ListItemIcon, ListItemText, type SxProps, type Theme } from '@mui/material';
import { LinkElementProps } from 'app/types/sideNavigation';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

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
  const disabled = element.disabled;
  const listItemSx: SxProps<Theme> = [
    styles.listItem,
    ...(Array.isArray(sxItem) ? sxItem : [sxItem]),
    disabled && {
      color: 'grey.500',
      opacity: 0.6,
      '&.Mui-disabled': {
        cursor: 'not-allowed',
        pointerEvents: 'auto'
      }
    }
  ];

  return (
    <ListItemButton sx={listItemSx} selected={isActivePath(href, pathName)} onClick={handleClick} disabled={disabled}>
      {iconSrc && (
        <ListItemIcon sx={styles.listItemIcon}>
          <Image src={`/icons/${iconSrc}.svg`} alt={title} width={24} height={24} />
        </ListItemIcon>
      )}
      {open && (
        <ListItemText
          slotProps={{
            primary: styles.listItemText
          }}
          primary={title}
        />
      )}
      {children}
    </ListItemButton>
  );
};
