import { Menu, MenuItem } from '@mui/material';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

import { ContentType } from './ContentCard';
import styles from './ContentCardMenu.styles';

interface ContentCardMenuProps {
  id: string;
  type: ContentType;
  anchorEl: HTMLElement | null;
  onClose: () => void;
  editHref?: string;
  setDeleteModalOpen: (open: boolean) => void;
}

const ContentCardMenu = ({
  id,
  type,
  anchorEl,
  onClose,
  editHref,
  setDeleteModalOpen
}: ContentCardMenuProps & { editHref?: string; slug: string }) => {
  const router = useRouter();
  const open = Boolean(anchorEl);

  function handleClick() {
    if (editHref) {
      router.push(editHref);
    } else {
      onClose();
      toast.error('Invalid url');
    }
  }

  const href = `/publications/${type}/${id}/seo`;

  const handleDeleteClick = () => {
    setDeleteModalOpen(true);
  };

  return (
    <Menu anchorEl={anchorEl} open={open} onClose={onClose} sx={styles.menu}>
      <MenuItem onClick={() => handleClick()} sx={styles.menuItem}>
        Чернетка
      </MenuItem>
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
