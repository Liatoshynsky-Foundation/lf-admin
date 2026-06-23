// WorksTableMenusItems.ts
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
    { id: 'edit-seo', label: 'Редагувати групу (SEO)', href: `/creativity/group/${id}/seo` },
    { id: 'edit-content', label: 'Редагувати контент', href: `/creativity/group/${id}/content` },
    { id: 'share', label: 'Поширити', href: `/creativity/group/${id}/share` },
    { id: 'ungroup', label: 'Розгрупувати', href: `/creativity/group/${id}/ungroup` },
  ],
  [
    isPublished
      ? { id: 'unpublish', label: 'Зняти з публікації', onClick: () => setHideModalOpen(true) }
      : { id: 'publish', label: 'Опублікувати', onClick: () => setPublicationModalOpen(true) },
  ],
];

export const WorkMenuItems = ({
  id,
  setDeleteModalOpen,
}: WorkMenuProps): readonly (readonly MenuItem[])[] => [
  [
    { id: 'edit', label: 'Редагувати композицію', href: `/creativity/${id}/edit` },
    { id: 'share', label: 'Поширити', href: `/creativity/${id}/share` },
  ],
  [
    { id: 'delete', label: 'Видалити', onClick: () => setDeleteModalOpen(true) },
  ],
];