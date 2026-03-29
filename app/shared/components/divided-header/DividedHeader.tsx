'use client';

import { Box, IconButton, Stack, SxProps, Theme } from '@mui/material';
import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { MouseEvent, ReactNode } from 'react';

import { styles } from './DividedHeader.style';
import HeaderRightActions from './HeaderRightActions/HeaderRightActions';
import { sxToArray } from '~/lib/utils/sxToArray';

export type DividedHeaderProps = {
  mode: 'create' | 'edit' | 'seo';
  returnUrl?: string;
  onEdit?: () => void;
  onPublish?: () => void;
  onSave?: () => void;
  onCancel?: () => void;
  onRightMenuOpen?: (event: MouseEvent<HTMLButtonElement>) => void;
  children?: ReactNode;
  sx?: SxProps<Theme>;
};

export default function DividedHeader({
  mode,
  returnUrl = '/',
  onEdit,
  onPublish,
  onSave,
  onCancel,
  onRightMenuOpen,
  children,
  sx
}: DividedHeaderProps) {
  const router = useRouter();

  const handleReturn = () => router.push(returnUrl);

  return (
    <Box sx={[styles.container, ...sxToArray(sx)]}>
      <Stack alignItems="center" justifyContent="space-between" direction={'row'} sx={styles.contentStack}>
        <IconButton onClick={handleReturn} sx={styles.returnButton} aria-label={`Go back to ${handleReturn}`}>
          <ChevronLeft color="black" strokeWidth="1.5px" size={24} />
        </IconButton>

        <Stack alignItems="center" justifyContent="flex-start" direction={'row'} sx={styles.children}>
          {children}
        </Stack>

        <HeaderRightActions mode={mode} onEdit={onEdit} onPublish={onPublish} onSave={onSave} onCancel={onCancel} onMenuOpen={onRightMenuOpen} />
      </Stack>
    </Box>
  );
}
