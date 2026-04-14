import { Box, Button, Typography } from '@mui/material';
import Link from 'next/link';
import type { ReactNode } from 'react';

import { styles } from './EmptyState.styles';
import { colors } from '~/shared/components/design-system/button/Button.styles';

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
}>;

export function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  return (
    <Box sx={styles.container}>
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
          sx={{
            mt: '8px',
            borderRadius: '20px',
            px: '24px',
            py: '8px',
            minHeight: '40px',
            textTransform: 'none',
            color: colors.white,
            boxShadow: 'none',
            fontSize: '16px',
            lineHeight: 1.5,
            bgcolor: colors.black,
            '&:hover': {
              bgcolor: colors.blue[900],
              boxShadow: 'none'
            }
          }}
        >
          {action.label}
        </Button>
      )}
    </Box>
  );
}
