import React, { startTransition } from 'react';

import Button from '../design-system/button/Button';
import ButtonGroup from '../design-system/button-group/ButtonGroup';
import { useStore } from '~/store';

const LanguageSwitcher = ({ languageSwitcher }: { languageSwitcher: (language: 'uk' | 'en') => void }) => {
  const currentLocale = useStore((s) => s.locale);

  const languages = [
    <Button key={'uk'} onClick={() => startTransition(() => languageSwitcher('uk'))}>
      Українська
    </Button>,
    <Button key={'en'} onClick={() => startTransition(() => languageSwitcher('en'))}>
      English
    </Button>
  ];

  return <ButtonGroup buttons={languages} activeButton={currentLocale === 'uk' ? 0 : 1} />;
};

export default LanguageSwitcher;
