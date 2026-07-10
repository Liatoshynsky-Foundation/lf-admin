export type ContentType = 'news' | 'events' | 'media';

interface ContentCardMenuProps {
  editSeoHref: string;
}

const PageCardMenuItems = ({editSeoHref }: ContentCardMenuProps) => {
  return [
    [
      {
        id: 'seo-settings',
        text: { name: 'SEO налаштування' },
        href: editSeoHref
      }
    ]
  ];
};

export default PageCardMenuItems;
