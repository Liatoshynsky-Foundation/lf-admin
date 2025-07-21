'use client';

import React, { useState } from 'react';

import { hardcodedData } from './LiatoshynskyFoundation.const';
import { FoundationBlock } from '~/components/about-us/Liatoshynsky-foundation/foundation-block/FoundationBlock';
import CollapsibleBlock from '~/ds-components/collapsible-block/CollapsibleBlock';

export const LiatoshynskyFoundation = () => {
  const [text, setText] = useState(hardcodedData.mainText);
  const [paragraph, setParagraph] = useState(hardcodedData.paragraphs);
  const handleParagraphChange = (index: number, newValue: string) => {
    const updated = [...paragraph];
    updated[index] = { ...updated[index], text: newValue };
    setParagraph(updated);
  };
  return (
    <CollapsibleBlock title="Фундація Лятошинського">
      <FoundationBlock
        mainText={text}
        paragraphs={paragraph}
        onMainTextChange={setText}
        onParagraphsChange={handleParagraphChange}
      />{' '}
    </CollapsibleBlock>
  );
};
