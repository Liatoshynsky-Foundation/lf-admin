import { Box, CircularProgress } from '@mui/material';
import { isValidElement, ReactElement } from 'react';

import FileCardMenuItems, { FileCardMenuProps } from './FileCardMenuItems';

jest.mock('@mui/material', () => ({
  CircularProgress: () => <Box data-testid="loading-spinner" />
}));

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ alt }: { alt: string }) => <Box data-testid="image" aria-label={alt} />
}));

jest.mock('lucide-react', () => ({
  Info: () => <Box data-testid="info-icon" />
}));

const asElement = (node: React.ReactNode): ReactElement<Record<string, unknown>> => {
  if (!isValidElement(node)) {
    throw new Error('Expected a valid React element');
  }
  return node as ReactElement<Record<string, unknown>>;
};

describe('FileCardMenuItems', () => {
  const mockProps: FileCardMenuProps = {
    isStarred: false,
    isStarLoading: false,
    onOpenDetails: jest.fn(),
    onRename: jest.fn(),
    onToggleStar: jest.fn(),
    onDownload: jest.fn(),
    onDelete: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns a single group containing 5 items', () => {
    const groups = FileCardMenuItems(mockProps);

    expect(groups).toHaveLength(1);
    expect(groups[0].items).toHaveLength(5);
  });

  it('returns items with the correct ids and labels in order', () => {
    const [{ items }] = FileCardMenuItems(mockProps);

    expect(items.map((item) => item.id)).toEqual(['details', 'rename', 'toggle-star', 'download', 'delete']);
    expect(items[0].text.name).toBe('Відкрити деталі');
    expect(items[1].text.name).toBe('Перейменувати');
    expect(items[2].text.name).toBe('Додати в обрані');
    expect(items[3].text.name).toBe('Завантажити');
    expect(items[4].text.name).toBe('Видалити');
  });

  it('renders the default (not starred, not loading) star icon', () => {
    const [{ items }] = FileCardMenuItems(mockProps);
    const starItem = items.find((item) => item.id === 'toggle-star');

    expect(starItem?.text.name).toBe('Додати в обрані');
    expect(asElement(starItem?.text.icon).props.alt).toBe('Star');
  });

  it('changes label and icon when isStarred is true', () => {
    const [{ items }] = FileCardMenuItems({ ...mockProps, isStarred: true });
    const starItem = items.find((item) => item.id === 'toggle-star');

    expect(starItem?.text.name).toBe('Забрати з обраних');
    expect(asElement(starItem?.text.icon).props.alt).toBe('Unstar');
  });

  it('shows CircularProgress when isStarLoading is true (not starred)', () => {
    const [{ items }] = FileCardMenuItems({ ...mockProps, isStarLoading: true });
    const starItem = items.find((item) => item.id === 'toggle-star');
    const icon = asElement(starItem?.text.icon);

    expect(starItem?.text.name).toBe('Додати в обрані');
    expect(icon.type).toBe(CircularProgress);
    expect(icon.props).toEqual({ size: 20, color: 'inherit' });
  });

  it('shows CircularProgress and starred label when isStarred and isStarLoading are both true', () => {
    const [{ items }] = FileCardMenuItems({ ...mockProps, isStarred: true, isStarLoading: true });
    const starItem = items.find((item) => item.id === 'toggle-star');
    const icon = asElement(starItem?.text.icon);

    expect(starItem?.text.name).toBe('Забрати з обраних');
    expect(icon.type).toBe(CircularProgress);
  });

  it('renders rename, download and delete icons with expected alt text', () => {
    const [{ items }] = FileCardMenuItems(mockProps);

    const rename = items.find((item) => item.id === 'rename');
    const download = items.find((item) => item.id === 'download');
    const del = items.find((item) => item.id === 'delete');

    expect(asElement(rename?.text.icon).props.alt).toBe('Rename');
    expect(asElement(download?.text.icon).props.alt).toBe('Download');
    expect(asElement(del?.text.icon).props.alt).toBe('Delete');
  });

  it('calls onOpenDetails when the details item is clicked', () => {
    const [{ items }] = FileCardMenuItems(mockProps);
    items.find((item) => item.id === 'details')?.onClick?.();

    expect(mockProps.onOpenDetails).toHaveBeenCalledTimes(1);
  });

  it('calls onRename when the rename item is clicked', () => {
    const [{ items }] = FileCardMenuItems(mockProps);
    items.find((item) => item.id === 'rename')?.onClick?.();

    expect(mockProps.onRename).toHaveBeenCalledTimes(1);
  });

  it('calls onDownload when the download item is clicked', () => {
    const [{ items }] = FileCardMenuItems(mockProps);
    items.find((item) => item.id === 'download')?.onClick?.();

    expect(mockProps.onDownload).toHaveBeenCalledTimes(1);
  });

  it('calls onDelete when the delete item is clicked', () => {
    const [{ items }] = FileCardMenuItems(mockProps);
    items.find((item) => item.id === 'delete')?.onClick?.();

    expect(mockProps.onDelete).toHaveBeenCalledTimes(1);
  });

  it('calls onToggleStar when toggle-star is clicked and not loading', () => {
    const onToggleStar = jest.fn();
    const [{ items }] = FileCardMenuItems({ ...mockProps, onToggleStar });

    items.find((item) => item.id === 'toggle-star')?.onClick?.();

    expect(onToggleStar).toHaveBeenCalledTimes(1);
  });

  it('does not call onToggleStar when toggle-star is clicked while loading', () => {
    const onToggleStar = jest.fn();
    const [{ items }] = FileCardMenuItems({ ...mockProps, isStarLoading: true, onToggleStar });

    items.find((item) => item.id === 'toggle-star')?.onClick?.();

    expect(onToggleStar).not.toHaveBeenCalled();
  });

  it('defaults isStarred and isStarLoading to false when omitted', () => {
    const propsWithoutDefaults: Omit<FileCardMenuProps, 'isStarred' | 'isStarLoading'> = {
      onOpenDetails: jest.fn(),
      onRename: jest.fn(),
      onToggleStar: jest.fn(),
      onDownload: jest.fn(),
      onDelete: jest.fn()
    };

    const [{ items }] = FileCardMenuItems(propsWithoutDefaults as FileCardMenuProps);
    const starItem = items.find((item) => item.id === 'toggle-star');

    expect(starItem?.text.name).toBe('Додати в обрані');
    expect(asElement(starItem?.text.icon).props.alt).toBe('Star');
  });
});
