import FileCardMenuItems from './FileCardMenuItems';

jest.mock('@mui/material', () => ({
  CircularProgress: () => <div data-testid="loading-spinner" />
}));

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ alt }: { alt: string }) => <div data-testid="image" aria-label={alt} />
}));

jest.mock('lucide-react', () => ({
  Info: () => <div data-testid="info-icon" />
}));

describe('FileCardMenuItems', () => {
  const mockProps = {
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

  it('returns the correct structure with 5 menu items', () => {
    const items = FileCardMenuItems(mockProps);
    expect(items).toHaveLength(5);
    expect(items[0].text.name).toBe('Відкрити деталі');
  });

  it('changes star label and icon when isStarred is true', () => {
    const items = FileCardMenuItems({ ...mockProps, isStarred: true });

    const starItem = items.find((i) => i.text.name === 'Забрати з обраних');
    expect(starItem).toBeDefined();
  });

  it('shows CircularProgress when isStarLoading is true', () => {
    const items = FileCardMenuItems({ ...mockProps, isStarLoading: true });

    const starItem = items.find((i) => i.text.name === 'Додати в обрані');
    expect(starItem?.text.icon.type.name).toBe('CircularProgress');
  });

  it('triggers the correct callback when onClick is executed', () => {
    const items = FileCardMenuItems(mockProps);

    items[0].onClick();
    expect(mockProps.onOpenDetails).toHaveBeenCalledTimes(1);

    items[3].onClick();
    expect(mockProps.onDownload).toHaveBeenCalledTimes(1);
  });

  it('does not trigger onToggleStar if isStarLoading is true', () => {
    const onToggleStar = jest.fn();
    const items = FileCardMenuItems({
      ...mockProps,
      isStarLoading: true,
      onToggleStar
    });

    const starItem = items.find((i) => i.text.name === 'Додати в обрані');
    starItem?.onClick();

    expect(onToggleStar).not.toHaveBeenCalled();
  });
});
