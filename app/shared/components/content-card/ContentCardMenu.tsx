import { Menu, MenuItem, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';

import { ContentType } from './ContentCard';
import styles from './ContentCardMenu.styles';

interface ContentCardMenuProps {
  type: ContentType;
  anchorEl: HTMLElement | null;
  onClose: () => void;
  editHref?: string;
  slug: string;
  setDeleteModalOpen: (open: boolean) => void;
}

const ContentCardMenu = ({
  type,
  anchorEl,
  onClose,
  editHref,
  slug,
  setDeleteModalOpen
}: ContentCardMenuProps & { editHref?: string; slug: string }) => {
  const router = useRouter();
  const open = Boolean(anchorEl);

  function handleClick(locale: string) {
    if (editHref) {
      router.push(`${editHref}/${locale}`);
    } else {
      onClose();
    }
  }

  const href = `/publications/${type}/${slug}/seo`;

  const handleDeleteClick = () => {
    setDeleteModalOpen(true);
  };

  return (
    <>
      <Menu anchorEl={anchorEl} open={open} onClose={onClose} sx={styles.menu}>
        <Typography sx={styles.menuText}>Мовні версії</Typography>
        <MenuItem onClick={() => handleClick('en')} sx={styles.menuItem}>
          Англійська
        </MenuItem>
        <MenuItem onClick={() => handleClick('ua')} sx={styles.menuItem}>
          Українська
        </MenuItem>
        <MenuItem onClick={() => router.push(href)} sx={styles.menuItem}>
          SEO налаштування
        </MenuItem>
        <MenuItem onClick={handleDeleteClick} sx={styles.menuItem}>
          Видалити
        </MenuItem>
      </Menu>
    </>
  );
};

export default ContentCardMenu;
