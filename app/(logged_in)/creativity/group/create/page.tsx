'use client';

import { Box } from '@mui/material';

import OpusView from './OpusView';
import { styles } from './page.styles';
import { useUpsertOpus } from '~/shared/hooks/use-upsert-opus/useUpsertOpus';

export default function CreateOpusGroupPage() {
  const opusData = useUpsertOpus();

  return (
    <Box sx={styles.container}>
      <OpusView data={opusData} mode="create" />
    </Box>
  );
}
