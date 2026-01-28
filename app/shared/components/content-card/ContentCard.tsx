'use client';

import { Box, Card, CardActionArea, CardContent, CardMedia, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';

import Button from '../design-system/button/Button';
import { styles } from './ContentCard.styles';
import { ContentCardChips } from './ContentCardChips';
import { NewsItem } from '~/types/contentGrid';

interface NewsCardProps {
  item: NewsItem;
  contentType?: 'news' | 'event' | 'media';
}

const formatDate = (dateString?: string): string => {
  if (!dateString) return '';

  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('uk-UA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch {
    return '';
  }
};

export function ContentCard({ item, contentType = 'news' }: Readonly<NewsCardProps>) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/news/${item.slug}`);
  };

  return (
    <Card sx={styles.card}>
      <CardActionArea sx={styles.cardActionArea}>
        {item.coverImage && (
          <CardMedia
            component="img"
            height="140"
            image={item.coverImage.src}
            alt={item.coverImage.alt}
            sx={styles.cardMedia}
          />
        )}

        <ContentCardChips contentType={contentType} status={item.status} />

        <CardContent sx={styles.cardContent}>
          <Typography variant="h6" component="h2" sx={styles.title}>
            {item.title}
          </Typography>

          <Box sx={styles.metaContainer}>
            <Typography variant="caption" color="text.secondary" sx={styles.caption}>
              {formatDate(item.publishedAt || item.newsDate || item.createdAt)}
            </Typography>

            {item.views > 0 && (
              <Typography variant="caption" color="text.secondary" sx={styles.viewsCaption}>
                {item.views.toLocaleString()} переглядів
              </Typography>
            )}
          </Box>

          <Button variant="filled" color="primary" onClick={handleClick} sx={styles.button}>
            Редагувати
          </Button>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
