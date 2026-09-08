export const NAVIGATION_DATA = {
  main: [{ title: 'Головна', iconSrc: 'house', href: '/' }],
  content: [
    {
      title: 'Основні сторінки',
      iconSrc: 'file-text',
      href: '/main-page'
    },
    {
      title: 'Новини та події',
      iconSrc: 'news',
      href: '/publications'
    },
    {
      element: { title: 'Каталоги', iconSrc: 'book-marked' },
      collapseElements: [
        { title: 'Твори', href: '/creativity' },
        { title: 'Дослідження та наукові праці', href: '/research' },
        { title: 'Архів кабінету-музею', href: '/archive' }
      ]
    },
    {
      element: { title: 'Секції сайту', iconSrc: 'siteMap' },
      collapseElements: [
        { title: 'Часті запитання', href: '', disabled: true },
        { title: 'Команда фундації', href: '/foundation-team' },
        { title: 'Контакти', href: '/contacts' },
        { title: 'Футер', href: '', disabled: true }
      ]
    },
    {
      title: 'Файли',
      iconSrc: 'folder-open',
      href: '/files'
    }
  ],
  other: [
    { title: 'Звернення', iconSrc: 'contacts', href: '', disabled: true },
    {
      element: { title: 'Налаштування', iconSrc: 'settings' },
      collapseElements: [
        { title: 'Основні', href: '', disabled: true },
        { title: 'SEO Налаштування', href: '', disabled: true },
        { title: 'Користувачі та ролі', href: '', disabled: true },
        { title: 'Історія змін', href: '', disabled: true },
        { title: 'Системні логи', href: '/logs' }
      ]
    }
  ],
  footer: [{ title: 'Вийти', iconSrc: 'logout', href: '' }]
};
