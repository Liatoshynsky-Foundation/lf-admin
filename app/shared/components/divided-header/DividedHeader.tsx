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
};

export default function DividedHeader({ originUrl = '/', rightActionsComponent, children, sx }: Readonly<DividedHeaderProps>) {
  const router = useRouter();

  const handleReturn = () => router.push(originUrl);

  return (
    <Box sx={[styles.container, ...sxToArray(sx)]}>
      <Box sx={styles.contentStack}>
        <IconButton onClick={handleReturn} sx={styles.returnButton} aria-label={`Повернутись на сторінку ${originUrl}`}>
          <ChevronLeft strokeWidth="1.5px" size={24} />
        </IconButton>

        <Box sx={styles.children}>
          {children}
        </Box>
      </Box>
      <Box>{rightActionsComponent}</Box>
    </Box>
  );
}
