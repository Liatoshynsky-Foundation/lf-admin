import { Box, IconButton,Stack, Typography } from '@mui/material';
import { Trash2 } from 'lucide-react';
import Image from 'next/image';
import React from 'react';

import { styles } from './FileItem.styles';
import { COMPOSITION_FILE_TYPES, CompositionFileType } from '~/constants/creativity';

const ICON_SIZE = 21;


interface FileItemProps {
  fileName: string;
  fileType: CompositionFileType;
  onDelete: () => void;
}

const FileItem: React.FC<FileItemProps> = ({ fileName, fileType, onDelete }) => {
  return (
    <Stack direction="row" spacing={1} alignItems="center" sx={styles.wrapper}>
      <Box sx={styles.fileContainer}>
        <Image
          src={`/icons/${COMPOSITION_FILE_TYPES[fileType]}.svg`}
          width={ICON_SIZE}
          height={ICON_SIZE}
          alt={`${fileType} file icon`}
        />
        
        <Typography sx={styles.fileName} title={fileName} noWrap>
          {fileName}
        </Typography>
      </Box>

      <IconButton onClick={onDelete} sx={styles.deleteButton} aria-label="delete file">
        <Trash2 size={24} />
      </IconButton>
    </Stack>
  );
};

export default FileItem;
