import { Box, Card, CardContent, IconButton, Typography } from '@mui/material';
import { EllipsisVertical } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import Button from '../design-system/button/Button';
import ImageWithFallback from './ImageWithFallback';
import styles from './PageCard.styles';
import PageCardMenu from './PageCardMenu';
import { formatDate } from '~/lib/utils/formatDate';
import type { LocalizedString } from '~/types/common';

const FALLBACK_IMAGE_SRC = '/images/image.png';

interface PageCardImage {
  src: string;
  alt: {
    uk: string;
    en: string;
  };
}

interface PageCardProps {
  coverImage: PageCardImage;
  title: Partial<LocalizedString>;
  updatedAt?: string;
  editHref: string;
  editSeoHref: string;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

const PageCard = ({ coverImage, title, updatedAt, editHref, editSeoHref, onClick }: PageCardProps) => {
  const titleText = title.uk || title.en || '';
  const altText = coverImage.alt.uk || coverImage.alt.en || titleText;

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(anchorEl ? null : event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <Card sx={styles.card}>
      <Box sx={styles.imageContainer}>
        <ImageWithFallback key={coverImage.src} src={coverImage.src} fallbackSrc={FALLBACK_IMAGE_SRC} alt={altText} />
      </Box>

      <CardContent sx={styles.cardContent}>
        <Box sx={styles.mainInfo}>
          <Box sx={styles.titleContainer}>
            <Typography variant="subtitle1" component="h3" sx={styles.title}>
              {titleText}
            </Typography>
            <Typography variant="caption" sx={styles.date}>
              Змінено {updatedAt ? formatDate(updatedAt) : ''}
            </Typography>
          </Box>

          <IconButton data-testid="menu-button" onClick={handleMenuClick}>
            <EllipsisVertical size={20} />
            <PageCardMenu anchorEl={anchorEl} onClose={handleMenuClose} editSeoHref={editSeoHref} />
          </IconButton>
        </Box>

        <Button
          variant="filled"
          color="primary"
          href={editHref}
          LinkComponent={editHref ? Link : undefined}
          onClick={editHref ? undefined : onClick}
        >
          Редагувати
        </Button>
      </CardContent>
    </Card>
  );
};
export default PageCard;
