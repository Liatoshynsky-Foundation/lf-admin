'use client';

import { Box } from '@mui/material';
import { useParams } from 'next/navigation';

import OpusView from '../../create/OpusView';
import { styles } from '../../create/page.styles';
import { useUpsertOpus } from '~/shared/hooks/use-upsert-opus/useUpsertOpus';

export default function EditOpusGroupPage() {
  const params = useParams();
  const id = params?.id as string;

  const opusData = useUpsertOpus({ id });
  console.log('opusData:', opusData);

  return (
    <Box sx={styles.container}>
      <OpusView data={opusData} mode="edit" />
    </Box>
  );
}
