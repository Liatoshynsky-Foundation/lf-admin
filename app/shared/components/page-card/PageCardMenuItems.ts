
export type ContentType = 'news' | 'events' | 'media';

interface ContentCardMenuProps {
  editSeoHref: string;
}

const PageCardMenuItems = ({editSeoHref }: ContentCardMenuProps) => {
  return [
    {
      text: { name: 'SEO налаштування' },
      href: editSeoHref
    }
  ];
};

export default PageCardMenuItems;
