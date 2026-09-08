'use client';

import { Box } from '@mui/material';

import FundView from '../../../create/FundView';
import { styles } from '../../../create/page.styles';
import { useUpsertFund } from '~/shared/hooks/use-upsert-fund/useUpsertFund';

export default function EditFundPage() {
  const fundData = useUpsertFund();

  return (
    <Box sx={styles.container}>
      <FundView data={fundData} mode="edit" />
    </Box>
  );
}