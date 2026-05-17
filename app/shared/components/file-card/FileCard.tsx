'use client';
import { Box, IconButton, Paper, Stack, Typography } from '@mui/material';
import Image from 'next/image';
import { MouseEvent,useState } from 'react';
import toast from 'react-hot-toast';

import DropdownMenu from '../dropdown-menu/DropdownMenu';
import { FileMenuActions } from '../dropdown-menu/FileMenuActions';
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
  onAction?: (action: 'rename' | 'delete' | 'download', fileId: string) => void;
}

const FileCard = ({ fileType, fileData, onClick, onAction }: FileCardProps) => {
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const [menuDirection, setMenuDirection] = useState<'left' | 'right'>('right');

  const { id, name, dateAdded, isStarred = false, usageLinks, imageSrc } = fileData;
  const [updateAsset, { loading: isUpdatingStar }] = useUpdateAssetMutation();

  const handleMenuClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);

    const rect = e.currentTarget.getBoundingClientRect();
    const spaceOnRight = window.innerWidth - rect.right;

    if (spaceOnRight < 400) {
      setMenuDirection('left');
    } else {
      setMenuDirection('right');
    }
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

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
  const isMenuOpen = Boolean(anchorEl);

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
          <Typography variant="customMedium16" noWrap>
            {name}
          </Typography>
        </Stack>

        <IconButton
          sx={{
            backgroundColor: isMenuOpen ? 'rgba(0, 0, 0, 0.08)' : 'transparent',
            '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.08)' }
          }}
          size="small"
          aria-label="Open file menu"
          onClick={handleMenuClick}
        >
          <Image src="/icons/menu.svg" width={ICON_SIZE_2} height={32} alt="Menu icon" aria-hidden />
        </IconButton>
      </Stack>

      <DropdownMenu
        disableScrollLock
        transitionDuration={0}
        disableAutoFocus
        disableEnforceFocus
        disableRestoreFocus
        anchorEl={anchorEl}
        open={isMenuOpen}
        onClose={handleCloseMenu}
        onClick={(e) => e.stopPropagation()}
        anchorOrigin={{
          vertical: 'top',
          horizontal: menuDirection === 'left' ? 'left' : 'right'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: menuDirection === 'left' ? 'right' : 'left'
        }}
        menuList={
          <FileMenuActions
            isStarred={isStarred}
            onCloseMenu={handleCloseMenu}
            isStarLoading={isUpdatingStar}
            onOpenDetails={() => onClick?.()}
            onRename={() => onAction?.('rename', id)}
            onDelete={() => onAction?.('delete', id)}
            onDownload={() => onAction?.('download', id)}
            onToggleStar={handleToggleStar}
          />
        }
      />

      <Stack sx={styles.metadataSection}>
        <Typography variant="customItalic14" color="text.secondary">
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
