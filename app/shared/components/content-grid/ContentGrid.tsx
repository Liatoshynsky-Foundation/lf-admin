'use client';

import { Alert, Box, CircularProgress, Typography } from '@mui/material';

import { ContentCard } from '~/shared/components/content-card';
import { useContentData } from '~/shared/hooks/use-content-data';
import { ContentGridProps, ContentType } from '~/types/contentGrid';

export function ContentGrid({ contentType, limit = 12 }: Readonly<ContentGridProps>) {
  const { data, isLoading, error, refetch } = useContentData(contentType, limit);

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px'
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={60} />
          <Typography variant="body1" sx={{ mt: 2 }} color="text.secondary">
            Завантаження...
          </Typography>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert
          severity="error"
          action={
            <Box
              component="button"
              onClick={refetch}
              sx={{
                cursor: 'pointer',
                background: 'none',
                border: 'none',
                color: 'inherit',
                textDecoration: 'underline',
                fontSize: 'inherit',
                padding: 0,
                ml: 2
              }}
            >
              Спробувати знову
            </Box>
          }
        >
          <Typography variant="body1">Помилка завантаження даних</Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            {error.message}
          </Typography>
        </Alert>
      </Box>
    );
  }

  if (data.length === 0) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px',
          textAlign: 'center',
          p: 4
        }}
      >
        <Box>
          <Typography variant="h5" gutterBottom color="text.secondary">
            Немає доступних матеріалів
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {contentType === ContentType.NEWS && 'Новини ще не опубліковані'}
            {contentType === ContentType.EVENTS && 'Події ще не опубліковані'}
            {contentType === ContentType.MEDIA && 'Медіа ще не опубліковані'}
          </Typography>
        </Box>
      </Box>
    );
  }

  const renderCard = (item: any) => {
    /* eslint-disable */
    switch (contentType) {
      case ContentType.NEWS:
        return <ContentCard key={item.id} item={item} />;
      case ContentType.EVENTS:
        return (
          <Box key={item.id} sx={{ p: 2, border: '1px dashed grey' }}>
            <Typography>Event Card</Typography>
          </Box>
        );
      case ContentType.MEDIA:
        return (
          <Box key={item.id} sx={{ p: 2, border: '1px dashed grey' }}>
            <Typography>Media Card</Typography>
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)',
            lg: 'repeat(4, 1fr)'
          },
          gap: 3
        }}
      >
        {data.map((item) => renderCard(item))}
      </Box>
    </Box>
  );
}
