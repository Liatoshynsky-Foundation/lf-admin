import React from 'react';

import Button from '../design-system/button/Button';
import ButtonGroup from '../design-system/button-group/ButtonGroup';

const LanguageSwitcher = ({ languageSwitcher }: { languageSwitcher: (language: 'ua' | 'en') => void }) => {
  const languages = [
    <Button key={'ua'} onClick={() => languageSwitcher('ua')}>
      Українська
    </Button>,
    <Button key={'en'} onClick={() => languageSwitcher('en')}>
      English
    </Button>
  ];

  return <ButtonGroup buttons={languages} defaultActiveButton={0}></ButtonGroup>;
};

export default LanguageSwitcher;
