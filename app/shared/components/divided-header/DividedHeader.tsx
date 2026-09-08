'use client';

import { Box, IconButton, SxProps, Theme } from '@mui/material';
import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ReactNode } from 'react';

import { styles } from './DividedHeader.style';
import { sxToArray } from '~/lib/utils/sxToArray';

export type DividedHeaderProps = {
  originUrl?: string;
  rightActionsComponent?: ReactNode;
  children?: ReactNode;
  sx?: SxProps<Theme>;
  onBackClick?: () => void;
  showBackButton?: boolean;
};

export default function DividedHeader({
  originUrl = '/',
  rightActionsComponent,
  children,
  sx,
  onBackClick,
  showBackButton = true
}: Readonly<DividedHeaderProps>) {
  const router = useRouter();

  const handleReturn = () => {
    if (onBackClick) {
      onBackClick();
      return;
    }
    router.push(originUrl);
  };

  return (
    <Box sx={[styles.container, ...sxToArray(sx)]}>
      <Box sx={styles.contentStack}>
        {showBackButton && (
          <IconButton
            onClick={handleReturn}
            sx={styles.returnButton}
            aria-label={`Повернутись на сторінку ${originUrl}`}
          >
            <ChevronLeft strokeWidth="1.5px" size={24} />
          </IconButton>
        )}
        <Box
          sx={[
            ...sxToArray(styles.children),
            showBackButton ? {} : { borderLeft: 'none' },
            rightActionsComponent ? {} : { borderRight: 'none' }
          ]}
        >
          {children}
        </Box>
      </Box>
      {rightActionsComponent && <Box>{rightActionsComponent}</Box>}
    </Box>
  );
}
