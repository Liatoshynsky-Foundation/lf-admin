import { Box, CircularProgress } from '@mui/material';
import { CircleCheckBig, EyeOff, Info } from 'lucide-react';
import Image from 'next/image';
import React from 'react';

import { ActionMenuGroups } from '../dropdown-menu/ActionMenu';
import { chipsColors, mainHexPalette as colors } from '~/shared/theme/colors';

export interface FileCardMenuProps {
  isStarred?: boolean;
  isStarLoading?: boolean;
  showMakePrimary?: boolean;
  isMainComposition?: boolean;
  onOpenDetails: () => void;
  onRename: () => void;
  onToggleStar: () => void;
  onDownload: () => void;
  onCopyLink: () => void;
  onMakePrimary?: () => void;
  onDelete: () => void;
}

const menuIconWrapper = (bgColor: string) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 24,
  height: 24,
  borderRadius: '50%',
  backgroundColor: bgColor,
  color: colors.adminBlue?.[50] || '#ffffff'
});

const FileCardMenuItems = ({
  isStarred = false,
  isStarLoading = false,
  showMakePrimary = false,
  isMainComposition = false,
  onOpenDetails,
  onRename,
  onToggleStar,
  onDownload,
  onCopyLink,
  onMakePrimary,
  onDelete
}: FileCardMenuProps): ActionMenuGroups => {
  const renderStarIcon = () => {
    if (isStarLoading) {
      return <CircularProgress size={20} color="inherit" />;
    }
    if (isStarred) {
      return <Image src="/icons/star-slash.svg" width={20} height={20} alt="Unstar" />;
    }
    return <Image src="/icons/small-star.svg" width={20} height={20} alt="Star" />;
  };

  const primaryActionName = isMainComposition ? 'Скасувати статус головної' : 'Зробити головною композицією';
  const primaryActionIcon = isMainComposition ? (
    <Box sx={menuIconWrapper(chipsColors.hidden)}>
      <EyeOff size={16} strokeWidth={1.5} />
    </Box>
  ) : (
    <Box sx={menuIconWrapper(chipsColors.published)}>
      <CircleCheckBig size={16} strokeWidth={1.5} />
    </Box>
  );

  return [
    {
      items: [
        ...(showMakePrimary && onMakePrimary
          ? [
            {
              id: 'make-primary',
              text: {
                name: primaryActionName,
                icon: primaryActionIcon
              },
              onClick: onMakePrimary
            }
          ]
          : []),
        {
          id: 'details',
          text: {
            name: 'Відкрити деталі',
            icon: <Info size={24} strokeWidth={1.5} />
          },
          onClick: onOpenDetails
        },
        {
          id: 'rename',
          text: {
            name: 'Перейменувати',
            icon: <Image src="/icons/pen-line.svg" width={18} height={17} alt="Rename" />
          },
          onClick: onRename
        },
        {
          id: 'toggle-star',
          text: {
            name: isStarred ? 'Забрати з обраних' : 'Додати в обрані',
            icon: renderStarIcon()
          },
          onClick: () => {
            if (isStarLoading) return;
            onToggleStar();
          }
        },
        {
          id: 'download',
          text: {
            name: 'Завантажити',
            icon: <Image src="/icons/download.svg" width={18} height={18} alt="Download" />
          },
          onClick: onDownload
        },
        {
          id: 'copy-link',
          text: {
            name: 'Копіювати посилання',
            icon: <Image src="/icons/link.svg" width={18} height={18} alt="Copy link" />
          },
          onClick: onCopyLink
        },
        {
          id: 'delete',
          text: {
            name: 'Видалити',
            icon: <Image src="/icons/empty-trash.svg" width={18} height={20} alt="Delete" />
          },
          onClick: onDelete
        }
      ]
    }
  ];
};

export default FileCardMenuItems;
