'use client';
import { Box, Card, CardContent, IconButton, Typography } from '@mui/material';
import { EllipsisVertical } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

import Button from '../design-system/button/Button';
import TooltipCustom from '../design-system/tooltip/Tooltip';
import styles from './BaseCard.styles';
import ImageWithFallback from './ImageWithFallback';

const FALLBACK_IMAGE_SRC = '/images/image.png';

interface BaseCardActionButton {
  text: string;
  href?: string;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

interface BaseCardProps {
  coverImage: { src: string; alt: string };
  title: { text: string; icon?: React.ReactNode };
  infoText?: string;
  actionButton?: BaseCardActionButton;
  contentUpperSection?: React.ReactNode;
  contentBottomSection?: React.ReactNode;
  spaceBetweenContent?: number;
  renderMenu: (
    anchorEl: HTMLElement | null,
    handleClose: () => void,
    oppositeDirection: 'left' | 'right'
  ) => React.ReactNode;
}

const BaseCard = ({
  coverImage,
  title,
  infoText,
  actionButton,
  contentUpperSection,
  contentBottomSection,
  renderMenu,
  spaceBetweenContent = 200
}: BaseCardProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isTitleTruncated, setIsTitleTruncated] = useState(false);
  const [menuDirection, setMenuDirection] = useState<'left' | 'right'>('right');

  const titleRef = useRef<HTMLHeadingElement | null>(null);

  useEffect(() => {
    const element = titleRef.current;
    if (!element) return;
    setIsTitleTruncated(element.scrollHeight > element.clientHeight);
  }, [title]);

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
    <Card sx={styles.card}>
      <Box sx={styles.imageContainer}>
        <ImageWithFallback
          key={coverImage.src}
          src={coverImage.src}
          fallbackSrc={FALLBACK_IMAGE_SRC}
          alt={coverImage.alt}
        />
      </Box>

      <CardContent sx={styles.cardContent}>
        {contentUpperSection}

        <Box sx={styles.mainInfo}>
          <TooltipCustom title={isTitleTruncated ? title.text : ''}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, width: '100%' }}>
              {title.icon}
              <Typography ref={titleRef} variant="subtitle1" component="h3" sx={title.icon ? {} : styles.title}>
                {title.text}
              </Typography>
            </Box>
          </TooltipCustom>

          <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
            <IconButton data-testid="menu-button" onClick={handleMenuClick}>
              <EllipsisVertical size={20} />
            </IconButton>

            {renderMenu(anchorEl, handleMenuClose, oppositeDirection)}
          </Box>
        </Box>
        {infoText && (
          <Typography variant="caption" sx={styles.date}>
            {infoText}
          </Typography>
        )}
        {actionButton && (
          <Button
            variant="filled"
            color="primary"
            href={actionButton.href}
            LinkComponent={actionButton.href ? Link : undefined}
            onClick={actionButton.href ? undefined : actionButton.onClick}
          >
            {actionButton.text}
          </Button>
        )}

        {contentBottomSection}
      </CardContent>
    </Card>
  );
};

export default BaseCard;
