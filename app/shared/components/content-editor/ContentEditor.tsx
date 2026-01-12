'use client';

import { Block } from '@blocknote/core';
import { Box, Stack, Typography } from '@mui/material';
import { useState } from 'react';

import Button from '../design-system/button/Button';
import { BlockNoteEditor } from './BlockNoteEditor';
import { DemoFilePickerModal } from './DemoFilePickerModal';
import { FilePickerModalProps } from './types';

export const ContentEditor = () => {
  const [content, setContent] = useState<Block[] | null>(null);
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

  const handleClear = () => {
    setContent(null);

    setTimeout(() => setContent(null), 0);
  };

  const handleManualSave = () => {
    if (content) {
      handleSave(content);
    }
  };

  // Custom file picker modal for ContentEditor
  const renderCustomFilePicker = (props: FilePickerModalProps) => {
    return <DemoFilePickerModal {...props} />;
  };

  return (
    <Box sx={{ padding: 3, maxWidth: '1200px', margin: '0 auto' }}>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Редагування контенту
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Редактор контенту
          </Typography>
        </Box>

        <Stack direction="row" spacing={2} flexWrap="wrap">
          <Button variant="filled" color="secondary" onClick={handleClear}>
            Очистити
          </Button>
          <Button
            variant="filled"
            color="primary"
            onClick={handleManualSave}
            disabled={isSaving || !content || content.length === 0}
            loading={isSaving}
          >
            Зберегти
          </Button>
        </Stack>

        <BlockNoteEditor
          onChange={handleContentChange}
          onSave={handleSave}
          placeholder="Почніть вводити текст або натисніть '/' для команд..."
          editable={true}
          minHeight="600px"
          customFilePickerModal={renderCustomFilePicker}
        />
      </Stack>
    </Box>
  );
};
