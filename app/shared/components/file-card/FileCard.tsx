'use client';
import { Box, IconButton, Paper, Stack, Typography } from '@mui/material';
import Image from 'next/image';
import { MouseEvent, useState } from 'react';

import { styles } from './FileCard.styles';
import TooltipCustom from '~/ds-components/tooltip/Tooltip';
import { formatUsageCount } from '~/lib/utils/formatUsageCount';
import { useUpdateAssetMutation } from '~/types/graphql/generated/graphql';

const ICON_SIZE = 21;
const ICON_SIZE_2 = 32;

const FILE_TYPES = {
  image: 'img',
  audio: 'audio',
  pdf: 'pdf',
  document: 'doc',
  spreadsheet: 'xls',
  video: 'video-file',
  archive: 'zip'
} as const;

export type FileType = keyof typeof FILE_TYPES;

export interface FileCardData {
  id: string;
  name: string;
  dateAdded: string;
  isStarred?: boolean;
  usageLinks?: number;
  imageSrc?: string;
}

export interface FileCardProps {
  fileType: FileType;
  fileData: FileCardData;
  onClick?: () => void;
}

const FileCard = ({ fileType, fileData, onClick }: FileCardProps) => {
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);
  const { id, name, dateAdded, isStarred = false, usageLinks, imageSrc } = fileData;

  const [updateAsset, { loading: isUpdatingStar }] = useUpdateAssetMutation();

  const handleMenuClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
  };

  const handleStarClick = async (e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    try {
      await updateAsset({
        variables: {
          id,
          input: { isStarred: !isStarred }
        }
      });
    } catch {}
  };

  const fileTypeIcon = FILE_TYPES[fileType] || FILE_TYPES.image;

  return (
    <Paper variant="outlined" sx={styles.container} onClick={onClick}>
      <Box sx={styles.imageSection}>
        {fileType === 'image' && imageSrc ? (
          <Image src={imageSrc} alt={name} fill style={{ objectFit: 'cover' }} sizes="301px" />
        ) : (
          <Box sx={styles.imagePlaceholder}>
            <Image src={`/icons/${fileTypeIcon}.svg`} width={64} height={64} alt={`${fileType} placeholder`} />
          </Box>
        )}
      </Box>

      <Stack sx={styles.fileInfoSection}>
        <Stack direction="row" alignItems="center" gap="8px" flex={1} minWidth={0}>
          <Image
            src={`/icons/${fileTypeIcon}.svg`}
            width={ICON_SIZE}
            height={ICON_SIZE}
            alt={`${fileType} icon`}
            style={{ width: ICON_SIZE, height: ICON_SIZE }}
          />
          <Typography variant="subtitle1" sx={styles.fileTitle} noWrap>
            {name}
          </Typography>
        </Stack>

        <IconButton size="small" aria-label="Open file menu" onClick={handleMenuClick}>
          <Image src="/icons/menu.svg" width={ICON_SIZE_2} height={32} alt="Menu icon" aria-hidden />
        </IconButton>
      </Stack>

      <Stack sx={styles.metadataSection}>
        <Typography variant="caption" sx={styles.fileDate}>
          {dateAdded}
        </Typography>

        <Stack direction="row" gap="8px" alignItems="center">
          {isStarred && (
            <Box sx={{ ...styles.iconWrapper, cursor: isUpdatingStar ? 'wait' : 'pointer' }} onClick={handleStarClick}>
              <Image src="/icons/star-1.svg" width={ICON_SIZE} height={ICON_SIZE} alt="Starred file" />
            </Box>
          )}

          {usageLinks !== undefined && usageLinks > 0 && (
            <TooltipCustom
              title={`Використовується на сайті: ${formatUsageCount(usageLinks)}`}
              placement="top"
              showArrow={false}
              isOpen={isTooltipOpen}
            >
              <Box
                sx={styles.iconWrapper}
                onMouseEnter={() => setIsTooltipOpen(true)}
                onMouseLeave={() => setIsTooltipOpen(false)}
              >
                <Image src="/icons/link-2.svg" width={ICON_SIZE} height={ICON_SIZE} alt="Linked file" />
              </Box>
            </TooltipCustom>
          )}
        </Stack>
      </Stack>
    </Paper>
  );
};

export default FileCard;
