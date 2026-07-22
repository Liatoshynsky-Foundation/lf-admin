import { Box, IconButton, Link } from '@mui/material';
import { Pencil } from 'lucide-react';

import { styles } from './EditAction.styles';

type EditActionProps = Readonly<{
  label: string;
  href?: string;
  onClick?: () => void;
}>;

export function EditAction({ href, label, onClick }: EditActionProps) {
  if (onClick) {
    return (
      <Box sx={styles.editActionWrapper}>
        <IconButton
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          aria-label={label}
          sx={styles.editActionButton}
        >
          <Pencil size={20} />
        </IconButton>
      </Box>
    );
  }
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
