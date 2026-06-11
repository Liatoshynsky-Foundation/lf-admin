import { Box } from '@mui/material';

import CardsGrid from '../cards-grid/CardsGrid';
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
  onItemAction?: (action: 'rename' | 'delete' | 'download', item: FilesCardsLayoutItem) => void;
}>;

const minimizedTypeMap: Record<FileType, 'img' | 'audio' | 'pdf' | 'doc' | 'xls' | 'video-file' | 'archive'> = {
  image: 'img',
  audio: 'audio',
  pdf: 'pdf',
  document: 'doc',
  spreadsheet: 'xls',
  video: 'video-file',
  archive: 'archive'
};

export function FilesCardsLayout({ view, items, onItemClick, onItemAction }: FilesCardsLayoutProps) {
  if (view === 'list') {
    return (
      <Box sx={styles.root} data-testid="FilesCardsLayout-list">
        <Box sx={styles.list}>
          {items.map((item) => (
            <Box key={item.id} sx={styles.listItem}>
              <MinimizedFileCard
                id={item.id}
                fileType={minimizedTypeMap[item.type]}
                starred={!!item.isStarred}
                linked={!!item.usageLinks && item.usageLinks > 0}
                name={item.name}
                date={item.dateAdded}
                onClick={() => onItemClick?.(item)}
                onAction={(action) => onItemAction?.(action, item)}
              />
            </Box>
          ))}
        </Box>
      </Box>
    );
  }

  return (
    <CardsGrid dataTestId="FilesCardsLayout-grid">
      {items.map((item) => (
        <FileCard
          key={item.id}
          fileType={item.type}
          fileData={{
            id: item.id,
            name: item.name,
            dateAdded: item.dateAdded,
            isStarred: item.isStarred,
            usageLinks: item.usageLinks,
            imageSrc: item.imageSrc
          }}
          onClick={() => onItemClick?.(item)}
          onAction={(action) => onItemAction?.(action, item)}
        />
      ))}
    </CardsGrid>
  );
}
