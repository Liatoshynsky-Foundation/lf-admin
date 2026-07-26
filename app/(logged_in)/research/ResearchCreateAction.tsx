import { Box } from '@mui/material';
import { Plus } from 'lucide-react';

import { styles } from './ResearchCreateAction.styles';

export function ResearchCreateAction({ onClick }: Readonly<{ onClick: () => void }>) {
  return (
    <Box component="button" type="button" onClick={onClick} sx={styles.createButton}>
      <Box component={Plus} sx={styles.icon} />
      Додати роботу
    </Box>
  );
}
