'use client';
import { Menu, MenuItem,Typography } from '@mui/material';
import { MouseEvent,useState } from 'react';

import { styles } from './styles';
import DividedHeader from '~/shared/components/divided-header/DividedHeader';
import ProgressStatus from '~/shared/components/divided-header/progress-status/ProgressStatus';

export default function Page() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorEl);

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const testActions = [
    { id: 'SAVE_DRAFT', label: 'Зберегти зміни' },
    { id: 'SAVE_AND_EXIT', label: 'Зберегти зміни і вийти' },
    { id: 'DELETE_DRAFT', label: 'Видалити чернетку' }
  ];

  return (
    <>
      <DividedHeader mode="seo" onRightMenuOpen={handleClick}>
        <Typography variant="customBold20Tight">Створення новини</Typography>
        <ProgressStatus isSaved={true} />
      </DividedHeader>

      <Menu
        anchorEl={anchorEl}
        open={openMenu}
        sx={styles.menu}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        {testActions.map((item) => (
          <MenuItem key={item.id} onClick={handleClose}>
            {item.label}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
