import { Box, Card, CardContent, IconButton, Typography } from '@mui/material';
import { EllipsisVertical } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

import Button from '../design-system/button/Button';
import styles from './BaseCard.styles';
import ImageWithFallback from './ImageWithFallback';
import TooltipCustom from '~/ds-components/tooltip/Tooltip';

const FALLBACK_IMAGE_SRC = '/images/image.png';

interface BaseCardImage {
  src: string;
  alt: {
    uk: string;
    en: string;
  };
}

interface BaseCardActionButton {
  text: string;
  href?: string;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

interface BaseCardProps {
  coverImage: BaseCardImage;
  altText: string;
  titleText: string;
  infoText?: string;
  actionButton?: BaseCardActionButton;
  badge?: React.ReactNode;
  modalElement?: React.ReactNode;
  renderMenu: (anchorEl: HTMLElement | null, handleClose: () => void) => React.ReactNode;
}

const BaseCard = ({
  coverImage,
  altText,
  titleText,
  infoText,
  actionButton,
  badge,
  modalElement,
  renderMenu
}: BaseCardProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const [isTitleTruncated, setIsTitleTruncated] = useState(false);

  useEffect(() => {
    const element = titleRef.current;
    if (!element) return;
    setIsTitleTruncated(element.scrollHeight > element.clientHeight);
  }, [titleText]);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(anchorEl ? null : event.currentTarget);
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
    <Card sx={styles.card}>
      <Box sx={styles.imageContainer}>
        <ImageWithFallback key={coverImage.src} src={coverImage.src} fallbackSrc={FALLBACK_IMAGE_SRC} alt={altText} />
      </Box>

      <CardContent sx={styles.cardContent}>
        {badge}

        <Box sx={styles.mainInfo}>
          <Box sx={styles.titleContainer}>
            <TooltipCustom title={isTitleTruncated ? titleText : ''}>
              <Typography ref={titleRef} variant="subtitle1" component="h3" sx={styles.title}>
                {titleText}
              </Typography>
            </TooltipCustom>
            <Typography variant="caption" sx={styles.date}>
              {infoText}
            </Typography>
          </Box>

          <IconButton data-testid="menu-button" onClick={handleMenuClick}>
            <EllipsisVertical size={20} />
            {renderMenu(anchorEl, handleMenuClose)}
          </IconButton>
        </Box>

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
      </CardContent>

      {modalElement}
    </Card>
  );
};

export default BaseCard;
