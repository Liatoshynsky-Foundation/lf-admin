import { GroupMenuItems, WorkMenuItems } from './WorksTableMenuItems';
import { WORKS_BASE_PATH } from '~/constants/creativity';
import { MenuItemConfig } from '~/shared/components/dropdown-menu/ActionMenu';

describe('WorksTableMenusItems', () => {
  const triggerItemClicks = (menuItems: readonly MenuItemConfig[]) => {
    menuItems.forEach((item) => {
      if (typeof item.onClick === 'function') {
        item.onClick();
      }
    });
  };

  const mockOnPublish = jest.fn();
  const mockOnUnpublish = jest.fn();
  const mockOnUngroup = jest.fn();
  const mockOnShare = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should build GroupMenuItems with correct static menu items and handle ungroup/share clicks', () => {
    const groups = GroupMenuItems({
      id: 'group-1',
      isPublished: true,
      onPublish: mockOnPublish,
      onUnpublish: mockOnUnpublish,
      onUngroup: mockOnUngroup,
      onShare: mockOnShare
    });

    const firstGroupItems = groups[0].items;
    expect(firstGroupItems).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 'edit-seo', href: `${WORKS_BASE_PATH}/group/group-1/edit` }),
        expect.objectContaining({ id: 'edit-content', href: `${WORKS_BASE_PATH}/group/group-1/content` }),
        expect.objectContaining({ id: 'share' }),
        expect.objectContaining({ id: 'ungroup' })
      ])
    );

    triggerItemClicks(firstGroupItems);
    expect(mockOnShare).toHaveBeenCalledWith('group-1');
    expect(mockOnUngroup).toHaveBeenCalledWith('group-1');
  });

  it('should build GroupMenuItems with unpublish action when isPublished is true', () => {
    const groups = GroupMenuItems({
      id: 'group-1',
      isPublished: true,
      onPublish: mockOnPublish,
      onUnpublish: mockOnUnpublish,
      onUngroup: mockOnUngroup,
      onShare: mockOnShare
    });

    expect(groups[1].items[0].id).toBe('unpublish');

    triggerItemClicks(groups[1].items);
    expect(mockOnUnpublish).toHaveBeenCalledWith('group-1');
    expect(mockOnPublish).not.toHaveBeenCalled();
  });

  it('should build GroupMenuItems with publish action when isPublished is false', () => {
    const groups = GroupMenuItems({
      id: 'group-2',
      isPublished: false,
      onPublish: mockOnPublish,
      onUnpublish: mockOnUnpublish,
      onUngroup: mockOnUngroup,
      onShare: mockOnShare
    });

    expect(groups[1].items[0].id).toBe('publish');

    triggerItemClicks(groups[1].items);
    expect(mockOnPublish).toHaveBeenCalledWith('group-2');
    expect(mockOnUnpublish).not.toHaveBeenCalled();
  });

  it('should build WorkMenuItems with edit, share and delete actions', () => {
    const setDeleteModalOpen = jest.fn();

    const groups = WorkMenuItems({
      id: 'work-1',
      isPublished: true,
      setDeleteModalOpen
    });

    expect(groups).toHaveLength(2);

    expect(groups[0].items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 'edit', href: `${WORKS_BASE_PATH}/work-1/edit` }),
        expect.objectContaining({ id: 'share', href: `${WORKS_BASE_PATH}/work-1/share` })
      ])
    );

    expect(groups[1].items[0].id).toBe('delete');

    groups.forEach((group) => triggerItemClicks(group.items));

    expect(setDeleteModalOpen).toHaveBeenCalledWith(true);
  });
});
