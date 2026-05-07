'use client';
import { Box } from '@mui/material';
import { notFound, useParams } from 'next/navigation';

import CreatePublicationsView from './CreatePublicationsView';
import { styles } from './page.styles';
import { PUBLICATIONS_TYPES, PublicationsItemType } from '~/constants/publications';
import { useUpsertPublication } from '~/shared/hooks/use-upsert-publication/useUpsertPublication';

export default function CreatePublicationPage() {
  const params = useParams();
  const type = params?.type as PublicationsItemType;

  const publicationData = useUpsertPublication({ type });

  if (!PUBLICATIONS_TYPES.includes(type)) notFound();

  return (
    <Box sx={styles.container}>
      <CreatePublicationsView data={publicationData} />
    </Box>
  );
}
