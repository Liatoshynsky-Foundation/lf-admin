'use client';

import { Box, Card, CardActionArea, CardContent, CardMedia, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';

import Button from '../design-system/button/Button';
import { NewsItem } from '~/types/contentGrid';

interface NewsCardProps {
  item: NewsItem;
}

export function ContentCard({ item }: Readonly<NewsCardProps>) {
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
        height: '344px',
        width: '301px',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '16px',
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4
        }
      }}
    >
      <CardActionArea
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          justifyContent: 'flex-start',
          p: 0
        }}
      >
        {item.coverImage && (
          <CardMedia
            component="img"
            height="140"
            image={item.coverImage.src}
            alt={item.coverImage.alt}
            sx={{
              objectFit: 'cover',
              flexShrink: 0
            }}
          />
        )}

        <CardContent
          sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            p: 2,
            pb: '12px !important',
            height: 'calc(100% - 140px)',
            overflow: 'hidden'
          }}
        >
          <Typography
            variant="h6"
            component="h2"
            sx={{
              fontWeight: 600,
              fontSize: '0.95rem',
              lineHeight: 1.3,
              mb: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              minHeight: '2.47em',
              flexShrink: 0
            }}
          >
            {item.title}
          </Typography>

          <Box sx={{ mt: 'auto', mb: 1, flexShrink: 0 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
              {formatDate(item.publishedAt || item.newsDate || item.createdAt)}
            </Typography>

            {item.views > 0 && (
              <Typography variant="caption" color="text.secondary" sx={{ ml: 1.5, fontSize: '0.7rem' }}>
                {item.views.toLocaleString()} переглядів
              </Typography>
            )}
          </Box>

          <Button
            variant="filled"
            color="primary"
            onClick={handleClick}
            sx={{
              flexShrink: 0,
              py: 0.75,
              fontSize: '0.875rem'
            }}
          >
            Редагувати
          </Button>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
