'use client';

import { Block } from '@blocknote/core';
import { Box, Stack } from '@mui/material';
import { useState } from 'react';

import { BlockNoteEditor } from './BlockNoteEditor';

export const ContentEditor = () => {
  //eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [content, setContent] = useState<Block[] | null>(null);
  //eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isSaving, setIsSaving] = useState(false);

  const handleContentChange = (newContent: Block[]) => {
    setContent(newContent);
    console.log('Content changed:', newContent);
  };

  const handleSave = async (contentToSave: Block[]) => {
    setIsSaving(true);

    console.log('Saving content:', contentToSave);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    alert('Контент збережено! (це placeholder - реальне збереження ще не підключене)');
    setIsSaving(false);
  };

  return (
    <Box sx={{ padding: 3, maxWidth: '1200px', margin: '0 auto' }}>
      <Stack spacing={3}>
        <BlockNoteEditor
          onChange={handleContentChange}
          onSave={handleSave}
          placeholder="Почніть вводити текст або натисніть '/' для команд..."
          editable={true}
          minHeight="800px"
        />
      </Stack>
    </Box>
  );
};
