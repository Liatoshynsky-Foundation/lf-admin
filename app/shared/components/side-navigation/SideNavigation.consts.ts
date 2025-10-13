export const NAVIGATION_DATA = {
  mainGroup: [
    { title: 'Головна', iconSrc: 'house', href: '/' },
    { title: 'Новини', iconSrc: 'news', href: '/news', disabled: true },
    { title: 'Архів творів', iconSrc: 'musicArchive', href: '/musicArchive', disabled: true },
    { title: 'Медіатека', iconSrc: 'media', href: '/media', disabled: true }
  ],
  pages: [
    {
      element: { title: 'Борис Лятошинський', iconSrc: 'biography' },
      collapseElements: [{ title: 'Дослідження та наукові роботи', href: '/research', disabled: true }]
    },
    {
      element: { title: 'Про фундацію', iconSrc: 'aboutFoundation' },
      collapseElements: [{ title: 'Про нас', href: '/about-us' }]
    },
    { title: 'Кабінет-Архів', iconSrc: 'archive', href: '/archive', disabled: true }
  ],
  settings: [
    { title: 'Контакти', iconSrc: 'contacts', href: '/contacts', disabled: true },
    { title: 'Футер сайту', iconSrc: 'footer', href: '/footer', disabled: true },
    { title: 'Мапа сайту', iconSrc: 'siteMap', href: '/map', disabled: true }
  ]
};
