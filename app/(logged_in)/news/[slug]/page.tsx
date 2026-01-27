'use client';

import { Box, CircularProgress, Typography } from '@mui/material';
import { useEffect, useState } from 'react';

import { client } from '~/lib/utils/apollo-client';
import { NewsContentMedia } from '~/shared/components/news-content-media/NewsContentMedia';
import { NewsDetailHeader } from '~/shared/components/news-detail-header/NewsDetailHeader';
import { NewsDetails } from '~/shared/components/news-details/NewsDetails';
import { NewsBySlugDocument, NewsBySlugQuery, NewsBySlugQueryVariables } from '~/types/graphql/generated/graphql';

interface Props {
  params: Promise<{
    slug: string;
  }>;
}

export default function NewsItem({ params }: Props) {
  const [slug, setSlug] = useState<string>('');
  const [newsData, setNewsData] = useState<NewsBySlugQuery['newsBySlug'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    params.then((p) => setSlug(p.slug));
  }, [params]);

  useEffect(() => {
    if (!slug) return;

    const fetchNews = async () => {
      try {
        setLoading(true);
        const { data, error } = await client.query<NewsBySlugQuery, NewsBySlugQueryVariables>({
          query: NewsBySlugDocument,
          variables: { slug }
        });

        if (error) {
          setError(error.message);
        } else {
          setNewsData(data?.newsBySlug || null);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [slug]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography color="error" variant="h6">
          Error loading news: {error}
        </Typography>
      </Box>
    );
  }

  if (!newsData) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography variant="h6">News not found</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ ml: '-20px', mb: 4 }}>
        <NewsDetailHeader title={newsData.title.uk} newsId={newsData.id} />
      </Box>

      <Box>
        <NewsDetails
          title={newsData.title.uk}
          status={newsData.status}
          publicationDate={newsData.publishedAt ?? undefined}
        />

        <NewsContentMedia
          ukrainianContent={{
            title: newsData.title.uk,
            description: newsData.description?.uk ?? '',
            content: newsData.content.uk
          }}
          englishContent={{
            title: newsData.title.en,
            description: newsData.description?.en ?? '',
            content: newsData.content.en
          }}
          coverImage={{
            src: newsData.coverImage.src,
            alt: newsData.coverImage.alt.uk
          }}
        />
      </Box>
    </Box>
  );
}
