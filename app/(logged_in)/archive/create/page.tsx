'use client';

import { Box } from '@mui/material';

import FundView from './FundView';
import { styles } from './page.styles';
import { useUpsertFund } from '~/shared/hooks/use-upsert-fund/useUpsertFund';

export default function CreateFundPage() {
  const fundData = useUpsertFund();

  return (
    <Box sx={styles.container}>
      <FundView data={fundData} mode="create" />
    </Box>
  );
}