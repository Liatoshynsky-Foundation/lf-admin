'use client';

import { Box, Typography } from '@mui/material';
import Image from 'next/image';

import { styles } from './FileView.styles';

export type FileViewProps = Readonly<{
  file: File;
}>;

const getIconNameForFile = (file: File): string => {
  const type = file.type.toLowerCase();
  const name = file.name.toLowerCase();

  if (type.startsWith('audio/') || name.endsWith('.mp3') || name.endsWith('.wav')) return 'audio';
  if (type.includes('pdf') || name.endsWith('.pdf')) return 'pdf';
  if (type.includes('spreadsheet') || type.includes('excel') || name.endsWith('.xlsx') || name.endsWith('.xls'))
    return 'xls';
  if (
    type.includes('zip') ||
    type.includes('rar') ||
    type.includes('compressed') ||
    name.endsWith('.rar') ||
    name.endsWith('.zip')
  ) {
    return 'zip';
  }
  return 'doc';
};

export function FileView({ file }: FileViewProps) {
  const iconName = getIconNameForFile(file);

  return (
    <Box sx={styles.root} data-testid="FileView">
      <Image
        src={`/icons/${iconName}.svg`}
        width={100}
        height={100}
        alt={`${iconName} icon`}
        style={{ objectFit: 'contain' }}
      />

      <Typography variant='subtitle2' sx={styles.fileName}>{file.name}</Typography>
    </Box>
  );
}
