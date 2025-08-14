'use client';
import { Box } from '@mui/material';

import CollapsibleBlock from '../../design-system/collapsible-block/CollapsibleBlock';
import { ImagePreviewBlock } from '../../design-system/photo-block/PhotoBlock';
import { CustomTextField } from '../../design-system/text-field/TextField';
import { QuoteBlock } from '../Liatoshynsky-office/quote-block/QuoteBlock';
import { hardcodedData } from './EntrySection.consts';
import { BLOCK_IDS, PAGE_IDS } from '~/constants/pageBlocks';
import useInitBlock from '~/shared/hooks/use-init-block/useInitBlock';
import { useStore } from '~/store';

export const EntrySection = () => {
  const pageId = PAGE_IDS.ABOUT_US;
  const blockId = BLOCK_IDS.ENTRY_SECTION;

  const block = useInitBlock(pageId, blockId, hardcodedData);

  const setField = useStore((state) => state.setField);

  return (
    <CollapsibleBlock title="Вступна секція">
      <CustomTextField
        title="Заголовок сторінки"
        label="Текст заголовку"
        fullWidth
        value={block.title || ''}
        onChange={(e) => setField(pageId, blockId, 'title', e.target.value)}
      />

      <Box sx={{ marginLeft: '-16px' }}>
        <ImagePreviewBlock
          imageUrl={`/images/${block.image || ''}`}
          fileName={block.image || ''}
          cropHeight={50}
          cropWidth={50}
          onChangeImage={(file) => setField(pageId, blockId, 'image', file.name)}
        />
      </Box>

      <CustomTextField
        title="Підпис до зображення"
        label="Текст підпису"
        fullWidth
        value={block.imageCaption || ''}
        onChange={(e) => setField(pageId, blockId, 'imageCaption', e.target.value)}
      />

      <Box sx={{ marginTop: '15px' }}>
        <QuoteBlock
          title={block.quoteText || ''}
          description={block.quoteDescription || ''}
          onTitleChange={(val) => setField(pageId, blockId, 'quoteText', val)}
          onDescriptionChange={(val) => setField(pageId, blockId, 'quoteDescription', val)}
        />
      </Box>
    </CollapsibleBlock>
  );
};
