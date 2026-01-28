'use client';

import { Box, Typography } from '@mui/material';
import type { ChangeEvent, DragEvent, KeyboardEvent, MouseEvent } from 'react';
import { useCallback, useId, useRef, useState } from 'react';

import type { UploadMedia } from '../../MediaModal.types';
import { styles } from './UploadView.styles';
import CloudUploadIcon from '~/public/icons/cloud-upload.svg';
import Button from '~/shared/components/design-system/button/Button';

type Props = Readonly<{
  selected: UploadMedia | null;
  onPick: (selected: UploadMedia) => void;
}>;

const DROP_HINT = 'Перетягніть файл сюди або оберіть вручну';
const ERROR_ONLY_IMAGES = 'Підтримуються лише зображення';

const isImageFile = (file: File): boolean => {
  if (file.type) return file.type.startsWith('image/');
  return /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(file.name);
};

const buildUploadId = (file: File): string => `${file.lastModified}-${file.size}-${file.name}`;

export function UploadView({ onPick }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const messageId = useId();

  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const openPicker = useCallback(() => {
    setError(null);
    inputRef.current?.click();
  }, []);

  const pickFile = useCallback(
    (file: File) => {
      if (!isImageFile(file)) {
        setError(ERROR_ONLY_IMAGES);
        return;
      }

      setError(null);

      onPick({
        kind: 'upload',
        id: buildUploadId(file),
        fileName: file.name,
        file
      });
    },
    [onPick]
  );

  const handleFileChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.currentTarget.files?.[0];
      if (!file) return;

      e.currentTarget.value = '';

      pickFile(file);
    },
    [pickFile]
  );

  const handleDragEnter = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    setError(null);
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const next = e.relatedTarget;
    if (next instanceof Node && e.currentTarget.contains(next)) return;

    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    e.dataTransfer.dropEffect = 'copy';
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();

      setIsDragging(false);

      const file = e.dataTransfer.files?.[0];
      if (file) pickFile(file);
    },
    [pickFile]
  );

  const handleDropzoneKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openPicker();
      }
    },
    [openPicker]
  );

  const handleChooseClick = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      openPicker();
    },
    [openPicker]
  );

  const hasError = Boolean(error);
  const message = error ?? DROP_HINT;

  return (
    <Box data-testid="UploadView" sx={styles.root}>
      <Box
        component="div"
        data-testid="UploadView-dropzone"
        role="button"
        tabIndex={0}
        aria-label="Upload image"
        aria-describedby={messageId}
        sx={styles.dropzone(isDragging, hasError)}
        onClick={openPicker}
        onKeyDown={handleDropzoneKeyDown}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <Box sx={styles.center}>
          <Box sx={styles.iconWrap(hasError)}>
            <CloudUploadIcon aria-hidden focusable={false} />
          </Box>

          <Typography
            id={messageId}
            role={hasError ? 'alert' : undefined}
            sx={[styles.text, hasError && styles.textError]}
            data-testid="UploadView-text"
          >
            {message}
          </Typography>

          <Button
            color="secondary"
            variant="filled"
            label="Обрати файл"
            data-testid="UploadView-chooseFileButton"
            onClick={handleChooseClick}
          />
        </Box>
      </Box>

      <input
        ref={inputRef}
        hidden
        type="file"
        accept="image/*"
        data-testid="UploadView-fileInput"
        onChange={handleFileChange}
      />
    </Box>
  );
}

export default UploadView;
