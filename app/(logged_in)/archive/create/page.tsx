'use client';

import { Box } from '@mui/material';

import FondView from './FondView';
import { styles } from './page.styles';
import { useUpsertFond } from '~/shared/hooks/use-upsert-fond/useUpsertFond';

export default function CreateFondPage() {
  const fondData = useUpsertFond();

  return (
    <Box sx={styles.container}>
      <FondView data={fondData} mode="create" />
    </Box>
  );
}