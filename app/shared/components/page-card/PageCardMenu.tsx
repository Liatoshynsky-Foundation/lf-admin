import { Menu, MenuItem } from '@mui/material';
import { useRouter } from 'next/navigation';

import styles from './PageCardMenu.styles';

interface PageCardMenuProps {
  anchorEl: HTMLElement | null;
  onClose: () => void;
}

const PageCardMenu = ({ anchorEl, onClose }: PageCardMenuProps) => {
  const router = useRouter();
  const open = Boolean(anchorEl);

  const href = '/main-page';

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      sx={styles.menu}
      disableAutoFocusItem
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right'
      }}
    >
      <MenuItem onClick={() => router.push(href)} sx={styles.menuItem}>
        Редагувати SEO
      </MenuItem>
    </Menu>
  );
};

export default PageCardMenu;
