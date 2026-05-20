'use client';
import { Box, IconButton, Paper, Stack, Typography } from '@mui/material';
import Image from 'next/image';
import { MouseEvent, useEffect,useState } from 'react';

import DropdownMenu from '../dropdown-menu/DropdownMenu';
import { FileMenuActions } from '../dropdown-menu/FileMenuActions';
import LinkIcon from '~/public/icons/link.svg';
import MenuIcon from '~/public/icons/menu.svg';
import StarIcon from '~/public/icons/star-1.svg';
import { styles } from '~/shared/components/minimized-file-card/MinimizedFileCard.styles';
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
  onAction?: (action: 'rename' | 'delete' | 'download', fileId: string) => void;
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
  onAction,
  onMenuClick
}: MinimizedFileCardProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [updateAsset, { loading: isUpdatingStar }] = useUpdateAssetMutation();

  useEffect(() => {
    const handleResizeOrScroll = () => {
      if (anchorEl) {
        setAnchorEl(null);
      }
    };

    window.addEventListener('resize', handleResizeOrScroll);
    window.addEventListener('scroll', handleResizeOrScroll, true);

    return () => {
      window.removeEventListener('resize', handleResizeOrScroll);
      window.removeEventListener('scroll', handleResizeOrScroll, true);
    };
  }, [anchorEl]);

  const handleMenuClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
    onMenuClick?.(e);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleToggleStar = async () => {
    try {
      await updateAsset({
        variables: {
          id,
          input: { isStarred: !starred }
        }
      });
    } catch {}
  };

  const handleStarClick = (e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    handleToggleStar();
  };

  const isMenuOpen = Boolean(anchorEl);

  return (
    <Paper variant="outlined" sx={styles.container} onClick={onClick}>
      <Stack direction="row" sx={styles.content} alignItems="center" flexGrow={1}>
        <Image
          src={`/icons/${FILE_TYPES[fileType]}.svg`}
          width={ICON_SIZE}
          height={ICON_SIZE}
          alt={`${fileType} file icon`}
        />

        <Typography variant="subtitle1" sx={styles.fileName} noWrap>
          {name}
        </Typography>

        <Stack direction="row" gap={'10px'} alignItems="center">
          {starred && (
            <Box
              aria-label="Starred file"
              onClick={handleStarClick}
              sx={{
                ...styles.iconWrapper,
                cursor: isUpdatingStar ? 'wait' : 'pointer'
              }}
            >
              <StarIcon width={ICON_SIZE} height={ICON_SIZE} />
            </Box>
          )}
          {linked && (
            <Box aria-label="File is linked to other pages" sx={{ color: 'blue.700', display: 'flex' }}>
              <LinkIcon width={ICON_SIZE} height={ICON_SIZE} aria-hidden/>
            </Box>
          )}
        </Stack>
      </Stack>

      <Stack direction="row" sx={styles.content} alignItems="center">
        <Typography variant="textMd" sx={styles.date}>
          {date}
        </Typography>

        <IconButton
          sx={[
            styles.menuButton, 
            isMenuOpen && styles.menuButtonActive
          ]}
          size="small"
          aria-label="Open file menu"
          onClick={handleMenuClick}
        >
          <MenuIcon width={ICON_SIZE} height={ICON_SIZE} aria-hidden />
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
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            sx: {
              mt: '-1px'
            }
          }
        }}
        menuList={
          <FileMenuActions
            isStarred={starred}
            isStarLoading={isUpdatingStar}
            onCloseMenu={handleCloseMenu}
            onOpenDetails={() => onClick?.()}
            onRename={() => onAction?.('rename', id)}
            onDelete={() => onAction?.('delete', id)}
            onDownload={() => onAction?.('download', id)}
            onToggleStar={handleToggleStar}
          />
        }
      />
    </Paper>
  );
};
export default MinimizedFileCard;
