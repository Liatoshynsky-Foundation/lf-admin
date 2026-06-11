import BaseCardMenu from '../base-card/BaseCardMenu';

interface PageCardMenuProps {
  anchorEl: HTMLElement | null;
  onClose: () => void;
  editSeoHref: string;
}

const PageCardMenu = ({ anchorEl, onClose, editSeoHref }: PageCardMenuProps) => {
  const contentMenuItems = [
    {
      text: 'SEO налаштування',
      href: editSeoHref
    }
  ];

  return <BaseCardMenu anchorEl={anchorEl} onClose={onClose} menuItems={contentMenuItems} />;
};

export default PageCardMenu;
