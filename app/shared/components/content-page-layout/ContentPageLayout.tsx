import { Box } from '@mui/material';
import { ReactNode } from 'react';

import { styles } from './ContentPageLayout.styles';
import DividedHeader from '~/shared/components/divided-header/DividedHeader';

type ContentPageLayoutProps = Readonly<{
  children: ReactNode;
  title?: ReactNode;
  headerContent?: ReactNode;
  originUrl?: string;
  onBackClick?: () => void;
  showBackButton?: boolean;
  rightActions?: ReactNode;
}>;

export const ContentPageLayout = ({
  children,
  title,
  headerContent,
  originUrl,
  onBackClick,
  showBackButton,
  rightActions
}: ContentPageLayoutProps) => (
  <Box sx={styles.container}>
    {(title || headerContent) && (
      <Box sx={styles.header}>
        <DividedHeader
          originUrl={originUrl}
          onBackClick={onBackClick}
          showBackButton={showBackButton}
          rightActionsComponent={rightActions}
        >
          {title}
          {headerContent}
        </DividedHeader>
      </Box>
    )}
    <Box sx={styles.mainContent}>{children}</Box>
  </Box>
);
