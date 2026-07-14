import { GroupMenuItems, WorkMenuItems } from './WorksTableMenusItems';
import { MenuItemConfig } from '~/shared/components/dropdown-menu/ActionMenu';

describe('WorksTableMenusItems', () => {
  const triggerItemClicks = (menuItems: readonly MenuItemConfig[]) => {
    menuItems.forEach((item) => {
      if (typeof item.onClick === 'function') {
        item.onClick();
      }
    });
  };

  it('should build GroupMenuItems with unpublish action when isPublished is true', () => {
    const setHideModalOpen = jest.fn();
    const setPublicationModalOpen = jest.fn();

    const groups = GroupMenuItems({
      id: 'group-1',
      isPublished: true,
      setHideModalOpen,
      setPublicationModalOpen,
    });

    expect(groups).toHaveLength(2);

    expect(groups[0].items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 'edit-seo', href: '/creativity/group/group-1/seo' }),
        expect.objectContaining({ id: 'edit-content', href: '/creativity/group/group-1/content' }),
        expect.objectContaining({ id: 'share', href: '/creativity/group/group-1/share' }),
        expect.objectContaining({ id: 'isPublished', href: '/creativity/group/group-1/ungroup' }),
      ])
    );

    groups.forEach((group) => triggerItemClicks(group.items));

    expect(setHideModalOpen).toHaveBeenCalledWith(true);
    expect(setPublicationModalOpen).not.toHaveBeenCalled();
  });

  it('should build GroupMenuItems with publish action when isPublished is false', () => {
    const setHideModalOpen = jest.fn();
    const setPublicationModalOpen = jest.fn();

    const groups = GroupMenuItems({
      id: 'group-2',
      isPublished: false,
      setHideModalOpen,
      setPublicationModalOpen,
    });

    expect(groups[1].items[0].id).toBe('publish');

    groups.forEach((group) => triggerItemClicks(group.items));

    expect(setPublicationModalOpen).toHaveBeenCalledWith(true);
    expect(setHideModalOpen).not.toHaveBeenCalled();
  });

  it('should build WorkMenuItems with edit, share and delete actions', () => {
    const setDeleteModalOpen = jest.fn();

    const groups = WorkMenuItems({
      id: 'work-1',
      isPublished: true,
      setDeleteModalOpen,
    });

    expect(groups).toHaveLength(2);

    expect(groups[0].items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 'edit', href: '/creativity/work-1/edit' }),
        expect.objectContaining({ id: 'share', href: '/creativity/work-1/share' }),
      ])
    );

    expect(groups[1].items[0].id).toBe('delete');

    groups.forEach((group) => triggerItemClicks(group.items));

    expect(setDeleteModalOpen).toHaveBeenCalledWith(true);
  });
});