export const NAVIGATION_DATA = {
  main: [{ title: 'Головна', iconSrc: 'house', href: '/' }],
  content: [
    {
      title: 'Основні сторінки',
      href: '',
      disabled: true
    },
    {
      title: 'Новини та події',
      iconSrc: 'news',
      href: '/publications',
    },
    {
      element: { title: 'Каталоги', iconSrc: 'book-marked' },
      collapseElements: [
        { title: 'Твори', href: '/creativity' },
        { title: 'Дослідження та наукові праці', href: '', disabled: true },
        { title: 'Архів кабінету-музею', href: '', disabled: true }
      ]
    },
    {
      element: { title: 'Секції сайту', iconSrc: 'siteMap' },
      collapseElements: [
        { title: 'Часті запитання', href: '', disabled: true },
        { title: 'Команда фундації', href: '', disabled: true },
        { title: 'Контакти', href: '/contacts', disabled: true },
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
  ]
};
