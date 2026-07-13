'use client';

import { Box, Stack, Typography } from '@mui/material';
import Image from 'next/image';
import { MouseEvent, useState } from 'react';
import toast from 'react-hot-toast';

import CardLayout from '../card-layout/CardLayout';
import TitleWithTooltip from '../card-layout/TitleWithTooltip';
import { styles } from './FileCard.styles';
import FileCardMenuItems from './FileCardMenuItems';
import TooltipCustom from '~/ds-components/tooltip/Tooltip';
import { formatUsageCount } from '~/lib/utils/formatUsageCount';
import { useUpdateAssetMutation } from '~/types/graphql/generated/graphql';

const ICON_SIZE = 21;
const FAVORITE_UPDATE_ERROR = 'Не вдалося оновити статус обраного файлу. Спробуйте пізніше.';

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
  isSelected?: boolean;
  onClick?: () => void;
  onAction?: (action: 'rename' | 'delete' | 'download', fileId: string) => void;
  onToggleStar?: (fileId: string, next: boolean) => Promise<void> | void;
}

const FileCard = ({ fileType, fileData, isSelected = false, onClick, onAction, onToggleStar }: FileCardProps) => {
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);

  const { id, name, dateAdded, isStarred = false, usageLinks, imageSrc } = fileData;
  const [updateAsset, { loading: isUpdatingStar }] = useUpdateAssetMutation();

  const handleToggleStar = async () => {
    try {
      if (onToggleStar) {
        await onToggleStar(id, !isStarred);
        return;
      }

      await updateAsset({
        variables: {
          id,
          input: { isStarred: !isStarred }
        }
      });
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : FAVORITE_UPDATE_ERROR);
    }
  };

  const handleStarClick = (e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    handleToggleStar();
  };

  const fileTypeIcon = FILE_TYPES[fileType] || FILE_TYPES.image;

  const imageNode = (
    <Box sx={styles.imageSection}>
      {fileType === 'image' && imageSrc ? (
        <Image src={imageSrc} alt={name} fill style={{ objectFit: 'cover' }} sizes="301px" />
      ) : (
        <Box sx={styles.imagePlaceholder}>
          <Image src={`/icons/${fileTypeIcon}.svg`} width={64} height={64} alt={`${fileType} placeholder`} />
        </Box>
      )}
    </Box>
  );

  const titleNode = (
    <Stack
      direction="row"
      alignItems="center"
      gap="8px"
      sx={{ height: '100%', width: '100%', minWidth: 0, flexGrow: 1 }}
    >
      <Image
        src={`/icons/${fileTypeIcon}.svg`}
        width={ICON_SIZE}
        height={ICON_SIZE}
        alt={`${fileType} icon`}
        style={{ width: ICON_SIZE, height: ICON_SIZE, flexShrink: 0 }}
      />

      <TitleWithTooltip text={name} fontWeight={500} lineClamp={1} />
    </Stack>
  );

  const infoNode = (
    <Stack sx={{ ...styles.metadataSection, width: '100%' }}>
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
  );

  const itemsNode = FileCardMenuItems({
    isStarred,
    isStarLoading: isUpdatingStar,
    onOpenDetails: () => onClick?.(),
    onRename: () => onAction?.('rename', id),
    onToggleStar: handleToggleStar,
    onDownload: () => onAction?.('download', id),
    onDelete: () => onAction?.('delete', id)
  });

  return (
    <Box onClick={onClick}>
      <CardLayout
        coverImage={imageNode}
        title={titleNode}
        info={infoNode}
        spaceBetweenContent={400}
        interactive={true}
        isSelected={isSelected}
        items={itemsNode}
      />
    </Box>
  );
};

export default FileCard;
