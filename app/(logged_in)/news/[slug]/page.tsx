import { Box, Typography } from '@mui/material';

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

export default async function NewsItem({ params }: Props) {
  const { slug } = await params;

  const { data, error } = await client.query<NewsBySlugQuery, NewsBySlugQueryVariables>({
    query: NewsBySlugDocument,
    variables: { slug }
  });

  if (error) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography color="error" variant="h6">
          Error loading news: {error.message}
        </Typography>
      </Box>
    );
  }

  if (!data?.newsBySlug) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography variant="h6">News not found</Typography>
      </Box>
    );
  }

  const newsData = data.newsBySlug;

  return (
    <Box sx={{ ml: '-20px' }}>
      <NewsDetailHeader title={newsData.title.uk} newsId={newsData.id} />

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
  );
}
