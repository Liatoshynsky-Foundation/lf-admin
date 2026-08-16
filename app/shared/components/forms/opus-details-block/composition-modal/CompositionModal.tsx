'use client';

import { Box, Dialog, IconButton, InputAdornment, TextField, Typography } from '@mui/material';
import { CloudUpload, FileText, Info, Music, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';

import { styles } from './CompositionModal.styles';
import Button from '~/components/design-system/button/Button';
import {
  COMPOSITION_GENRE_LIMITS,
  COMPOSITION_MODAL_LABELS,
  COMPOSITION_MODAL_TEXTS,
  COMPOSITION_TITLE_LIMITS
} from '~/constants/opus';
import { MediaModal } from '~/shared/components/media-modal/MediaModal';
import type { MediaModalResult } from '~/shared/components/media-modal/MediaModal.types';
import { isAudioUploadFile, isPdfUploadFile } from '~/shared/components/media-modal/MediaModal.utils';
import { createCompositionId } from '~/shared/hooks/use-upsert-opus/useUpsertOpus';
import type { OpusCompositionData, OpusMediaFileData } from '~/types/opus';
import { compositionGenreSchema, compositionTitleSchema } from '~/validators/composition.schema';

interface CompositionModalProps {
  open: boolean;
  mode: 'create' | 'edit';
  initialValue?: OpusCompositionData | null;
  onClose: () => void;
  onSubmit: (composition: OpusCompositionData) => void;
  error?: string | null;
  onClearError?: () => void;
}

type MediaTarget = { field: 'audios' | 'notes'; rowId?: string };
type NoteErrors = { [rowId: string]: { name?: string; publishDate?: string } };

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
  onSubmit,
  error,
  onClearError
}: Readonly<CompositionModalProps>) {
  const [composition, setComposition] = useState<OpusCompositionData>(emptyComposition);
  const [titleError, setTitleError] = useState('');
  const [genreError, setGenreError] = useState('');
  const [noteErrors, setNoteErrors] = useState<NoteErrors>({});
  const [mediaTarget, setMediaTarget] = useState<MediaTarget | null>(null);

  useEffect(() => {
    if (open) {
      setComposition(initialValue ? { ...initialValue } : emptyComposition());
      setTitleError('');
      setGenreError('');
      setNoteErrors({});
      setMediaTarget(null);
    }
  }, [open, initialValue]);

  const updateField = <Key extends keyof OpusCompositionData>(key: Key, value: OpusCompositionData[Key]): void => {
    setComposition((prev) => ({ ...prev, [key]: value }));

    if (key === 'name' && typeof value === 'string' && value.trim()) {
      setTitleError('');
      onClearError?.();
    }

    if (key === 'genre' && typeof value === 'string') {
      setGenreError('');
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

    setNoteErrors((prev) => {
      const updated = { ...prev };
      if (updated[id]) {
        if ('name' in patch) delete updated[id].name;
        if ('publishDate' in patch) delete updated[id].publishDate;
        if (Object.keys(updated[id]).length === 0) delete updated[id];
      }
      return updated;
    });
  };

  const removeMediaRow = (field: 'audios' | 'notes', id: string): void => {
    setComposition((prev) => ({ ...prev, [field]: prev[field].filter((row) => row.id !== id) }));
    if (field === 'notes') {
      setNoteErrors((prev) => {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      });
    }
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
    let isValid = true;
    let newTitleError = '';
    let newGenreError = '';
    const newNoteErrors: NoteErrors = {};

    const titleResult = compositionTitleSchema.safeParse(composition.name);
    if (!titleResult.success) {
      newTitleError = titleResult.error.issues[0]?.message ?? '';
      isValid = false;
    }

    const genreResult = compositionGenreSchema.safeParse(composition.genre);
    if (!genreResult.success) {
      newGenreError = genreResult.error.issues[0]?.message ?? '';
      isValid = false;
    }

    composition.notes.forEach((note) => {
      const errs: { name?: string; publishDate?: string } = {};
      const noteName = note.name ?? '';
      const hasName = Boolean(noteName.trim());
      const hasDate = Boolean(note.publishDate && String(note.publishDate).trim());
      const hasFile = Boolean(note.fileUrl);

      if (hasDate && !hasName && !hasFile) {
        errs.publishDate = COMPOSITION_MODAL_TEXTS.emptyNoteDateError;
        isValid = false;
      }

      if (Object.keys(errs).length > 0) {
        newNoteErrors[note.id] = errs;
      }
    });

    setTitleError(newTitleError);
    setGenreError(newGenreError);
    setNoteErrors(newNoteErrors);

    if (!isValid) {
      return;
    }

    const filteredNotes = composition.notes.filter(
      (note) => (note.name ?? '').trim() || (note.publishDate && String(note.publishDate).trim()) || note.fileUrl
    );

    onSubmit({ ...composition, name: composition.name.trim(), notes: filteredNotes });
  };

  const hasFiles = composition.audios.length > 0 || composition.notes.some((note) => Boolean(note.fileUrl));
  const isAudioTarget = mediaTarget?.field === 'audios';

  return (
    <Dialog open={open} onClose={onClose} disableScrollLock PaperProps={{ sx: styles.paper }}>
      <Box sx={styles.header}>
        <Typography sx={styles.heading}>
          {mode === 'edit' ? COMPOSITION_MODAL_LABELS.editTitle : COMPOSITION_MODAL_LABELS.createTitle}
        </Typography>
        <IconButton aria-label={COMPOSITION_MODAL_TEXTS.closeAriaLabel} onClick={onClose} sx={styles.closeButton}>
          <X size={24} strokeWidth={1.5} />
        </IconButton>
      </Box>

      <Box sx={styles.body}>
        <TextField
          label={`${COMPOSITION_MODAL_LABELS.name} *`}
          value={composition.name}
          onChange={(event) => updateField('name', event.target.value.slice(0, COMPOSITION_TITLE_LIMITS.max))}
          error={Boolean(titleError || error)}
          helperText={titleError || error}
          fullWidth
          size="small"
          sx={styles.field}
          slotProps={{ htmlInput: { maxLength: COMPOSITION_TITLE_LIMITS.max } }}
          InputProps={{
            endAdornment: composition.name ? (
              <InputAdornment position="end">
                <IconButton
                  aria-label={COMPOSITION_MODAL_TEXTS.clearAriaLabel}
                  size="small"
                  onClick={() => updateField('name', '')}
                >
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
            onChange={(event) => updateField('genre', event.target.value.slice(0, COMPOSITION_GENRE_LIMITS.max))}
            error={Boolean(genreError)}
            helperText={genreError}
            size="small"
            sx={styles.field}
            slotProps={{ htmlInput: { maxLength: COMPOSITION_GENRE_LIMITS.max } }}
          />
          <TextField
            label={COMPOSITION_MODAL_LABELS.year}
            value={composition.year}
            onChange={(event) => {
              const val = event.target.value;
              if (/^\d*$/.test(val)) {
                updateField('year', val);
              }
            }}
            size="small"
            sx={styles.field}
          />
        </Box>

        <Box sx={styles.mediaSection}>
          <Box sx={styles.mediaHeader}>
            <Typography sx={styles.mediaTitle}>{COMPOSITION_MODAL_LABELS.audio}</Typography>
            <Box sx={styles.mediaDivider} />
            <Button
              variant="filled"
              size="small"
              color="primary"
              disabled={composition.audios.length > 0}
              onClick={() => setMediaTarget({ field: 'audios' })}
            >
              {COMPOSITION_MODAL_LABELS.addAudio}
            </Button>
          </Box>

          {composition.audios.map((audio) => (
            <Box key={audio.id} sx={styles.fileChip}>
              <Music size={20} strokeWidth={1.5} />
              <Typography sx={styles.fileChipName}>{audio.name || fileNameFromUrl(audio.fileUrl)}</Typography>
              <IconButton
                aria-label={COMPOSITION_MODAL_TEXTS.deleteAriaLabel}
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

          {composition.notes.map((note) => {
            const errs = noteErrors[note.id] || {};

            return (
              <Box key={note.id} sx={styles.noteGroup}>
                <Box sx={styles.mediaRow}>
                  <TextField
                    label={COMPOSITION_MODAL_LABELS.notesName}
                    placeholder={COMPOSITION_MODAL_LABELS.notesNamePlaceholder}
                    value={note.name ?? ''}
                    onChange={(event) => updateNoteRow(note.id, { name: event.target.value })}
                    error={Boolean(errs.name)}
                    helperText={errs.name}
                    size="small"
                    sx={styles.mediaNameField}
                  />
                  <TextField
                    label={COMPOSITION_MODAL_LABELS.publishDate}
                    value={note.publishDate ?? ''}
                    onChange={(event) => {
                      const val = event.target.value;
                      if (/^\d*$/.test(val)) {
                        updateNoteRow(note.id, { publishDate: val });
                      }
                    }}
                    error={Boolean(errs.publishDate)}
                    helperText={errs.publishDate}
                    size="small"
                    sx={styles.mediaDateField}
                  />
                  <IconButton
                    aria-label={COMPOSITION_MODAL_TEXTS.uploadFileAriaLabel}
                    onClick={() => setMediaTarget({ field: 'notes', rowId: note.id })}
                    sx={styles.mediaIconBtn}
                  >
                    <CloudUpload size={20} strokeWidth={1.5} />
                  </IconButton>
                  <IconButton
                    aria-label={COMPOSITION_MODAL_TEXTS.deleteAriaLabel}
                    onClick={() => removeMediaRow('notes', note.id)}
                    sx={styles.mediaIconBtn}
                  >
                    <Trash2 size={20} strokeWidth={1.5} />
                  </IconButton>
                </Box>

                {note.fileUrl && (
                  <Box sx={styles.fileChip}>
                    <FileText size={20} strokeWidth={1.5} />
                    <Typography sx={styles.fileChipName}>{fileNameFromUrl(note.fileUrl)}</Typography>
                    <IconButton
                      aria-label={COMPOSITION_MODAL_TEXTS.deleteFileAriaLabel}
                      onClick={() => clearNoteFile(note.id)}
                      sx={styles.mediaIcon}
                    >
                      <Trash2 size={20} strokeWidth={1.5} />
                    </IconButton>
                  </Box>
                )}
              </Box>
            );
          })}
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
        invalidFileError={
          isAudioTarget ? COMPOSITION_MODAL_TEXTS.audioUploadError : COMPOSITION_MODAL_TEXTS.pdfUploadError
        }
        uploadAriaLabel={
          isAudioTarget ? COMPOSITION_MODAL_TEXTS.uploadAudioAria : COMPOSITION_MODAL_TEXTS.uploadPdfAria
        }
      />
    </Dialog>
  );
}
