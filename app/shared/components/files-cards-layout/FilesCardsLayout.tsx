import { Box } from '@mui/material';

import FileCard, { type FileType } from '../file-card';
import MinimizedFileCard from '../minimized-file-card/MinimizedFileCard';
import { styles } from './FilesCardsLayout.styles';

export type FilesCardsLayoutView = 'grid' | 'list';

export type FilesCardsLayoutItem = {
  id: string;
  type: FileType;
  name: string;
  dateAdded: string;
  isStarred?: boolean;
  usageLinks?: number;
  imageSrc?: string;
};

type FilesCardsLayoutProps = Readonly<{
  view: FilesCardsLayoutView;
  items: FilesCardsLayoutItem[];
  onItemClick?: (item: FilesCardsLayoutItem) => void;
}>;

const minimizedTypeMap: Record<FileType, 'img' | 'audio' | 'pdf'> = {
  image: 'img',
  audio: 'audio',
  pdf: 'pdf'
};

export function FilesCardsLayout({ view, items, onItemClick }: FilesCardsLayoutProps) {
  if (view === 'list') {
    return (
      <Box sx={styles.root} data-testid="FilesCardsLayout-list">
        <Box sx={styles.list}>
          {items.map((item) => (
            <Box key={item.id} sx={styles.listItem}>
              <MinimizedFileCard
                fileType={minimizedTypeMap[item.type]}
                starred={!!item.isStarred}
                linked={!!item.usageLinks && item.usageLinks > 0}
                name={item.name}
                date={item.dateAdded}
                onClick={() => onItemClick?.(item)}
              />
            </Box>
          ))}
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={styles.root} data-testid="FilesCardsLayout-grid">
      <Box sx={styles.grid}>
        {items.map((item) => (
          <Box key={item.id} sx={styles.gridItem}>
            <FileCard
              fileType={item.type}
              fileData={{
                name: item.name,
                dateAdded: item.dateAdded,
                isStarred: item.isStarred,
                usageLinks: item.usageLinks,
                imageSrc: item.imageSrc
              }}
              onClick={() => onItemClick?.(item)}
            />
          </Box>
        ))}
      </Box>
    </Box>
  );
}
