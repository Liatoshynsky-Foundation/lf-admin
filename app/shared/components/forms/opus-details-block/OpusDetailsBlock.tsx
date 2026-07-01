'use client';

import { Box, Dialog, IconButton, MenuItem, TextField, Typography } from '@mui/material';
import { GripVertical, Pencil, Trash2, X } from 'lucide-react';
import { useState } from 'react';

import CompositionModal from './composition-modal/CompositionModal';
import CompositionTitleInput from './composition-title-input/CompositionTitleInput';
import { styles } from './OpusDetailsBlock.styles';
import YearPicker from './year-picker/YearPicker';
import Button from '~/components/design-system/button/Button';
import { OPUS_DELETE_MODAL, OPUS_DETAILS_LABELS, OPUS_FIELD_LIMITS, OPUS_NUMBER_KIND_OPTIONS } from '~/constants/opus';
import { createCompositionId } from '~/shared/hooks/use-upsert-opus/useUpsertOpus';
import type { OpusCompositionData, OpusCompositionSuggestion, OpusDetailsErrors, OpusDetailsValue } from '~/types/opus';

const fileNameFromUrl = (url?: string | null): string => {
  if (!url) {
    return '';
  }

  const segment = url.split('/').pop() ?? url;

  return decodeURIComponent(segment.split('?')[0]);
};

interface OpusDetailsBlockProps {
  value: OpusDetailsValue;
  onChange: (updater: (prev: OpusDetailsValue) => OpusDetailsValue) => void;
  errors: OpusDetailsErrors;
}

