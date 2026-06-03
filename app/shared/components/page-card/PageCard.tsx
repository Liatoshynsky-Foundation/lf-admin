import { Box, Card, CardContent, CardMedia, Typography } from '@mui/material';
import { EllipsisVertical } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import Button from '../design-system/button/Button';
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
  editHref?: string;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

const PageCard = ({ coverImage, title, updatedAt, editHref, onClick }: PageCardProps) => {
  const [imageSrc, setImageSrc] = useState(coverImage.src || FALLBACK_IMAGE_SRC);

  const titleText = title.uk || title.en || '';
  const altText = coverImage.alt.uk || coverImage.alt.en || titleText;

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  useEffect(() => {
    setImageSrc(coverImage.src || FALLBACK_IMAGE_SRC);
  }, [coverImage.src]);

  const handleImageError = () => {
    if (imageSrc !== FALLBACK_IMAGE_SRC) {
      setImageSrc(FALLBACK_IMAGE_SRC);
    }
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(anchorEl ? null : event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <Card sx={styles.card}>
      <Box sx={styles.imageContainer}>
        <CardMedia component="img" height="180" image={imageSrc} alt={altText} onError={handleImageError} />
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
          <Box data-testid="menu-button" sx={{ cursor: 'pointer' }} onClick={handleMenuClick}>
            <EllipsisVertical size={20} />
            {anchorEl && <PageCardMenu anchorEl={anchorEl} onClose={handleMenuClose} />}
          </Box>
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
