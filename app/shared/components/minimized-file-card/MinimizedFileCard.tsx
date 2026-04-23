import { Box, IconButton, Paper, Stack, Typography } from '@mui/material';
import Image from 'next/image';
import { MouseEvent } from 'react';

import { styles } from '~/components/minimized-file-card/MinimizedFileCard.styles';
import { useUpdateAssetMutation } from '~/types/graphql/generated/graphql';

const ICON_SIZE = 21;

const FILE_TYPES = {
  img: 'img',
  audio: 'audio',
  pdf: 'pdf',
  doc: 'doc',
  xls: 'xls',
  'video-file': 'video-file',
  archive: 'zip'
} as const;

type FileType = keyof typeof FILE_TYPES;

interface MinimizedFileCardProps {
  id: string;
  fileType?: FileType;
  starred?: boolean;
  linked?: boolean;
  name: string;
  date: string;
  onClick?: () => void;
  onMenuClick?: (e: MouseEvent<HTMLButtonElement>) => void;
}

const MinimizedFileCard = ({
  id,
  fileType = FILE_TYPES.img,
  starred = false,
  linked = false,
  name,
  date,
  onClick,
  onMenuClick
}: MinimizedFileCardProps) => {
  const [updateAsset, { loading: isUpdatingStar }] = useUpdateAssetMutation();

  const handleMenuClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onMenuClick?.(e);
  };

  const handleStarClick = async (e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    try {
      await updateAsset({
        variables: {
          id,
          input: { isStarred: !starred }
        }
      });
    } catch {}
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

        <Stack direction="row" gap={'10px'} alignItems="center">
          {starred && (
            <Box
              onClick={handleStarClick}
              sx={{
                ...styles.iconWrapper,
                cursor: isUpdatingStar ? 'wait' : 'pointer'
              }}
            >
              <Image src="/icons/star-1.svg" width={ICON_SIZE} height={ICON_SIZE} alt="Starred file" />
            </Box>
          )}
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
