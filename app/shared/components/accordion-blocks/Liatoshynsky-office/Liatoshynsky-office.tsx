'use client';
import { useState } from 'react';

import { hardcodedData } from './Liatoshynsky-office.const';
import { QuoteBlock } from '~/components/quote-block/QuoteBlock';
import CollapsibleBlock from '~/ds-components/collapsible-block/CollapsibleBlock';

export const LiatoshynskyOffice = () => {
  const [mainQuote, setMainQuote] = useState(hardcodedData.mainQuote);
  const [caption, setCaption] = useState(hardcodedData.caption);

  return (
    <CollapsibleBlock title={'Кабінет Лятошинського'}>
      <QuoteBlock
        defaultMainQuote={mainQuote}
        defaultCaption={caption}
        onMainQuoteChange={setMainQuote}
        onCaptionChange={setCaption}
      />
    </CollapsibleBlock>
  );
};
