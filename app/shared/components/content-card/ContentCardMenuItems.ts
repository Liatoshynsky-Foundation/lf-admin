import type { ContentType } from '~/shared/hooks/use-content-card-actions/useContentCardActions';

interface ContentCardMenuProps {
  id: string;
  type: ContentType;
  isPublished: boolean;
  setDeleteModalOpen: (open: boolean) => void;
  onUnpublish: () => void;
  onPublish: () => void;
}

const ContentCardMenuItems = ({
  id,
  type,
  isPublished,
  setDeleteModalOpen,
  onUnpublish,
  onPublish
}: ContentCardMenuProps) => {
  const seoHref = `/publications/${type}/${id}/seo`;
  const editUkHref = `/publications/${type}/${id}/edit?lang=uk`;
  const editEnHref = `/publications/${type}/${id}/edit?lang=en`;

  return [
    {
      title: 'Мовні версії',
      items: [
        { id: 'uk', text: { name: 'Українська' }, href: editUkHref },
        { id: 'en', text: { name: 'Англійська' }, href: editEnHref }
      ]
    },
    {
      items: [
        { id: 'seo-settings', text: { name: 'SEO налаштування' }, href: seoHref },
        ...(isPublished
          ? [{ id: 'hide', text: { name: 'Зняти з публікації' }, onClick: onUnpublish }]
          : [{ id: 'publish', text: { name: 'Опублікувати' }, onClick: onPublish }]),
        { id: 'delete', text: { name: 'Видалити' }, onClick: () => setDeleteModalOpen(true) }
      ]
    }
  ];
};
export default ContentCardMenuItems;
