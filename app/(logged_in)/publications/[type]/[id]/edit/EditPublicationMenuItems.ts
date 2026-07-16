import {EditorLanguage, LANGUAGE_OPTIONS , LocalizedEditorState, MenuActionId } from '~/constants/publications';
import { SerializedContent } from '~/shared/components/content-editor/types';
import { ActionMenuGroups } from '~/shared/components/dropdown-menu/ActionMenu';

interface NavigationMenuProps {
  editedContent: LocalizedEditorState | null;
  isContentEmpty: (blocks: SerializedContent['blocks'] | undefined) => boolean;
  onLanguageChange: (locale: EditorLanguage) => void;
  onSeoClick: () => void;
}

interface PublishMenuProps {
  MenuActionId: typeof MenuActionId;
  setDeleteModalOpen: (open: boolean) => void;
  handlePublishActionClick: (id: MenuActionId) => void;
}

export const NavigationMenuItems = ({
  editedContent,
  isContentEmpty,
  onLanguageChange,
  onSeoClick,
}: NavigationMenuProps): ActionMenuGroups => [
  {
    title: 'Мовні версії',
    items: LANGUAGE_OPTIONS.map(({ locale, key, label }) => {
      const blocks = editedContent?.[key]?.content?.blocks;
      const isDraft = !isContentEmpty(blocks);

      return {
        id: key,
        text: {
          name: isDraft ? `${label} (чернетка)` : label,
        },
        onClick: () => onLanguageChange(locale),
      };
    }),
  },
  {
    items: [
      {
        id: 'seo-settings',
        text: { name: 'SEO налаштування' },
        onClick: onSeoClick,
      },
    ],
  },
];

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
      },
      {
        id: MenuActionId.DELETE,
        text: { name: 'Видалити' },
        onClick: () => setDeleteModalOpen(true),
      },
    ],
  },
];