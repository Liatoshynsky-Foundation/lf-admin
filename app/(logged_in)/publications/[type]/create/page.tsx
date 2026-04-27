'use client';
import { Box, Typography } from '@mui/material';
import { notFound, useParams } from 'next/navigation';

import CreatePublicationsView from './CreatePublicationsView';
import { styles } from './page.styles';
import {
  PAGE_TITLES,
  PUBLICATIONS_BASE_PATH,
  PUBLICATIONS_TYPES,
  PublicationsItemType
} from '~/constants/publications';
import DividedHeader from '~/shared/components/divided-header/DividedHeader';
import HeaderRightActions from '~/shared/components/divided-header/header-right-actions/HeaderRightActions';
import { useUpsertPublication } from '~/shared/hooks/use-upsert-publication/useUpsertPublication';

export default function CreatePublicationPage() {
  const params = useParams();
  const type = params?.type as PublicationsItemType;

  const publicationData = useUpsertPublication({ type });

  if (!PUBLICATIONS_TYPES.includes(type)) notFound();

  return (
    <Box sx={styles.container}>
      <DividedHeader
        originUrl={PUBLICATIONS_BASE_PATH}
        rightActionsComponent={<HeaderRightActions mode="create" onEdit={publicationData.handleSave} />}
      >
        <Typography variant="customBold20Tight">{`Створення ${PAGE_TITLES[type]}`}</Typography>
      </DividedHeader>

      <CreatePublicationsView data={publicationData} />
    </Box>
  );
}
