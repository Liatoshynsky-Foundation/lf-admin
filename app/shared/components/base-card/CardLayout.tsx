'use client';
import { Box, Card, CardContent, IconButton } from '@mui/material';
import { EllipsisVertical } from 'lucide-react';
import { useEffect, useState } from 'react';

import styles from './CardLayout.styles';

interface CardLayoutProps {
  coverImage: React.ReactNode;
  title: React.ReactNode;
  info: React.ReactNode;
  contentUpper?: React.ReactNode;
  contentBottom?: React.ReactNode;
  spaceBetweenContent?: number;
  interactive?: boolean;
  renderMenu: (
    anchorEl: HTMLElement | null,
    handleClose: () => void,
    oppositeDirection: 'left' | 'right'
  ) => React.ReactNode;
}

const CardLayout = ({
  coverImage,
  title,
  info,
  contentBottom,
  contentUpper,
  renderMenu,
  interactive = false,
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

  useEffect(() => {
    if (!anchorEl) return;

    const handleScroll = () => {
      setAnchorEl(null);
    };
    window.addEventListener('scroll', handleScroll, true);

    return () => {
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [anchorEl]);

  const oppositeDirection = menuDirection === 'left' ? 'right' : 'left';

  return (
    <Card sx={styles.card(interactive)}>
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
              {renderMenu(anchorEl, handleMenuClose, oppositeDirection)}
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
