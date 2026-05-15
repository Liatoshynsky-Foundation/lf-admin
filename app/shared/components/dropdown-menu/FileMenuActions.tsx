'use client';

import { Box, CircularProgress, MenuItem, Typography } from '@mui/material';
import { Info } from 'lucide-react';
import Image from 'next/image';
import React from 'react';

import { styles } from './FileMenuActions.styles';

export interface FileMenuActionsProps {
  isStarred?: boolean;
  onCloseMenu: () => void;
  isStarLoading?: boolean;
  onOpenDetails: () => void;
  onRename: () => void;
  onToggleStar: () => void;
  onDownload: () => void;
  onDelete: () => void;
}

export const FileMenuActions: React.FC<FileMenuActionsProps> = ({
  isStarred = false,
  isStarLoading = false,
  onCloseMenu,
  onOpenDetails,
  onRename,
  onToggleStar,
  onDownload,
  onDelete
}) => {
  const handleAction = (action: () => void, e: React.MouseEvent) => {
    e.stopPropagation();
    action();
    onCloseMenu();
  };

  const handleStarAction = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isStarLoading) return;
    onToggleStar();
  };

  const renderStarIcon = () => {
    if (isStarLoading) {
      return <CircularProgress size={20} color="inherit" />;
    }
    if (isStarred) {
      return <Image src="/icons/star-slash.svg" width={20} height={20} alt="Unstar" />;
    }
    return <Image src="/icons/small-star.svg" width={20} height={20} alt="Star" />;
  };

  return (
    <>
      <MenuItem onClick={(e) => handleAction(onOpenDetails, e)} sx={styles.menuItem}>
        <Box sx={styles.icon}>
          <Info size={24} strokeWidth={1.5} />
        </Box>
        <Typography sx={styles.menuText}>Відкрити деталі</Typography>
      </MenuItem>

      <MenuItem onClick={(e) => handleAction(onRename, e)} sx={styles.menuItem}>
        <Box sx={styles.icon}>
          <Image src="/icons/pen-line.svg" width={18} height={17} alt="Rename" />{' '}
        </Box>
        <Typography sx={styles.menuText}>Перейменувати</Typography>
      </MenuItem>

      <MenuItem
        onClick={handleStarAction}
        sx={{
          ...styles.menuItem,
          opacity: isStarLoading ? 0.6 : 1,
          cursor: isStarLoading ? 'wait' : 'pointer'
        }}
      >
        <Box sx={styles.icon}>{renderStarIcon()}</Box>
        <Typography sx={styles.menuText}>{isStarred ? 'Забрати з обраних' : 'Додати в обрані'}</Typography>
      </MenuItem>

      <MenuItem onClick={(e) => handleAction(onDownload, e)} sx={styles.menuItem}>
        <Box sx={styles.icon}>
          <Image src="/icons/download.svg" width={18} height={18} alt="Download" />{' '}
        </Box>
        <Typography sx={styles.menuText}>Завантажити</Typography>
      </MenuItem>

      <MenuItem onClick={(e) => handleAction(onDelete, e)} sx={styles.menuItem}>
        <Box sx={styles.icon}>
          <Image src="/icons/empty-trash.svg" width={18} height={20} alt="Delete" />{' '}
        </Box>
        <Typography sx={styles.menuText}>Видалити</Typography>
      </MenuItem>
    </>
  );
};
