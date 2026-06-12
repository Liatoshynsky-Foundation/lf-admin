import { CircularProgress } from '@mui/material';
import { Info } from 'lucide-react';
import Image from 'next/image';
import React from 'react';

export interface FileCardMenuProps {
  isStarred?: boolean;
  isStarLoading?: boolean;
  onOpenDetails: () => void;
  onRename: () => void;
  onToggleStar: () => void;
  onDownload: () => void;
  onDelete: () => void;
}

const FileCardMenuItems = ({
  isStarred = false,
  isStarLoading = false,
  onOpenDetails,
  onRename,
  onToggleStar,
  onDownload,
  onDelete
}: FileCardMenuProps) => {
  const renderStarIcon = () => {
    if (isStarLoading) {
      return <CircularProgress size={20} color="inherit" />;
    }
    if (isStarred) {
      return <Image src="/icons/star-slash.svg" width={20} height={20} alt="Unstar" />;
    }
    return <Image src="/icons/small-star.svg" width={20} height={20} alt="Star" />;
  };

  return [
    {
      text: {
        name: 'Відкрити деталі',
        icon: <Info size={24} strokeWidth={1.5} />
      },
      onClick: onOpenDetails
    },
    {
      text: {
        name: 'Перейменувати',
        icon: <Image src="/icons/pen-line.svg" width={18} height={17} alt="Rename" />
      },
      onClick: onRename
    },
    {
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
      text: {
        name: 'Завантажити',
        icon: <Image src="/icons/download.svg" width={18} height={18} alt="Download" />
      },
      onClick: onDownload
    },
    {
      text: {
        name: 'Видалити',
        icon: <Image src="/icons/empty-trash.svg" width={18} height={20} alt="Delete" />
      },
      onClick: onDelete
    }
  ];
};

export default FileCardMenuItems;
