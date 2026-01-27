'use client';

import { Box, Card, CardActionArea, CardContent, CardMedia, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';

import { NewsItem } from '~/types/contentGrid';

interface NewsCardProps {
  item: NewsItem;
}

export function NewsCard({ item }: Readonly<NewsCardProps>) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/news/${item.slug}`);
  };

  const formatDate = (dateString?: string) => {
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

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4
        }
      }}
    >
      <CardActionArea
        onClick={handleClick}
        sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
      >
        {item.coverImage && (
          <CardMedia
            component="img"
            height="200"
            image={item.coverImage.src}
            alt={item.coverImage.alt}
            sx={{
              objectFit: 'cover'
            }}
          />
        )}

        <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <Typography
            gutterBottom
            variant="h6"
            component="h2"
            sx={{
              fontWeight: 600,
              lineHeight: 1.3,
              mb: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical'
            }}
          >
            {item.title}
          </Typography>

          {item.description && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mb: 2,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                flexGrow: 1
              }}
            >
              {item.description}
            </Typography>
          )}

          <Box sx={{ mt: 'auto', pt: 1 }}>
            <Typography variant="caption" color="text.secondary">
              {formatDate(item.publishedAt || item.newsDate || item.createdAt)}
            </Typography>

            {item.views > 0 && (
              <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
                {item.views.toLocaleString()} переглядів
              </Typography>
            )}
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
