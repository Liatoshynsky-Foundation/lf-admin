import { Box, Card, CardContent, CardMedia, Typography } from '@mui/material';
import { EllipsisVertical } from 'lucide-react';
import { useEffect, useState } from 'react';

import Button from '../design-system/button/Button';
import styles from './ContentCard.styles';
import ContentCardBadge from './ContentCardBadge';
import { getStatus } from '~/lib/utils/getStatus';

export type ContentType = 'news' | 'event' | 'media';

const FALLBACK_IMAGE_SRC = '/images/image.png';

type LocalizedCardValue = {
  uk?: string;
  en?: string;
};

interface ContentCardProps {
  type: ContentType;
  coverImage: {
    src: string;
    alt: LocalizedCardValue;
  };
  title: LocalizedCardValue;
  status: string;
  updatedAt?: string;
  createdAt: string;
  publishedAt?: string;
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onClickMenu: (event: React.MouseEvent<HTMLImageElement>) => void;
}

const ContentCard = ({
  type,
  coverImage,
  title,
  status,
  updatedAt,
  createdAt,
  publishedAt,
  onClick,
  onClickMenu
}: ContentCardProps) => {
  const [imageSrc, setImageSrc] = useState(coverImage.src || FALLBACK_IMAGE_SRC);
  const localizedKeys = Object.entries(title)
    .filter(([, value]) => Boolean(value?.trim()))
    .map(([key]) => key);
  const titleText = title.uk || title.en || '';
  const altText = coverImage.alt.uk || coverImage.alt.en || titleText;

  useEffect(() => {
    setImageSrc(coverImage.src || FALLBACK_IMAGE_SRC);
  }, [coverImage.src]);

  const handleImageError = () => {
    if (imageSrc !== FALLBACK_IMAGE_SRC) {
      setImageSrc(FALLBACK_IMAGE_SRC);
    }
  };

  return (
    <Card sx={styles.card}>
      <CardMedia component="img" height="148" image={imageSrc} alt={altText} onError={handleImageError} />
      <CardContent sx={styles.cardContent}>
        <ContentCardBadge type={type} status={status} localizations={localizedKeys}></ContentCardBadge>
        <Box sx={styles.mainInfo}>
          <Typography component="h3" sx={styles.title}>
            {titleText}
          </Typography>
          <Box onClick={onClickMenu} data-testid="menu-button" sx={{ cursor: 'pointer' }}>
            <EllipsisVertical size={20} />
          </Box>
        </Box>
        <Typography variant="body2" sx={styles.date}>
          {getStatus(status, createdAt, updatedAt, publishedAt)}
        </Typography>
        <Button variant="filled" color="primary" onClick={onClick}>
          Редагувати
        </Button>
      </CardContent>
    </Card>
  );
};
export default ContentCard;
