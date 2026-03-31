'use client';

import { Box, IconButton, Stack, SxProps, Theme } from '@mui/material';
import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { MouseEvent, ReactNode } from 'react';

import { styles } from './DividedHeader.style';
import HeaderRightActions from './header-right-actions/HeaderRightActions';
import { sxToArray } from '~/lib/utils/sxToArray';

export type DividedHeaderProps = {
  mode: 'create' | 'edit' | 'seo';
  originUrl?: string;
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
  originUrl = '/',
  onEdit,
  onPublish,
  onSave,
  onCancel,
  onRightMenuOpen,
  children,
  sx
}: Readonly<DividedHeaderProps>) {
  const router = useRouter();

  const handleReturn = () => router.push(originUrl);

  return (
    <Box sx={[styles.container, ...sxToArray(sx)]}>
      <Stack alignItems="center" justifyContent="space-between" direction={'row'} sx={styles.contentStack}>
        <IconButton onClick={handleReturn} sx={styles.returnButton} aria-label={`Повернутись на сторінку ${originUrl}`}>
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
