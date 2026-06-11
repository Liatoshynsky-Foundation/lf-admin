import BaseCardMenu from '../base-card/BaseCardMenu';

export type ContentType = 'news' | 'events' | 'media';

interface ContentCardMenuProps {
  id: string;
  type: ContentType;
  anchorEl: HTMLElement | null;
  onClose: () => void;
  setDeleteModalOpen: (open: boolean) => void;
}

const ContentCardMenu = ({ id, type, anchorEl, onClose, setDeleteModalOpen }: ContentCardMenuProps) => {
  const seoHref = `/publications/${type}/${id}/seo`;

  const contentMenuItems = [
    {
      text: 'SEO налаштування',
      href: seoHref
    },
    {
      text: 'Видалити',
      onClick: () => setDeleteModalOpen(true)
    }
  ];

  return <BaseCardMenu anchorEl={anchorEl} onClose={onClose} menuItems={contentMenuItems} />;
};

export default ContentCardMenu;
