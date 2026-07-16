import {  MenuActionId } from '~/constants/publications';
import { ActionMenuGroups } from '~/shared/components/dropdown-menu/ActionMenu';

interface PublishMenuProps {
  MenuActionId: typeof MenuActionId;
  setDeleteModalOpen: (open: boolean) => void;
  handlePublishActionClick: (id: MenuActionId) => void;
}
export const PublishMenuItems = ({
  MenuActionId,
  setDeleteModalOpen,
  handlePublishActionClick,
}: PublishMenuProps): ActionMenuGroups => [
  {
    items: [
      {
        id: MenuActionId.PUBLICATE_AND_EXIT,
        text: { name: 'Опублікувати і вийти' },
        onClick: () => handlePublishActionClick(MenuActionId.PUBLICATE_AND_EXIT),
      },
      {
        id: MenuActionId.CANCEL_PUBLICATION,
        text: { name: 'Скасувати публікацію' },
        onClick: () => handlePublishActionClick(MenuActionId.CANCEL_PUBLICATION),
      }
    ],
  },
  {
    items: [
      {
        id: MenuActionId.DELETE,
        text: { name: 'Видалити' },
        onClick: () => setDeleteModalOpen(true),
      },
    ],
  },
];