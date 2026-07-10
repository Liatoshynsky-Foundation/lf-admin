
export type ContentType = 'news' | 'events' | 'media';

interface ContentCardMenuProps {
  id: string;
  type: ContentType;
  setDeleteModalOpen: (open: boolean) => void;
}

const ContentCardMenuItems = ({ id, type, setDeleteModalOpen }: ContentCardMenuProps) => {
  const seoHref = `/publications/${type}/${id}/seo`;

  return [
    [
      {
        id: 'seo-settings',
        text: { name: 'SEO налаштування' },
        href: seoHref
      },
      {
        id: 'delete',
        text: { name: 'Видалити' },
        onClick: () => setDeleteModalOpen(true)
      }
    ]
  ];
};

export default ContentCardMenuItems;
