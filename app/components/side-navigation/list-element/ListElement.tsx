import { usePathname } from 'next/navigation';
import { LinkElementProps } from 'app/types/sideNavigation';
import { ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { styles } from './ListElement.styles';
import { styles as SideNavigationStyles } from '../SideNavigation.styles';
import Image from 'next/image';

export const ListElement: React.FC<LinkElementProps> = ({
  element,
  open,
  handleClick,
  sxItem = {},
  children,
}) => {
  const { title, href, iconSrc } = element;
  const pathName = usePathname();
  return (
    <ListItemButton
      sx={{ ...styles.listItem, ...sxItem }}
      selected={href === pathName}
      onClick={handleClick ?? (() => {})}
    >
      {iconSrc && (
        <ListItemIcon sx={styles.listItemIcon}>
          <Image
            src={`./icons/${iconSrc}.svg`}
            alt={title}
            width={24}
            height={24}
          />
        </ListItemIcon>
      )}
      <ListItemText
        sx={SideNavigationStyles.hideInClosed(open)}
        slotProps={{
          primary: styles.listItemText,
        }}
        primary={title}
        inset={!iconSrc}
      />
      {children}
    </ListItemButton>
  );
};
