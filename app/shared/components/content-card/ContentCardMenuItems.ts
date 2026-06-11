
export type ContentType = 'news' | 'events' | 'media';

interface ContentCardMenuProps {
  id: string;
  type: ContentType;
  setDeleteModalOpen: (open: boolean) => void;
}

const ContentCardMenuItems = ({ id, type, setDeleteModalOpen }: ContentCardMenuProps) => {
  const seoHref = `/publications/${type}/${id}/seo`;

  return [
    {
      text: 'SEO налаштування',
      href: seoHref
    },
    {
      text: 'Видалити',
      onClick: () => setDeleteModalOpen(true)
    }
  ];
};

export default ContentCardMenuItems;
