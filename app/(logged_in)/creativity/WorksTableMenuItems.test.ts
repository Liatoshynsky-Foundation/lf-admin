import { GroupMenuItems, WorkMenuItems } from './WorksTableMenuItems';
import { WORKS_BASE_PATH } from '~/constants/creativity';

type MenuItem = {
  id: string;
  text: { name: string };
  href?: string;
  onClick?: () => void;
};

describe('WorksTableMenusItems', () => {
  const triggerItemClicks = (menuItems: readonly MenuItem[]) => {
    menuItems.forEach((item) => {
      if (typeof item.onClick === 'function') {
        item.onClick();
      }
    });
  };

  const mockOnPublish = jest.fn<(id: string) => void, [string]>();
  const mockOnUnpublish = jest.fn<(id: string) => void, [string]>();
  const mockOnUngroup = jest.fn<(id: string) => void, [string]>();
  const mockOnShare = jest.fn<(id: string) => void, [string]>();
  const mockOnEdit = jest.fn<(id: string) => void, [string]>();
  const mockOnDelete = jest.fn<(id: string) => void, [string]>();

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
      onShare: mockOnShare,
    });

    const firstGroupItems = groups[0].items as MenuItem[];
    expect(firstGroupItems).toEqual([
      { id: 'edit-seo', text: { name: 'Редагувати групу (SEO)' }, href: `${WORKS_BASE_PATH}/group/group-1/edit` },
      { id: 'edit-content', text: { name: 'Редагувати контент' }, href: `${WORKS_BASE_PATH}/group/group-1/content` },
      { id: 'share', text: { name: 'Поширити' }, onClick: expect.any(Function) },
      { id: 'ungroup', text: { name: 'Розгрупувати' }, onClick: expect.any(Function) },
    ]);

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
      onShare: mockOnShare,
    });

    const secondGroupItems = groups[1].items as MenuItem[];
    expect(secondGroupItems[0].id).toBe('unpublish');

    triggerItemClicks(secondGroupItems);
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
      onShare: mockOnShare,
    });

    const secondGroupItems = groups[1].items as MenuItem[];
    expect(secondGroupItems[0].id).toBe('publish');

    triggerItemClicks(secondGroupItems);
    expect(mockOnPublish).toHaveBeenCalledWith('group-2');
    expect(mockOnUnpublish).not.toHaveBeenCalled();
  });

  it('should build WorkMenuItems with edit, share and delete actions and trigger callbacks correctly', () => {
    const groups = WorkMenuItems({
      id: 'work-1',
      isPublished: true,
      onEdit: mockOnEdit,
      onShare: mockOnShare,
      onDelete: mockOnDelete,
    });

    expect(groups).toHaveLength(2);

    const firstGroupItems = groups[0].items as MenuItem[];
    const secondGroupItems = groups[1].items as MenuItem[];

    expect(firstGroupItems).toEqual([
      { id: 'edit', text: { name: 'Редагувати композицію' }, onClick: expect.any(Function) },
      { id: 'share', text: { name: 'Поширити' }, onClick: expect.any(Function) },
    ]);

    expect(secondGroupItems[0]).toEqual({
      id: 'delete',
      text: { name: 'Видалити' },
      onClick: expect.any(Function),
    });

    triggerItemClicks(firstGroupItems);
    triggerItemClicks(secondGroupItems);

    expect(mockOnEdit).toHaveBeenCalledWith('work-1');
    expect(mockOnShare).toHaveBeenCalledWith('work-1');
    expect(mockOnDelete).toHaveBeenCalledWith('work-1');
  });
});