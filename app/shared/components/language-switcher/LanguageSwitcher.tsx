'use client';

import { useLocale } from 'next-intl';
import React from 'react';

import Button from '../design-system/button/Button';
import ButtonGroup from '../design-system/button-group/ButtonGroup';
import { usePathname, useRouter } from '~/../i18n/navigation';

const setLocaleCookie = (locale: string) => {
  document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000; SameSite=Lax`;
};

const LanguageSwitcher = () => {
  const pathname = usePathname();
  const router = useRouter();
  const currentLocale = useLocale();

  const handleLanguageChange = (locale: 'uk' | 'en') => {
    setLocaleCookie(locale);
    router.replace(pathname, { locale });
  };

  const languages = [
    <Button key={'uk'} onClick={() => handleLanguageChange('uk')}>
      Українська
    </Button>,
    <Button key={'en'} onClick={() => handleLanguageChange('en')}>
      English
    </Button>
  ];

  const activeIndex = currentLocale === 'en' ? 1 : 0;

  return <ButtonGroup buttons={languages} defaultActiveButton={activeIndex}></ButtonGroup>;
};

export default LanguageSwitcher;
