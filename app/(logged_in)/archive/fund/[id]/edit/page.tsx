'use client';

import { Box } from '@mui/material';
import { useParams } from 'next/navigation';

import { styles } from '../../../create/page.styles';
import FundView from '~/(logged_in)/archive/create/FundView';
import { useUpsertFund } from '~/shared/hooks/use-upsert-fund/useUpsertFund';

export default function EditFundPage() {
  const params = useParams<{ id: string }>();
  const fundData = useUpsertFund(params.id);

  return (
    <Box sx={styles.container}>
      <FundView data={fundData} fundId={params.id} mode="edit" />
    </Box>
  );
}
