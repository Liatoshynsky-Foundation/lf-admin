import React from 'react';

import Button from '../design-system/button/Button';
import ButtonGroup from '../design-system/button-group/ButtonGroup';

export type LanguageSwitcherProps = Readonly<{
  languageSwitcher: (language: 'uk' | 'en') => void;
}>;

const LanguageSwitcher = ({ languageSwitcher }: LanguageSwitcherProps) => {
  const languages = [
    <Button key={'uk'} onClick={() => languageSwitcher('uk')}>
      Українська
    </Button>,
    <Button key={'en'} onClick={() => languageSwitcher('en')}>
      English
    </Button>
  ];

  return <ButtonGroup buttons={languages} defaultActiveButton={0}></ButtonGroup>;
};

export default LanguageSwitcher;
