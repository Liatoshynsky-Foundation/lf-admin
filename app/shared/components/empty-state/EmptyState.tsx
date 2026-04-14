import { Box, Button, Typography } from '@mui/material';
import Link from 'next/link';
import type { ReactNode } from 'react';

import { styles } from './EmptyState.styles';

type EmptyStateAction = {
  label: string;
  href?: string;
  onClick?: () => void;
};

type EmptyStateProps = Readonly<{
  title: string;
  description: string;
  icon?: ReactNode;
  action?: EmptyStateAction;
  dataTestId?: string;
}>;

export function EmptyState({ title, description, icon, action, dataTestId }: EmptyStateProps) {
  return (
    <Box sx={styles.container} data-testid={dataTestId}>
      {icon && <Box sx={styles.icon}>{icon}</Box>}

      <Typography variant="h6" sx={styles.title}>
        {title}
      </Typography>

      <Typography variant="customMedium16" sx={styles.description}>
        {description}
      </Typography>

      {action && (
        <Button
          variant="contained"
          {...(action.href ? { component: Link, href: action.href } : {})}
          onClick={action.onClick}
          sx={styles.actionButton}
        >
          {action.label}
        </Button>
      )}
    </Box>
  );
}
