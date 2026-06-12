import ContentCardMenuItems from './ContentCardMenuItems';

describe('ContentCardMenuItems', () => {
  const mockProps = {
    id: '123',
    type: 'news' as const,
    setDeleteModalOpen: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns the correct structure with 2 menu items', () => {
    const items = ContentCardMenuItems(mockProps);

    expect(items).toHaveLength(2);
    expect(items[0].text.name).toBe('SEO налаштування');
    expect(items[1].text.name).toBe('Видалити');
  });

  it('constructs the correct SEO href based on type and id', () => {
    const items = ContentCardMenuItems(mockProps);

    expect(items[0].href).toBe('/publications/news/123/seo');
  });

  it('triggers setDeleteModalOpen(true) when "Видалити" is clicked', () => {
    const items = ContentCardMenuItems(mockProps);

    const deleteItem = items.find((i) => i.text.name === 'Видалити');
    deleteItem?.onClick?.();

    expect(mockProps.setDeleteModalOpen).toHaveBeenCalledTimes(1);
    expect(mockProps.setDeleteModalOpen).toHaveBeenCalledWith(true);
  });

  it('generates correct link for different content types', () => {
    const items = ContentCardMenuItems({ ...mockProps, type: 'events' });

    expect(items[0].href).toBe('/publications/events/123/seo');
  });
});
