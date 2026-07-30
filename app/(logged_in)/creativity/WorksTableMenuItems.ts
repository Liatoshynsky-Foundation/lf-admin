import { WORKS_BASE_PATH } from '~/constants/creativity';
import { ActionMenuGroups } from '~/shared/components/dropdown-menu/ActionMenu';

interface GroupMenuProps {
  id: string;
  isPublished: boolean;
  onPublish: (id: string) => void;
  onUnpublish: (id: string) => void;
  onUngroup: (id: string) => void;
  onShare: (id: string) => void;
}

interface WorkMenuProps {
  id: string;
  isPublished: boolean;
  setDeleteModalOpen: (open: boolean) => void;
}

export const GroupMenuItems = ({
  id,
  isPublished,
  onPublish,
  onUnpublish,
  onUngroup,
  onShare,
}: GroupMenuProps): ActionMenuGroups => [
  {
    items: [
      { id: 'edit-seo', text: { name: 'Редагувати групу (SEO)' }, href: `${WORKS_BASE_PATH}/group/${id}/edit` },
      { id: 'edit-content', text: { name: 'Редагувати контент' }, href: `${WORKS_BASE_PATH}/group/${id}/content` },
      { id: 'share', text: { name: 'Поширити' }, onClick: () => onShare(id) },
      { id: 'ungroup', text: { name: 'Розгрупувати' }, onClick: () => onUngroup(id) },
    ],
  },
  {
    items: [
      isPublished
        ? { id: 'unpublish', text: { name: 'Зняти з публікації' }, onClick: () => onUnpublish(id) }
        : { id: 'publish', text: { name: 'Опублікувати' }, onClick: () => onPublish(id) },
    ],
  },
];

export const WorkMenuItems = ({
  id,
  setDeleteModalOpen,
}: WorkMenuProps): ActionMenuGroups => [
  {
    items: [
      { id: 'edit', text: { name: 'Редагувати композицію' }, href: `${WORKS_BASE_PATH}/${id}/edit` },
      { id: 'share', text: { name: 'Поширити' }, href: `${WORKS_BASE_PATH}/${id}/share` },
    ],
  },
  {
    items: [
      { id: 'delete', text: { name: 'Видалити' }, onClick: () => setDeleteModalOpen(true) },
    ],
  },
];
