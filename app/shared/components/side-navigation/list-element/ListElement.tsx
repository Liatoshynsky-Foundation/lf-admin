import { ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { LinkElementProps } from 'app/types/sideNavigation';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

import { styles as SideNavigationStyles } from '../SideNavigation.styles';
import { styles } from './ListElement.styles';

export const ListElement: React.FC<LinkElementProps> = ({
  element,
  open,
  handleClick,
  sxItem = { padding: '4px 16px' },
  children
}) => {
  const { title, href, iconSrc } = element;
  const pathName = usePathname();
  return (
    <ListItemButton
      sx={[styles.listItem as any, sxItem as any]}
      selected={href === pathName}
      onClick={handleClick ?? (() => {})}
    >
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
