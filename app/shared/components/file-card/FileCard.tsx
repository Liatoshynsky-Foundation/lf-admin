'use client';
'use client';
import { Box, IconButton, Paper, Stack, Typography } from '@mui/material';
import Image from 'next/image';
import { MouseEvent, useState } from 'react';
import toast from 'react-hot-toast';

import CardLayout from '../cards-layout/CardLayout';
import { styles } from './FileCard.styles';
import FileCardMenuItems from './FileCardMenuItems';
import TooltipCustom from '~/ds-components/tooltip/Tooltip';
import { formatUsageCount } from '~/lib/utils/formatUsageCount';
import { useUpdateAssetMutation } from '~/types/graphql/generated/graphql';

const ICON_SIZE = 21;

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
  onAction?: (action: 'rename' | 'delete' | 'download', fileId: string) => void;
}

const FileCard = ({ fileType, fileData, onClick, onAction }: FileCardProps) => {
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);

  const { id, name, dateAdded, isStarred = false, usageLinks, imageSrc } = fileData;
  const [updateAsset, { loading: isUpdatingStar }] = useUpdateAssetMutation();

  const handleToggleStar = async () => {
    try {
      await updateAsset({
        variables: {
          id,
          input: { isStarred: !isStarred }
        }
      });
    } catch {
      toast.error('');
    }
  };

  const handleStarClick = (e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    handleToggleStar();
  };

  const fileTypeIcon = FILE_TYPES[fileType] || FILE_TYPES.image;

  const coverImage = (
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

  const items = FileCardMenuItems({
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
        coverImage={coverImage}
        title={title}
        info={info}
        spaceBetweenContent={400}
        interactive={true}
        items={items}
      />
    </Box>
  );
};

export default FileCard;
