import { EditorLanguage, LANGUAGE_OPTIONS  } from '~/constants/publications';
import { ActionMenuGroups } from '~/shared/components/dropdown-menu/ActionMenu';

export enum MenuActionIds {
  PUBLISH = 'PUBLISH',
  PUBLISH_AND_EXIT = 'PUBLISH_AND_EXIT',
  DELETE = 'DELETE'
}

interface NavigationMenuProps {
  onLanguageChange: (locale: EditorLanguage) => void;
}

type PublishMenuProps = Readonly<{
  onAction: (action: string) => void;
}>;

export const NavigationMenuItems = ({
  onLanguageChange,
}: NavigationMenuProps): ActionMenuGroups => [
  {
    title: 'Мовні версії',
    items: LANGUAGE_OPTIONS.map(({ locale, key, label }) => {
	  return {
        id: key,
        text: {
		  name: label,
        },
        onClick: () => onLanguageChange(locale),
	  };
    }),
  }
];

export const PublishMenuItems = ({ onAction }: PublishMenuProps): ActionMenuGroups => [
  {
    items: [
	  { id: MenuActionIds.PUBLISH, text: { name: 'Опублікувати' }, onClick: () => onAction(MenuActionIds.PUBLISH)  },
	  { id: MenuActionIds.PUBLISH_AND_EXIT, text: { name: 'Опублікувати і вийти' },onClick: () => onAction(MenuActionIds.PUBLISH_AND_EXIT)  },
    ],
  },
  {
    items: [
	  { id: MenuActionIds.DELETE, text: { name: 'Видалити' }, onClick: () => onAction(MenuActionIds.DELETE) },
    ],
  },
];
