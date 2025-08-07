export const NAVIGATION_DATA = {
  mainGroup: [
    { title: 'Головна', iconSrc: 'house', href: '/' },
    { title: 'Новини', iconSrc: 'news', href: '/news' },
    { title: 'Архів творів', iconSrc: 'musicArchive', href: '/musicArchive' },
    { title: 'Медіатека', iconSrc: 'media', href: '/media' }
  ],
  pages: [
    {
      element: { title: 'Борис Лятошинський', iconSrc: 'biography' },
      collapseElements: [{ title: 'Дослідження та наукові роботи', href: '/research' }]
    },
    {
      element: { title: 'Про фундацію', iconSrc: 'aboutFoundation' },
      collapseElements: [{ title: 'Про нас', href: '/about' }]
    },
    { title: 'Кабінет-Архів', iconSrc: 'archive', href: '/archive' }
  ],
  settings: [
    { title: 'Контакти', iconSrc: 'contacts', href: '/contacts' },
    { title: 'Футер сайту', iconSrc: 'footer', href: '/footer' },
    { title: 'Мапа сайту', iconSrc: 'siteMap', href: '/map' }
  ]
};
