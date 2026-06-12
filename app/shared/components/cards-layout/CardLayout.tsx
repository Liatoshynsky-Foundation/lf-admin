'use client';
import { Box, Card, CardContent, IconButton } from '@mui/material';
import { EllipsisVertical } from 'lucide-react';
import { useEffect, useState } from 'react';

import styles from './CardLayout.styles';
import CardMenu from './CardMenu';

interface MenuItem {
  text: { name: string; icon?: React.ReactNode };
  href?: string;
  onClick?: () => void;
}

interface CardLayoutProps {
  coverImage: React.ReactNode;
  title: React.ReactNode;
  info: React.ReactNode;
  items: MenuItem[];
  contentUpper?: React.ReactNode;
  contentBottom?: React.ReactNode;
  spaceBetweenContent?: number;
  interactive?: boolean;
}

const CardLayout = ({
  coverImage,
  title,
  info,
  items,
  contentBottom,
  contentUpper,
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
              <CardMenu
                key="base-card-menu"
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
