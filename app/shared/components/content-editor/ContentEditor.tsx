'use client';

import { Box, Container, Stack, TextField, Typography } from '@mui/material';
import type { JSONContent } from '@tiptap/react';
import React, { useEffect, useState } from 'react';

import { Editor } from '~/components/content-editor';
import Button from '~/shared/components/design-system/button/Button';

interface ContentEditorProps {
  editorTitle: string;
  initialContent?: JSONContent | null;
}

interface ContentData {
  title: string;
  shortDescription: string;
  content: JSONContent | null;
}

const ContentEditor: React.FC<ContentEditorProps> = ({ editorTitle, initialContent }) => {
  const [contentData, setContentData] = useState<ContentData>({
    title: '',
    shortDescription: '',
    content: initialContent || null
  });
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(async () => {
      if (contentData.content || contentData.title || contentData.shortDescription) {
        await saveEvent();
      }
    }, 2000);

    return () => clearTimeout(timeout);
  }, [contentData]);

  const saveEvent = async () => {
    setIsSaving(true);

    try {
      console.log('Auto-saving event:', contentData);

      await new Promise((resolve) => setTimeout(resolve, 500));

      setLastSaved(new Date());
    } catch (error) {
      console.error('Auto-save failed:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = async (file: File): Promise<string> => {
    console.log('Uploading image:', file.name);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return URL.createObjectURL(file);
  };

  const handlePublish = async () => {
    console.log('Publishing content:', contentData);
    alert('Content published! (This is a demo)');
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h4" gutterBottom>
            {editorTitle}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {isSaving && 'Збереження...'}
            {!isSaving && lastSaved && `Останнє збереження о ${lastSaved.toLocaleTimeString()}`}
            {!isSaving && !lastSaved && 'Почніть вводити текст для автоматичного збереження'}
          </Typography>
        </Box>

        <TextField
          fullWidth
          label="Content Title"
          variant="outlined"
          value={contentData.title}
          onChange={(e) => setContentData({ ...contentData, title: e.target.value })}
          placeholder="Заголовок"
        />

        <TextField
          fullWidth
          label="Короткий опис"
          variant="outlined"
          multiline
          rows={2}
          value={contentData.shortDescription}
          onChange={(e) => setContentData({ ...contentData, shortDescription: e.target.value })}
          placeholder="Короткий опис контенту"
          helperText={`${contentData.shortDescription.length}/160 символів`}
        />

        <Box>
          <Typography variant="h6" gutterBottom>
            Деталі контенту
          </Typography>
          <Editor
            initialContent={contentData.content || undefined}
            placeholder="Введіть деталі контенту..."
            onChange={(content) => setContentData({ ...contentData, content })}
            onImageUpload={handleImageUpload}
            showSaveButton={false}
            minHeight="500px"
          />
        </Box>

        <Box display="flex" gap={2}>
          <Button variant="filled" color="primary" onClick={handlePublish}>
            Опублікувати
          </Button>
          <Button variant="outlined" color="primary" onClick={() => saveEvent()}>
            Зберегти чернетку
          </Button>
        </Box>
      </Stack>
    </Container>
  );
};

export default ContentEditor;
