import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  SxProps,
  TextField,
  Theme
} from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs, { Dayjs } from 'dayjs';
import React, { useState } from 'react';

import Alert from '../../design-system/alert/Alert';
import ActionableSuggestItem from '../actionable-suggest-item/ActionableSuggestItem';
import FileItem from '../file-item/FileItem';
import LabelActionRow from '../label-action-row/LabelActionRow';
import { styles } from './CompositionModalView.styles';
import { AudioEntry, CompositionFileType, NoteEntry } from '~/constants/creativity';
import { sxToArray } from '~/lib/utils/sxToArray';

type Entry = AudioEntry | NoteEntry;

export interface CompositionModeSection extends Pick<CompositionModalViewProps, 'onTriggerUpload'> {
  mode: 'audio' | 'notes';
  title: string;
  entries: Entry[];
  suggestions: string[];
  fileType: CompositionFileType;
  onAdd: () => void;
  onUpdate: (id: string, updatedData: Partial<Entry>) => void;
  onDelete: (id: string) => void;
}

export interface CompositionModalViewProps {
  dialogTitle?: string;
  isOpen: boolean;
  isLoadingData: boolean;
  suggestions: { audio: string[]; notes: string[] };
  onClose: () => void;
  onTriggerUpload: (mode: 'audio' | 'notes', onSuccess: (fileName: string) => void) => void;
  onSave: (title: string, genre: string, year: Dayjs | null, audio: AudioEntry[], notes: NoteEntry[]) => Promise<void>;
  sx?: SxProps<Theme>;
}

export const CompositionModalView: React.FC<CompositionModalViewProps> = ({
  dialogTitle = 'Нова композиція',
  isOpen,
  isLoadingData,
  suggestions,
  onClose,
  onTriggerUpload,
  onSave,
  sx
}) => {
  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState('');
  const [year, setYear] = useState<Dayjs | null>(null);

  const [audioEntries, setAudioEntries] = useState<AudioEntry[]>([]);
  const [noteEntries, setNoteEntries] = useState<NoteEntry[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const [showAlert, setShowAlert] = useState(true);

  const handleUpdateAudio = (id: string, updates: Partial<AudioEntry>) => {
    setAudioEntries((prev) => prev.map((e) => (e.id === id ? { ...e, ...updates } : e)));
  };

  const handleUpdateNote = (id: string, updates: Partial<NoteEntry>) => {
    setNoteEntries((prev) => prev.map((e) => (e.id === id ? { ...e, ...updates } : e)));
  };

  const clearInput = () => {
    setIsSaving(false);

    setTitle('');
    setGenre('');
    setYear(null);
    setAudioEntries([]);
    setNoteEntries([]);
    setShowAlert(true);
    onClose();
  };

  const handleCancel = () => {
    onClose();
    clearInput();

  };

  const handleSave = async () => {
    setIsSaving(true);
    await onSave(title, genre, year, audioEntries, noteEntries);
    clearInput();
  };

  const validateYear = (year: Dayjs) => year > dayjs('1900') && year < dayjs();

  if (isLoadingData) return null;

  const sections: ReadonlyArray<CompositionModeSection> = [
    {
      mode: 'audio' as const,
      title: 'Аудіо',
      entries: audioEntries,
      suggestions: suggestions.audio,
      fileType: 'audio',
      onAdd: () => setAudioEntries((prev) => [...prev, { id: crypto.randomUUID(), name: null, fileName: null }]),
      onUpdate: handleUpdateAudio,
      onDelete: (id: string) => setAudioEntries((prev) => prev.filter((e) => e.id !== id)),
      onTriggerUpload
    },
    {
      mode: 'notes' as const,
      title: 'Ноти',
      entries: noteEntries,
      suggestions: suggestions.notes,
      fileType: 'pdf',
      onAdd: () =>
        setNoteEntries((prev) => [...prev, { id: crypto.randomUUID(), name: null, date: null, fileName: null }]),
      onUpdate: handleUpdateNote,
      onDelete: (id: string) => setNoteEntries((prev) => prev.filter((e) => e.id !== id)),
      onTriggerUpload
    }
  ];

  const hasNoFiles = audioEntries.length === 0 && noteEntries.length === 0;
  const onUpload = (section: CompositionModeSection, entry: Entry) =>
    section.onTriggerUpload(section.mode, (fileName: string) => section.onUpdate(entry.id, { fileName }));

  return (
    <Dialog disableScrollLock open={isOpen} sx={{ ...styles.dialog, ...sxToArray(sx) }} onClose={onClose} fullWidth>
      <DialogTitle sx={styles.dialogTitle}>{dialogTitle}</DialogTitle>

      <DialogContent sx={styles.dialogContent}>
        <Stack spacing={4} sx={styles.contentContainer}>
          <Stack spacing={3}>
            <TextField
              label="Назва твору"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              fullWidth
            />

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={styles.genreYearRow}>
              <TextField label="Жанр" value={genre} onChange={(e) => setGenre(e.target.value)} required fullWidth />

              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="Рік *"
                  views={['year']}
                  value={year}
                  minDate={dayjs('1900')}
                  maxDate={dayjs()}
                  onChange={(newValue: Dayjs | null) => setYear(newValue)}
                  sx={styles.datePicker}
                />
              </LocalizationProvider>
            </Stack>
          </Stack>

          {sections.map((section) => (
            <Box key={section.mode}>
              <LabelActionRow title={section.title} action={section.onAdd} />

              <Stack spacing={2} sx={styles.sectionStack}>
                {section.entries.map((entry) => (
                  <Stack key={entry.id} spacing="10px">
                    <ActionableSuggestItem
                      mode={section.mode}
                      suggestions={section.suggestions}
                      value={entry.name}
                      date={'date' in entry ? entry.date : null}
                      onSelect={(val: string | null) => section.onUpdate(entry.id, { name: val })}
                      onDateChange={(val: Dayjs | null) => section.onUpdate(entry.id, { date: val })}
                      onUpload={() => onUpload(section, entry)}
                      onDelete={() => section.onDelete(entry.id)}
                    />

                    {entry.fileName && (
                      <Box sx={styles.fileItemWrapper}>
                        <FileItem
                          fileName={entry.fileName}
                          fileType={section.fileType}
                          onDelete={() => section.onUpdate(entry.id, { fileName: null })}
                        />
                      </Box>
                    )}
                  </Stack>
                ))}
              </Stack>
            </Box>
          ))}
          {hasNoFiles && showAlert && (
            <Alert
              severity="info"
              description="Додайте файли для відкритого доступу. Якщо файли не додані, користувачі зможуть зв'язатися з вами."
              onClose={() => setShowAlert(false)}
            />
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={styles.dialogActions}>
        <Button onClick={handleCancel} disabled={isSaving} variant="outlined" sx={styles.cancelButton}>
          Скасувати
        </Button>
        <Button
          variant="contained"
          color="tertiary"
          onClick={handleSave}
          disabled={!title.trim() || !genre.trim() || !year || isSaving || !validateYear(year)}
          disableElevation
          sx={styles.saveButton}
        >
          {isSaving ? 'Збереження...' : 'Зберегти'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
