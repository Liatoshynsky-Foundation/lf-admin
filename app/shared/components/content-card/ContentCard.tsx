import { Box, Card, CardContent, CardMedia, Typography } from '@mui/material';
import Image from 'next/image';

import Button from '../design-system/button/Button';
import styles from './ContentCard.styles';
import ContentCardBadge from './ContentCardBadge';
import { getStatus } from '~/lib/utils/getStatus';

export type ContentType = 'news' | 'event' | 'media';

interface ContentCardProps {
  type: ContentType;
  coverImage: {
    src: string;
    alt: {
      uk: string;
      en: string;
    };
  };
  title: {
    uk: string;
    en: string;
  };
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
  return (
    <Card sx={styles.card}>
      <CardMedia component="img" height="148" image={coverImage.src} alt={coverImage.alt.uk} />
      <CardContent sx={styles.cardContent}>
        <ContentCardBadge type={type} status={status} localizations={Object.keys(title)}></ContentCardBadge>
        <Box sx={styles.mainInfo}>
          <Typography component="h3" sx={styles.title}>
            {title.uk}
          </Typography>
          <Box onClick={onClickMenu}>
            <Image
              src="/icons/ellipsisVertical.svg"
              alt="menu"
              width={4}
              height={14}
              style={{ cursor: 'pointer' }}
            ></Image>
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
