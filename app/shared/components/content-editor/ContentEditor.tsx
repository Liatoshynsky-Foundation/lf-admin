'use client';

import { Box, Button, Container, Stack, TextField, Typography } from '@mui/material';
import type { JSONContent } from '@tiptap/react';
import React, { useEffect, useState } from 'react';

import { Editor } from '~/components/content-editor';

interface EventData {
  title: string;
  shortDescription: string;
  content: JSONContent | null;
}

export default function ContentEditor() {
  const [eventData, setEventData] = useState<EventData>({
    title: '',
    shortDescription: '',
    content: null
  });
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(async () => {
      if (eventData.content || eventData.title || eventData.shortDescription) {
        await saveEvent();
      }
    }, 2000);

    return () => clearTimeout(timeout);
  }, [eventData]);

  const saveEvent = async () => {
    setIsSaving(true);

    try {
      console.log('Auto-saving event:', eventData);

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
    console.log('Publishing event:', eventData);
    alert('Event published! (This is a demo)');
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Content Page Editor
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {isSaving && 'Saving...'}
            {!isSaving && lastSaved && `Last saved at ${lastSaved.toLocaleTimeString()}`}
            {!isSaving && !lastSaved && 'Start typing to auto-save'}
          </Typography>
        </Box>

        <TextField
          fullWidth
          label="Event Title"
          variant="outlined"
          value={eventData.title}
          onChange={(e) => setEventData({ ...eventData, title: e.target.value })}
          placeholder="e.g., Annual Charity Concert 2024"
        />

        <TextField
          fullWidth
          label="Short Description"
          variant="outlined"
          multiline
          rows={2}
          value={eventData.shortDescription}
          onChange={(e) => setEventData({ ...eventData, shortDescription: e.target.value })}
          placeholder="Brief description for event cards and previews"
          helperText={`${eventData.shortDescription.length}/160 characters`}
        />

        <Box>
          <Typography variant="h6" gutterBottom>
            Content Details
          </Typography>
          <Editor
            initialContent={eventData.content || undefined}
            placeholder="Describe your event in detail... Include the date, time, location, agenda, speakers, and any other relevant information."
            onChange={(content) => setEventData({ ...eventData, content })}
            onImageUpload={handleImageUpload}
            showSaveButton={false}
            minHeight="500px"
          />
        </Box>

        <Box display="flex" gap={2}>
          <Button variant="contained" color="primary" onClick={handlePublish}>
            Publish Content
          </Button>
          <Button variant="outlined" onClick={() => saveEvent()}>
            Save Draft
          </Button>
        </Box>
      </Stack>
    </Container>
  );
}
