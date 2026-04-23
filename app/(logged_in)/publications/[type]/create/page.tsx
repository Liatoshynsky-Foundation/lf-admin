'use client';
import { Box, Typography } from '@mui/material';
import { notFound,useParams } from 'next/navigation';

import CreatePublicationView from './CreatePublicationView';
import { styles } from './page.styles';
import DividedHeader from '~/shared/components/divided-header/DividedHeader';
import HeaderRightActions from '~/shared/components/divided-header/header-right-actions/HeaderRightActions';
import {
  PAGE_TITLES,
  PublicationType,
  useUpsertPublication,
  VALID_TYPES} from '~/shared/hooks/use-upsert-publication/useUpsertPublication';

export default function CreatePublicationPage() {
  const params = useParams();
  const type = params?.type as PublicationType;

  if (!VALID_TYPES.includes(type as PublicationType)) notFound();
  const targetId = '69e90d59b42da040169e7525';

  const publicationData = useUpsertPublication({ type: type as PublicationType, id: targetId as string });

  return (
    <Box sx={styles.container}>
      <DividedHeader rightActionsComponent={<HeaderRightActions mode="edit" onPublish={publicationData.handleSave} />}>
        <Typography variant="customBold20Tight">{`Створення ${PAGE_TITLES[type]}`}</Typography>
      </DividedHeader>

      <CreatePublicationView data={publicationData} />
    </Box>
  );
}
