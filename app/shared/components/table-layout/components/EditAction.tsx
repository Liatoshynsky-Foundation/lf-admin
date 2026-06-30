import { Box, IconButton, Link } from '@mui/material';
import { Pencil } from 'lucide-react';

import { styles } from './EditAction.styles';

export function EditAction({ href, label }: Readonly<{ href: string; label: string }>) {
  return (
    <Box sx={styles.editActionWrapper}>
      <IconButton
        component={Link}
        href={href}
        onClick={(e) => e.stopPropagation()}
        aria-label={label}
        sx={styles.editActionButton}
      >
        <Pencil size={20} />
      </IconButton>
    </Box>
  );
}
