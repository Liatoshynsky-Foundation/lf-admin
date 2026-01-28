'use client';

import { Box, CircularProgress, Typography } from '@mui/material';
import { useEffect, useState } from 'react';

import { client } from '~/lib/utils/apollo-client';
import { NewsContentMedia } from '~/shared/components/news-content-media/NewsContentMedia';
import { NewsDetailHeader } from '~/shared/components/news-detail-header/NewsDetailHeader';
import { NewsDetails } from '~/shared/components/news-details/NewsDetails';
import { NewsStatus } from '~/types/enums/common.enums';
import {
  NewsBySlugDocument,
  NewsBySlugQuery,
  NewsBySlugQueryVariables,
  UpdateNewsDocument,
  UpdateNewsMutation,
  UpdateNewsMutationVariables
} from '~/types/graphql/generated/graphql';

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
          variables: { slug },
          fetchPolicy: 'network-only' // Always fetch fresh data
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

  const updateNewsField = async (field: string, value: any) => {
    if (!newsData) return;

    try {
      const { data, errors } = await client.mutate<UpdateNewsMutation, UpdateNewsMutationVariables>({
        mutation: UpdateNewsDocument,
        variables: {
          id: newsData.id,
          input: {
            [field]: value
          }
        }
      });

      if (errors && errors.length > 0) {
        throw new Error(errors[0].message);
      }

      if (data?.updateNews) {
        setNewsData(data.updateNews);
      }
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update news');
    }
  };

  const handleUkrainianTitleChange = async (newTitle: string) => {
    if (!newsData) return;

    await updateNewsField('title', {
      uk: newTitle,
      en: newsData.title.en
    });
  };

  const handleEnglishTitleChange = async (newTitle: string) => {
    if (!newsData) return;

    await updateNewsField('title', {
      uk: newsData.title.uk,
      en: newTitle
    });
  };

  const handleUkrainianDescriptionChange = async (newDescription: string) => {
    if (!newsData) return;

    await updateNewsField('description', {
      uk: newDescription,
      en: newsData.description?.en || ''
    });
  };

  const handleEnglishDescriptionChange = async (newDescription: string) => {
    if (!newsData) return;

    await updateNewsField('description', {
      uk: newsData.description?.uk || '',
      en: newDescription
    });
  };

  const handleStatusChange = async (newStatus: NewsStatus) => {
    await updateNewsField('status', newStatus);
  };

  const handlePublicationDateChange = async (newDate: string) => {
    await updateNewsField('publishedAt', newDate);
  };

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
        <NewsDetailHeader newsId={newsData.id} />
      </Box>

      <Box>
        <NewsDetails
          title={newsData.title.uk}
          status={newsData.status}
          publicationDate={newsData.publishedAt ?? undefined}
          onTitleChange={handleUkrainianTitleChange}
          onStatusChange={handleStatusChange}
          onPublicationDateChange={handlePublicationDateChange}
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
          onUkrainianTitleChange={handleUkrainianTitleChange}
          onEnglishTitleChange={handleEnglishTitleChange}
          onUkrainianDescriptionChange={handleUkrainianDescriptionChange}
          onEnglishDescriptionChange={handleEnglishDescriptionChange}
        />
      </Box>
    </Box>
  );
}