export default function OpusDetailsBlock({ value, onChange, errors }: Readonly<OpusDetailsBlockProps>) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingComposition, setEditingComposition] = useState<OpusCompositionData | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);

  const updateField = <Key extends keyof OpusDetailsValue>(key: Key, fieldValue: OpusDetailsValue[Key]): void => {
    onChange((prev) => ({ ...prev, [key]: fieldValue }));
  };

  const addComposition = (): void => {
    onChange((prev) => ({
      ...prev,
      compositions: [
        ...prev.compositions,
        { id: createCompositionId(), title: '', genre: '', year: '', audios: [], notes: [] }
      ]
    }));
  };

  const updateCompositionTitle = (id: string, title: string): void => {
    onChange((prev) => ({
      ...prev,
      compositions: prev.compositions.map((item) => (item.id === id ? { ...item, title } : item))
    }));
  };

  const fillComposition = (id: string, suggestion: OpusCompositionSuggestion): void => {
    onChange((prev) => ({
      ...prev,
      compositions: prev.compositions.map((item) =>
        item.id === id
          ? {
            ...item,
            compositionId: suggestion.id,
            title: suggestion.title?.uk ?? suggestion.title?.en ?? '',
            genre: suggestion.genre ?? '',
            year: suggestion.year != null ? String(suggestion.year) : '',
            audios: (suggestion.audios ?? []).map((audio) => ({
              id: createCompositionId(),
              name: audio.name ?? fileNameFromUrl(audio.url),
              fileUrl: audio.url ?? undefined
            })),
            notes: (suggestion.sheetMusic ?? []).map((sheet) => ({
              id: createCompositionId(),
              name: sheet.name ?? fileNameFromUrl(sheet.url),
              fileUrl: sheet.url ?? undefined,
              publishDate: sheet.publishDate ?? ''
            }))
          }
          : item
      )
    }));
  };

  const openEditModal = (composition: OpusCompositionData): void => {
    setModalMode('edit');
    setEditingComposition(composition);
    setIsModalOpen(true);
  };

  const openCreateModal = (composition: OpusCompositionData): void => {
    setModalMode('create');
    setEditingComposition(composition);
    setIsModalOpen(true);
  };

  const handleModalSubmit = (composition: OpusCompositionData): void => {
    onChange((prev) => ({
      ...prev,
      compositions: prev.compositions.map((item) => (item.id === composition.id ? composition : item))
    }));
    setIsModalOpen(false);
  };

  const handleDeleteConfirm = (): void => {
    if (deleteTargetId) {
      onChange((prev) => ({
        ...prev,
        compositions: prev.compositions.filter((item) => item.id !== deleteTargetId)
      }));
    }

    setDeleteTargetId(null);
  };

  const moveComposition = (from: number, to: number): void => {
    onChange((prev) => {
      if (from === to || from < 0 || to < 0 || from >= prev.compositions.length || to >= prev.compositions.length) {
        return prev;
      }

      const compositions = [...prev.compositions];
      const [moved] = compositions.splice(from, 1);
      compositions.splice(to, 0, moved);

      return { ...prev, compositions };
    });
  };

  const handleDragEnter = (index: number): void => {
    if (draggingIndex === null || draggingIndex === index) {
      return;
    }

    moveComposition(draggingIndex, index);
    setDraggingIndex(index);
  };

  const handleDragEnd = (): void => {
    setDraggingIndex(null);
  };

  return (
    <Box sx={styles.container}>
      <Box sx={styles.fieldsRow}>
        <TextField
          select
          label={OPUS_DETAILS_LABELS.numberKind}
          value={value.numberKind}
          onChange={(event) => updateField('numberKind', event.target.value as OpusDetailsValue['numberKind'])}
          sx={styles.kindField}
          slotProps={{ select: { MenuProps: { disableScrollLock: true } } }}
        >
          {OPUS_NUMBER_KIND_OPTIONS.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          label={`${OPUS_DETAILS_LABELS.number} *`}
          value={value.number}
          onChange={(event) => updateField('number', event.target.value)}
          error={Boolean(errors.number)}
          helperText={errors.number}
          sx={styles.numberField}
          slotProps={{ htmlInput: { inputMode: 'numeric' } }}
        />

        <TextField
          label={OPUS_DETAILS_LABELS.additionalText}
          value={value.additionalText}
          onChange={(event) => updateField('additionalText', event.target.value)}
          sx={styles.noteField}
          slotProps={{ htmlInput: { maxLength: OPUS_FIELD_LIMITS.additionalText } }}
        />
      </Box>

      <TextField
        label={`${OPUS_DETAILS_LABELS.name} *`}
        value={value.name}
        onChange={(event) => updateField('name', event.target.value)}
        error={Boolean(errors.name)}
        helperText={errors.name}
        sx={styles.nameField}
        slotProps={{ htmlInput: { maxLength: OPUS_FIELD_LIMITS.name.max } }}
      />

      <Box sx={styles.fieldsRow}>
        <YearPicker
          label={`${OPUS_DETAILS_LABELS.creationYear} *`}
          value={value.creationYear}
          onChange={(year) => updateField('creationYear', year)}
          error={Boolean(errors.creationYear)}
          helperText={errors.creationYear}
          sx={styles.field}
        />
        <Box sx={styles.yearSeparator}>–</Box>
        <YearPicker
          label={OPUS_DETAILS_LABELS.endYear}
          value={value.endYear}
          onChange={(year) => updateField('endYear', year)}
          sx={styles.field}
        />
        <TextField
          label={OPUS_DETAILS_LABELS.datesNote}
          value={value.datesNote}
          onChange={(event) => updateField('datesNote', event.target.value)}
          sx={styles.field}
          slotProps={{ htmlInput: { maxLength: OPUS_FIELD_LIMITS.datesNote } }}
        />
        <TextField
          label={OPUS_DETAILS_LABELS.genre}
          value={value.genre}
          onChange={(event) => updateField('genre', event.target.value)}
          sx={styles.genreField}
          slotProps={{ htmlInput: { maxLength: OPUS_FIELD_LIMITS.genre } }}
        />
      </Box>

      <Box sx={styles.compositionsHeader}>
        <Typography sx={styles.compositionsTitle}>{OPUS_DETAILS_LABELS.compositions}</Typography>
        <Box sx={styles.compositionsDivider} />
        <Button variant="filled" size="small" color="primary" onClick={addComposition}>
          {OPUS_DETAILS_LABELS.addComposition}
        </Button>
      </Box>

      <Box sx={styles.compositionsList}>
        {value.compositions.map((composition, index) => (
          <Box
            key={composition.id}
            sx={{
              ...(styles.compositionRow as object),
              ...(draggingIndex === index ? (styles.compositionRowDragging as object) : {})
            }}
            onDragEnter={() => handleDragEnter(index)}
            onDragOver={(event) => event.preventDefault()}
          >
            <Box
              draggable
              onDragStart={() => setDraggingIndex(index)}
              onDragEnd={handleDragEnd}
              sx={styles.dragHandle}
              aria-label="Перемістити"
            >
              <GripVertical size={20} strokeWidth={1.5} />
            </Box>
            <Box sx={styles.compositionInput}>
              <CompositionTitleInput
                value={composition.title}
                onChangeText={(title) => updateCompositionTitle(composition.id, title)}
                onSelectSuggestion={(suggestion) => fillComposition(composition.id, suggestion)}
                onCreateNew={() => openCreateModal(composition)}
              />
            </Box>
            <IconButton aria-label="Редагувати" onClick={() => openEditModal(composition)} sx={styles.rowIcon}>
              <Pencil size={18} strokeWidth={1.5} />
            </IconButton>
            <IconButton aria-label="Видалити" onClick={() => setDeleteTargetId(composition.id)} sx={styles.rowIcon}>
              <Trash2 size={18} strokeWidth={1.5} />
            </IconButton>
          </Box>
        ))}
      </Box>

      <CompositionModal
        open={isModalOpen}
        mode={modalMode}
        initialValue={editingComposition}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
      />

      <Dialog
        open={Boolean(deleteTargetId)}
        onClose={() => setDeleteTargetId(null)}
        disableScrollLock
        PaperProps={{ sx: styles.deletePaper }}
      >
        <Box sx={styles.deleteHeader}>
          <Typography sx={styles.deleteTitle}>{OPUS_DELETE_MODAL.title}</Typography>
          <IconButton aria-label="Закрити" onClick={() => setDeleteTargetId(null)}>
            <X size={24} strokeWidth={1.5} />
          </IconButton>
        </Box>
        <Typography sx={styles.deleteDescription}>{OPUS_DELETE_MODAL.description}</Typography>
        <Box sx={styles.deleteActions}>
          <Button
            variant="filled"
            size="medium"
            color="secondary"
            onClick={handleDeleteConfirm}
            sx={styles.deleteButton}
          >
            {OPUS_DELETE_MODAL.confirm}
          </Button>
          <Button variant="outlined" size="medium" color="primary" onClick={() => setDeleteTargetId(null)}>
            {OPUS_DELETE_MODAL.cancel}
          </Button>
        </Box>
      </Dialog>
    </Box>
  );
}
