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
  selectedItemId?: string | null;
  gridColumns?: {
    xsCols?: number;
    smCols?: number;
    mdCols?: number;
    xlCols?: number;
  };
  setItemRef?: (itemId: string, node: HTMLDivElement | null) => void;
  onItemClick?: (item: FilesCardsLayoutItem) => void;
  onItemAction?: (action: 'rename' | 'delete' | 'download', item: FilesCardsLayoutItem) => void;
  onItemToggleStar?: (item: FilesCardsLayoutItem, next: boolean) => Promise<void> | void;
  isFileInfoSidebarOpen?: boolean;
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

export function FilesCardsLayout({
  view,
  items,
  selectedItemId,
  gridColumns,
  setItemRef,
  onItemClick,
  onItemAction,
  onItemToggleStar,
  isFileInfoSidebarOpen
}: FilesCardsLayoutProps) {
  if (view === 'list') {
    return (
      <Box sx={styles.root} data-testid="FilesCardsLayout-list">
        <Box sx={styles.list}>
          {items.map((item) => (
            <Box
              key={item.id}
              ref={(node: HTMLDivElement | null) => {
                setItemRef?.(item.id, node);
              }}
              sx={styles.listItem}
            >
              <MinimizedFileCard
                id={item.id}
                fileType={minimizedTypeMap[item.type]}
                starred={!!item.isStarred}
                linked={!!item.usageLinks && item.usageLinks > 0}
                name={item.name}
                date={item.dateAdded}
                isSelected={item.id === selectedItemId}
                onClick={() => onItemClick?.(item)}
                onAction={(action) => onItemAction?.(action, item)}
                onToggleStar={(_, next) => onItemToggleStar?.(item, next)}
              />
            </Box>
          ))}
        </Box>
      </Box>
    );
  }

  return (
    <CardsGrid columns={gridColumns} dataTestId="FilesCardsLayout-grid">
      {items.map((item) => (
        <Box
          key={item.id}
          ref={(node: HTMLDivElement | null) => {
            setItemRef?.(item.id, node);
          }}
          sx={styles.gridItem}
        >
          <FileCard
            fileType={item.type}
            fileData={{
              id: item.id,
              name: item.name,
              dateAdded: item.dateAdded,
              isStarred: item.isStarred,
              usageLinks: item.usageLinks,
              imageSrc: item.imageSrc
            }}
            isSelected={item.id === selectedItemId}
            onClick={() => onItemClick?.(item)}
            onAction={(action) => onItemAction?.(action, item)}
            onToggleStar={(_, next) => onItemToggleStar?.(item, next)}
            isFileInfoSidebarOpen={isFileInfoSidebarOpen}
          />
        </Box>
      ))}
    </CardsGrid>
  );
}
