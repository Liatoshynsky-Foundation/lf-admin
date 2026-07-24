import { Box, IconButton, Link } from '@mui/material';
import { Pencil } from 'lucide-react';

import { styles } from './EditAction.styles';

type EditActionProps = Readonly<{
  label: string;
  href?: string;
  onClick?: () => void;
}>;

export function EditAction({ href, label, onClick }: EditActionProps) {
  const clickProps = onClick
    ? {
      onClick: (e: React.MouseEvent) => {
        e.stopPropagation();
        onClick();
      }
    }
    : { component: Link, href, onClick: (e: React.MouseEvent) => e.stopPropagation() };

  return (
    <Box sx={styles.editActionWrapper}>
      <IconButton {...clickProps} aria-label={label} sx={styles.editActionButton}>
        <Pencil size={20} />
      </IconButton>
    </Box>
  );
}
