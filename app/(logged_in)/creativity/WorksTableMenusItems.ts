import { WORKS_BASE_PATH } from '~/constants/creativity';
import { MenuItem } from '~/shared/components/table-layout/row-variants/Row.types';

interface GroupMenuProps {
  id: string;
  isPublished: boolean;
  setHideModalOpen: (open: boolean) => void;
  setPublicationModalOpen: (open: boolean) => void;
}

interface WorkMenuProps {
  id: string;
  isPublished: boolean;
  setDeleteModalOpen: (open: boolean) => void;
}

export const GroupMenuItems = ({
  id,
  isPublished,
  setHideModalOpen,
  setPublicationModalOpen,
}: GroupMenuProps): readonly (readonly MenuItem[])[] => [
  [
    { id: 'edit-seo', text: {name: 'Редагувати групу (SEO)'}, href: `${WORKS_BASE_PATH}/group/${id}/seo` },
    { id: 'edit-content', text: {name: 'Редагувати контент'}, href: `${WORKS_BASE_PATH}/group/${id}/content` },
    { id: 'share', text: {name: 'Поширити'}, href: `${WORKS_BASE_PATH}/group/${id}/share` },
    { id: 'ungroup', text: {name: 'Розгрупувати'}, href: `${WORKS_BASE_PATH}/group/${id}/ungroup` },
  ],
  [
    isPublished
      ? { id: 'unpublish', text: {name: 'Зняти з публікації'}, onClick: () => setHideModalOpen(true) }
      : { id: 'publish', text: {name: 'Опублікувати'}, onClick: () => setPublicationModalOpen(true) },
  ],
];

export const WorkMenuItems = ({
  id,
  setDeleteModalOpen,
}: WorkMenuProps): readonly (readonly MenuItem[])[] => [
  [
    { id: 'edit', text: {name: 'Редагувати композицію'}, href: `${WORKS_BASE_PATH}/${id}/edit` },
    { id: 'share', text: {name: 'Поширити'}, href: `${WORKS_BASE_PATH}/${id}/share` },
  ],
  [
    { id: 'delete', text: {name: 'Видалити'}, onClick: () => setDeleteModalOpen(true) },
  ],
];