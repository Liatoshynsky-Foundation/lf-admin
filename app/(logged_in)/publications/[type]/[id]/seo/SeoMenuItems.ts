import { MenuActionId } from '~/constants/publications';
import { ActionMenuGroups } from '~/shared/components/dropdown-menu/ActionMenu';

interface PublishMenuProps {
  handlePublishExitClick: () => void;
  handleUnpublish: () => void;
}

interface NavigationMenuProps {
  handleEditClick: () => void;
}

export const NavigationMenuItems = ({
  handleEditClick,
}: NavigationMenuProps): ActionMenuGroups => [
  {
    items: [
	  {
        id: 'edit-content',
        text: { name: 'Редагування контенту' },
        onClick: handleEditClick,
	  },
    ],
  },
];

export const PublishMenuItems = ({
  handlePublishExitClick,
  handleUnpublish,
}: PublishMenuProps): ActionMenuGroups => [
  {
    items: [
	  {
        id: MenuActionId.PUBLICATE_AND_EXIT,
        text: { name: 'Опублікувати і вийти' },
        onClick: () => handlePublishExitClick(),
	  },
	  {
        id: MenuActionId.CANCEL_PUBLICATION,
        text: { name: 'Скасувати публікацію' },
        onClick: () => handleUnpublish(),
	  }
    ],
  },
];

