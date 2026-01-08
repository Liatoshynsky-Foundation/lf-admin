'use client';

import { Block } from '@blocknote/core';
import { Box, Stack, Typography } from '@mui/material';
import { useState } from 'react';

import Button from '../design-system/button/Button';
import { BlockNoteEditor } from './BlockNoteEditor';

export const BlockNoteEditorExample = () => {
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

  return (
    <Box sx={{ padding: 3, maxWidth: '1200px', margin: '0 auto' }}>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Редагування контенту
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Використовуйте цей редактор для створення та редагування контенту. Ви можете форматувати текст, додавати
            зображення, таблиці та інші елементи. Натисніть &quot;/&quot; для доступу до команд.
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

        <Box
          sx={{
            padding: 2,
            backgroundColor: '#f5f5f5',
            borderRadius: 1,
            border: '1px solid #e0e0e0'
          }}
        >
          <Typography variant="body2">
            💡 <strong>Підказка:</strong> Натисніть Cmd+S (Mac) або Ctrl+S (Windows) для швидкого збереження
          </Typography>
        </Box>

        <BlockNoteEditor
          onChange={handleContentChange}
          onSave={handleSave}
          placeholder="Почніть вводити текст або натисніть '/' для команд..."
          editable={true}
          minHeight="600px"
        />
      </Stack>
    </Box>
  );
};
