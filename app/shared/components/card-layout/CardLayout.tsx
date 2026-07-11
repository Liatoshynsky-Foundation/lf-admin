'use client';
import { Box, Card, CardContent, IconButton } from '@mui/material';
import { EllipsisVertical } from 'lucide-react';
import { useState } from 'react';

import ActionMenu, { ActionMenuGroups } from '../dropdown-menu/ActionMenu';
import styles from './CardLayout.styles';

interface CardLayoutProps {
  coverImage: React.ReactNode;
  title: React.ReactNode;
  info: React.ReactNode;
  items: ActionMenuGroups;
  contentUpper?: React.ReactNode;
  contentBottom?: React.ReactNode;
  spaceBetweenContent?: number;
  interactive?: boolean;
  isSelected?: boolean;
}

const CardLayout = ({
  coverImage,
  title,
  info,
  items,
  contentBottom,
  contentUpper,
  interactive = false,
  isSelected = false,
  spaceBetweenContent = 200
}: CardLayoutProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuDirection, setMenuDirection] = useState<'left' | 'right'>('right');

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(anchorEl ? null : event.currentTarget);

    const rect = event.currentTarget.getBoundingClientRect();
    const spaceOnRight = window.innerWidth - rect.right;

    if (spaceOnRight > spaceBetweenContent) {
      setMenuDirection('left');
    } else {
      setMenuDirection('right');
    }
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <Card sx={styles.card(interactive, isSelected)}>
      <Box sx={styles.imageContainer}>{coverImage}</Box>

      <CardContent sx={styles.cardContent}>
        {contentUpper}

        <Box sx={styles.fullInfo}>
          <Box sx={styles.mainInfo}>
            <Box sx={styles.titleContainer}>{title}</Box>
            <Box>
              <IconButton data-testid="menu-button" onClick={handleMenuClick}>
                <EllipsisVertical size={20} />
              </IconButton>
              <ActionMenu
                anchorEl={anchorEl}
                onClose={handleMenuClose}
                menuItems={items}
                menuDirection={menuDirection}
              />
            </Box>
          </Box>
          {info}
        </Box>

        {contentBottom}
      </CardContent>
    </Card>
  );
};

export default CardLayout;
