import { Menu, MenuItem } from '@mui/material';
import { useRouter } from 'next/navigation';

import { ContentType } from './ContentCard';
import styles from './ContentCardMenu.styles';

interface ContentCardMenuProps {
  id: string;
  type: ContentType;
  anchorEl: HTMLElement | null;
  onClose: () => void;
  setDeleteModalOpen: (open: boolean) => void;
}

const ContentCardMenu = ({ id, type, anchorEl, onClose, setDeleteModalOpen }: ContentCardMenuProps) => {
  const router = useRouter();
  const open = Boolean(anchorEl);

  const href = `/publications/${type}/${id}/seo`;

  const handleDeleteClick = () => {
    setDeleteModalOpen(true);
  };

  return (
    <Menu anchorEl={anchorEl} open={open} onClose={onClose} sx={styles.menu}>
      <MenuItem onClick={() => router.push(href)} sx={styles.menuItem}>
        SEO налаштування
      </MenuItem>
      <MenuItem onClick={handleDeleteClick} sx={styles.menuItem}>
        Видалити
      </MenuItem>
    </Menu>
  );
};

export default ContentCardMenu;
