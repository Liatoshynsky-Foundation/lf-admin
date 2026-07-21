import { Box } from '@mui/material';
import { Plus } from 'lucide-react';
import Link from 'next/link';

import { styles } from './ResearchCreateAction.styles';

const RESEARCH_CREATE_PATH = '/research/create';

export function ResearchCreateAction() {
  return (
    <Box component={Link} href={RESEARCH_CREATE_PATH} sx={styles.createButton}>
      <Box component={Plus} sx={styles.icon} />
      Додати роботу
    </Box>
  );
}
