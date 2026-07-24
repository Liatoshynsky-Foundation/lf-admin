'use client';

import { Box, Dialog, IconButton, InputAdornment, TextField, Typography } from '@mui/material';
import { CloudUpload, FileText, Info, Music, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';

import { styles } from './CompositionModal.styles';
import Button from '~/components/design-system/button/Button';
import { COMPOSITION_MODAL_LABELS, REQUIRED_FIELD_ERROR } from '~/constants/opus';
import { MediaModal } from '~/shared/components/media-modal/MediaModal';
import type { MediaModalResult } from '~/shared/components/media-modal/MediaModal.types';
import { isAudioUploadFile, isPdfUploadFile } from '~/shared/components/media-modal/MediaModal.utils';
import { createCompositionId } from '~/shared/hooks/use-upsert-opus/useUpsertOpus';
import type { OpusCompositionData, OpusMediaFileData } from '~/types/opus';

interface CompositionModalProps {
  open: boolean;
  mode: 'create' | 'edit';
  initialValue?: OpusCompositionData | null;
  onClose: () => void;
  onSubmit: (composition: OpusCompositionData) => void;
}

type MediaTarget = { field: 'audios' | 'notes'; rowId?: string };

const emptyComposition = (): OpusCompositionData => ({
  id: createCompositionId(),
  name: '',
  genre: '',
  year: '',
  audios: [],
  notes: []
});

const fileNameFromUrl = (url?: string): string => {
  if (!url) {
    return '';
  }

  const segment = url.split('/').pop() ?? url;

  return decodeURIComponent(segment.split('?')[0]);
};

export default function CompositionModal({
  open,
  mode,
  initialValue,
  onClose,
  onSubmit
}: Readonly<CompositionModalProps>) {
  const [composition, setComposition] = useState<OpusCompositionData>(emptyComposition);
  const [titleError, setTitleError] = useState('');
  const [mediaTarget, setMediaTarget] = useState<MediaTarget | null>(null);

  useEffect(() => {
    if (open) {
      setComposition(initialValue ? { ...initialValue } : emptyComposition());
      setTitleError('');
      setMediaTarget(null);
    }
  }, [open, initialValue]);

  const updateField = <Key extends keyof OpusCompositionData>(key: Key, value: OpusCompositionData[Key]): void => {
    setComposition((prev) => ({ ...prev, [key]: value }));

    if (key === 'name' && typeof value === 'string' && value.trim()) {
      setTitleError('');
    }
  };

  const addNoteRow = (): void => {
    const row: OpusMediaFileData = { id: createCompositionId(), name: '', publishDate: '' };
    setComposition((prev) => ({ ...prev, notes: [...prev.notes, row] }));
  };

  const updateNoteRow = (id: string, patch: Partial<OpusMediaFileData>): void => {
    setComposition((prev) => ({
      ...prev,
      notes: prev.notes.map((row) => (row.id === id ? { ...row, ...patch } : row))
    }));
  };

  const removeMediaRow = (field: 'audios' | 'notes', id: string): void => {
    setComposition((prev) => ({ ...prev, [field]: prev[field].filter((row) => row.id !== id) }));
  };

  const clearNoteFile = (id: string): void => {
    setComposition((prev) => ({
      ...prev,
      notes: prev.notes.map((row) => (row.id === id ? { ...row, fileUrl: undefined } : row))
    }));
  };

  const handleMediaApply = (result: MediaModalResult): void => {
    const url = result.uploadResult?.url ?? (result.selected.kind === 'upload' ? undefined : result.selected.src);
    const fileName = result.uploadResult?.originalName ?? result.selected.fileName ?? '';

    if (!url || !mediaTarget) {
      setMediaTarget(null);

      return;
    }

    if (mediaTarget.field === 'audios') {
      setComposition((prev) => ({
        ...prev,
        audios: [...prev.audios, { id: createCompositionId(), name: fileName, fileUrl: url }]
      }));
    } else if (mediaTarget.rowId) {
      updateNoteRow(mediaTarget.rowId, { fileUrl: url });
    }

    setMediaTarget(null);
  };

  const handleSubmit = (): void => {
    if (!composition.name.trim()) {
      setTitleError(REQUIRED_FIELD_ERROR);

      return;
    }

    onSubmit({ ...composition, name: composition.name.trim() });
  };

  const hasFiles = composition.audios.length > 0 || composition.notes.some((note) => Boolean(note.fileUrl));
  const isAudioTarget = mediaTarget?.field === 'audios';

  return (
    <Dialog open={open} onClose={onClose} disableScrollLock PaperProps={{ sx: styles.paper }}>
      <Box sx={styles.header}>
        <Typography sx={styles.heading}>
          {mode === 'edit' ? COMPOSITION_MODAL_LABELS.editTitle : COMPOSITION_MODAL_LABELS.createTitle}
        </Typography>
        <IconButton aria-label="Закрити" onClick={onClose} sx={styles.closeButton}>
          <X size={24} strokeWidth={1.5} />
        </IconButton>
      </Box>

      <Box sx={styles.body}>
        <TextField
          label={`${COMPOSITION_MODAL_LABELS.name} *`}
          value={composition.name}
          onChange={(event) => updateField('name', event.target.value)}
          error={Boolean(titleError)}
          helperText={titleError}
          fullWidth
          size="small"
          sx={styles.field}
          InputProps={{
            endAdornment: composition.name ? (
              <InputAdornment position="end">
                <IconButton aria-label="Очистити" size="small" onClick={() => updateField('name', '')}>
                  <X size={18} strokeWidth={1.5} />
                </IconButton>
              </InputAdornment>
            ) : null
          }}
        />

        <Box sx={styles.fieldsRow}>
          <TextField
            label={COMPOSITION_MODAL_LABELS.genre}
            value={composition.genre}
            onChange={(event) => updateField('genre', event.target.value)}
            size="small"
            sx={styles.field}
          />
          <TextField
            label={COMPOSITION_MODAL_LABELS.year}
            value={composition.year}
            onChange={(event) => updateField('year', event.target.value)}
            size="small"
            sx={styles.field}
          />
        </Box>

        <Box sx={styles.mediaSection}>
          <Box sx={styles.mediaHeader}>
            <Typography sx={styles.mediaTitle}>{COMPOSITION_MODAL_LABELS.audio}</Typography>
            <Box sx={styles.mediaDivider} />
            <Button variant="filled" size="small" color="primary" onClick={() => setMediaTarget({ field: 'audios' })}>
              {COMPOSITION_MODAL_LABELS.addAudio}
            </Button>
          </Box>

          {composition.audios.map((audio) => (
            <Box key={audio.id} sx={styles.fileChip}>
              <Music size={20} strokeWidth={1.5} />
              <Typography sx={styles.fileChipName}>{audio.name || fileNameFromUrl(audio.fileUrl)}</Typography>
              <IconButton
                aria-label="Видалити"
                onClick={() => removeMediaRow('audios', audio.id)}
                sx={styles.mediaIcon}
              >
                <Trash2 size={20} strokeWidth={1.5} />
              </IconButton>
            </Box>
          ))}
        </Box>

        <Box sx={styles.mediaSection}>
          <Box sx={styles.mediaHeader}>
            <Typography sx={styles.mediaTitle}>{COMPOSITION_MODAL_LABELS.notes}</Typography>
            <Box sx={styles.mediaDivider} />
            <Button variant="filled" size="small" color="primary" onClick={addNoteRow}>
              {COMPOSITION_MODAL_LABELS.addNotes}
            </Button>
          </Box>

          {composition.notes.map((note) => (
            <Box key={note.id} sx={styles.noteGroup}>
              <Box sx={styles.mediaRow}>
                <TextField
                  label={`${COMPOSITION_MODAL_LABELS.notesName} *`}
                  placeholder={COMPOSITION_MODAL_LABELS.notesNamePlaceholder}
                  value={note.name}
                  onChange={(event) => updateNoteRow(note.id, { name: event.target.value })}
                  size="small"
                  sx={styles.mediaNameField}
                />
                <TextField
                  label={`${COMPOSITION_MODAL_LABELS.publishDate} *`}
                  value={note.publishDate ?? ''}
                  onChange={(event) => updateNoteRow(note.id, { publishDate: event.target.value })}
                  size="small"
                  sx={styles.mediaDateField}
                />
                <IconButton
                  aria-label="Завантажити файл"
                  onClick={() => setMediaTarget({ field: 'notes', rowId: note.id })}
                  sx={styles.mediaIcon}
                >
                  <CloudUpload size={20} strokeWidth={1.5} />
                </IconButton>
                <IconButton
                  aria-label="Видалити"
                  onClick={() => removeMediaRow('notes', note.id)}
                  sx={styles.mediaIcon}
                >
                  <Trash2 size={20} strokeWidth={1.5} />
                </IconButton>
              </Box>

              {note.fileUrl && (
                <Box sx={styles.fileChip}>
                  <FileText size={20} strokeWidth={1.5} />
                  <Typography sx={styles.fileChipName}>{fileNameFromUrl(note.fileUrl)}</Typography>
                  <IconButton aria-label="Видалити файл" onClick={() => clearNoteFile(note.id)} sx={styles.mediaIcon}>
                    <Trash2 size={20} strokeWidth={1.5} />
                  </IconButton>
                </Box>
              )}
            </Box>
          ))}
        </Box>

        {!hasFiles && (
          <Box sx={styles.noticeBanner}>
            <Box sx={styles.noticeIcon}>
              <Info size={20} strokeWidth={1.5} />
            </Box>
            <Typography sx={styles.noticeText}>{COMPOSITION_MODAL_LABELS.emptyFilesNotice}</Typography>
          </Box>
        )}
      </Box>

      <Box sx={styles.actions}>
        <Button variant="outlined" size="medium" color="primary" onClick={onClose}>
          {COMPOSITION_MODAL_LABELS.cancel}
        </Button>
        <Button variant="filled" size="medium" color="tertiary" onClick={handleSubmit}>
          {mode === 'edit' ? COMPOSITION_MODAL_LABELS.save : COMPOSITION_MODAL_LABELS.create}
        </Button>
      </Box>

      <MediaModal
        open={Boolean(mediaTarget)}
        initial={{ tab: 'GALLERY' }}
        onClose={() => setMediaTarget(null)}
        onApply={handleMediaApply}
        directory={isAudioTarget ? 'compositions' : 'uploads'}
        mediaKind={isAudioTarget ? 'audio' : 'pdf'}
        accept={isAudioTarget ? 'audio/*' : 'application/pdf'}
        isAllowedFile={isAudioTarget ? isAudioUploadFile : isPdfUploadFile}
        invalidFileError={isAudioTarget ? 'Підтримуються лише аудіофайли' : 'Підтримуються лише PDF-файли'}
        uploadAriaLabel={isAudioTarget ? 'Завантажити аудіофайл' : 'Завантажити PDF-файл'}
      />
    </Dialog>
  );
}
