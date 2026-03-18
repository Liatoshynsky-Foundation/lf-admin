import { IconButton, Paper, Stack, Typography } from '@mui/material';
import Image from 'next/image';
import { MouseEvent } from 'react';

import { styles } from '~/components/minimized-file-card/MinimizedFileCard.styles';

const ICON_SIZE = 20;

const FILE_TYPES = {
  img: 'img',
  audio: 'audio',
  pdf: 'pdf'
} as const;

type FileType = (typeof FILE_TYPES)[keyof typeof FILE_TYPES];

interface MinimizedFileCardProps {
  fileType?: FileType;
  starred?: boolean;
  linked?: boolean;
  name: string;
  date: string;
  onClick?: () => void;
  onMenuClick?: (e: MouseEvent<HTMLButtonElement>) => void;
}

const MinimizedFileCard = ({
  fileType = FILE_TYPES.img,
  starred = false,
  linked = false,
  name,
  date,
  onClick,
  onMenuClick
}: MinimizedFileCardProps) => {
  const handleMenuClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onMenuClick?.(e);
  };

  return (
    <Paper variant="outlined" sx={styles.container} onClick={onClick}>
      <Stack direction="row" sx={styles.content} alignItems="center" flexGrow={1}>
        <Image
          src={`/icons/${FILE_TYPES[fileType]}.svg`}
          width={ICON_SIZE}
          height={ICON_SIZE}
          alt={`${fileType} file icon`}
        />

        <Typography variant="customMedium18Loose" noWrap>
          {name}
        </Typography>

        <Stack direction="row" gap={'10px'}>
          {starred && <Image src="/icons/star.svg" width={ICON_SIZE} height={ICON_SIZE} alt="Starred file" />}
          {linked && <Image src="/icons/link.svg" width={ICON_SIZE} height={ICON_SIZE} alt="Linked file" />}
        </Stack>
      </Stack>

      <Stack direction="row" sx={styles.content} alignItems="center">
        <Typography variant="customItalic16">{date}</Typography>

        <IconButton size="small" aria-label="Open file menu" onClick={handleMenuClick}>
          <Image src="/icons/menu.svg" width={ICON_SIZE} height={ICON_SIZE} alt="Menu icon" aria-hidden />
        </IconButton>
      </Stack>
    </Paper>
  );
};

export default MinimizedFileCard;
