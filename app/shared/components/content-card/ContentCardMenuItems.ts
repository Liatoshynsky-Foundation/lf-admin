
export type ContentType = 'news' | 'events' | 'media';

interface ContentCardMenuProps {
  id: string;
  type: ContentType;
  setDeleteModalOpen: (open: boolean) => void;
}

const ContentCardMenuItems = ({ id, type, setDeleteModalOpen }: ContentCardMenuProps) => {
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
        { id: 'hide', text: { name: 'Зняти з публікації' }, onClick: () => {} },
        { id: 'delete', text: { name: 'Видалити' }, onClick: () => setDeleteModalOpen(true) }
      ]
    }
  ];
};
export default ContentCardMenuItems;
