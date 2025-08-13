'use client';

import { hardcodedData } from './Liatoshynsky-office.const';
import { QuoteBlock } from './quote-block/QuoteBlock';
import CollapsibleBlock from '~/ds-components/collapsible-block/CollapsibleBlock';
import useInitBlock from '~/shared/hooks/use-init-block/useInitBlock';
import { useStore } from '~/store';

export const LiatoshynskyOffice = () => {
  const pageId = 'aboutUs';
  const blockId = 'liatoshynskyOffice';

  const block = useInitBlock(pageId, blockId, hardcodedData);

  const setField = useStore((state) => state.setField);

  return (
    <CollapsibleBlock title="Кабінет Лятошинського">
      <QuoteBlock
        title={block.mainQuote || ''}
        description={block.caption || ''}
        onTitleChange={(val) => setField(pageId, blockId, 'mainQuote', val)}
        onDescriptionChange={(val) => setField(pageId, blockId, 'caption', val)}
      />
    </CollapsibleBlock>
  );
};
