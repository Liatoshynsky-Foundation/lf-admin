'use client';
import { Box } from '@mui/material';
import { useState } from 'react';

import CollapsibleBlock from '../../design-system/collapsible-block/CollapsibleBlock';
import { ImagePreviewBlock } from '../../design-system/photo-block/PhotoBlock';
import { CustomTextField } from '../../design-system/text-field/TextField';
import { QuoteBlock } from '../Liatoshynsky-office/quote-block/QuoteBlock';
import { hardcodedData } from './EntrySection.consts';

export const EntrySection = () => {
  const [title, setTitle] = useState(hardcodedData.title);
  const [image, setImage] = useState(hardcodedData.image);
  const [imageCaption, setImageCaption] = useState(hardcodedData.imageCaption);
  const [quoteText, setQuoteText] = useState(hardcodedData.quoteText);
  const [quoteDescription, setQuoteDescription] = useState(hardcodedData.quoteDescription);

  return (
    <CollapsibleBlock title="Вступна секція">
      <CustomTextField
        title="Заголовок сторінки"
        label="Текст заголовку"
        fullWidth
        defaultValue={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <Box sx={{ marginLeft: '-16px' }}>
        <ImagePreviewBlock
          imageUrl={`/images/${image}`}
          fileName={image}
          cropHeight={50}
          cropWidth={50}
          onChangeImage={(e) => setImage(e.name)}
        />
      </Box>

      <CustomTextField
        title="Підпис до зображення"
        label="Текст підпису"
        fullWidth
        defaultValue={imageCaption}
        onChange={(e) => setImageCaption(e.target.value)}
      />
      <Box sx={{ marginTop: '15px' }}>
        <QuoteBlock
          title={quoteText}
          description={quoteDescription}
          onTitleChange={setQuoteText}
          onDescriptionChange={setQuoteDescription}
        />
      </Box>
    </CollapsibleBlock>
  );
};
