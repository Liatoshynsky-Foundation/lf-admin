'use client';

import { Box, Typography } from '@mui/material';
import type { ChangeEvent, DragEvent, KeyboardEvent, MouseEvent } from 'react';
import { useCallback, useId, useRef, useState } from 'react';

import {
  IMAGE_MAX_FILE_SIZE_BYTES,
  IMAGE_RECOMMENDED_FILE_SIZE_BYTES,
  IMAGE_UPLOAD_ERROR,
  IMAGE_UPLOAD_SIZE_WARNING
} from '../../MediaModal.constants';
import type { UploadMedia } from '../../MediaModal.types';
import { isImageUploadFile } from '../../MediaModal.utils';
import { styles } from './UploadView.styles';
import CloudUploadIcon from '~/public/icons/cloud-upload.svg';
import Button from '~/shared/components/design-system/button/Button';

export type Props = Readonly<{
  selected: UploadMedia | null;
  onPick: (selected: UploadMedia) => void;
  accept?: string;
  invalidFileError?: string;
  isAllowedFile?: (file: File) => boolean;
  ariaLabel?: string;
  maxSizeBytes?: number;
  fileTooLargeError?: string;
}>;

const DROP_HINT = 'Перетягніть файл сюди або оберіть вручну';
const ERROR_FILE_TOO_LARGE = 'Файл перевищує максимально допустимий розмір';
const ERROR_IMAGE_UNREADABLE = 'Не вдалося прочитати зображення';

const buildUploadId = (file: File): string => `${file.lastModified}-${file.size}-${file.name}`;

type ImageReadResult = 'valid' | 'unreadable';

const checkImageReadable = (file: File): Promise<ImageReadResult> => {
  if (typeof Image === 'undefined' || typeof URL.createObjectURL !== 'function') {
    return Promise.resolve('valid');
  }

  return new Promise((resolve) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve('valid');
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve('unreadable');
    };
    image.src = objectUrl;
  });
};

export function UploadView({
  onPick,
  accept = 'image/*',
  invalidFileError = IMAGE_UPLOAD_ERROR,
  isAllowedFile = isImageUploadFile,
  ariaLabel = 'Upload image',
  maxSizeBytes,
  fileTooLargeError = ERROR_FILE_TOO_LARGE
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const messageId = useId();

  const [error, setError] = useState<string | null>(null);
  const [warningFile, setWarningFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const openPicker = useCallback(() => {
    setError(null);
    setWarningFile(null);
    inputRef.current?.click();
  }, []);

  const acceptFile = useCallback(
    (file: File) => {
      setError(null);
      setWarningFile(null);

      onPick({
        kind: 'upload',
        id: buildUploadId(file),
        fileName: file.name,
        file
      });
    },
    [onPick]
  );

  const pickFile = useCallback(
    async (file: File, skipSizeWarning = false) => {
      setWarningFile(null);

      if (!isAllowedFile(file)) {
        setError(invalidFileError);
        return;
      }

      const isImageFile = isImageUploadFile(file);
      const effectiveMaxSizeBytes = maxSizeBytes ?? (isImageFile ? IMAGE_MAX_FILE_SIZE_BYTES : undefined);
      const effectiveFileTooLargeError = !maxSizeBytes && isImageFile ? IMAGE_UPLOAD_ERROR : fileTooLargeError;

      if (effectiveMaxSizeBytes && file.size > effectiveMaxSizeBytes) {
        setError(effectiveFileTooLargeError);
        return;
      }

      if (isImageFile && !skipSizeWarning && file.size > IMAGE_RECOMMENDED_FILE_SIZE_BYTES) {
        setError(null);
        setWarningFile(file);
        return;
      }

      if (isImageFile) {
        const readResult = await checkImageReadable(file);

        if (readResult === 'unreadable') {
          setError(ERROR_IMAGE_UNREADABLE);
          return;
        }
      }

      acceptFile(file);
    },
    [acceptFile, invalidFileError, isAllowedFile, maxSizeBytes, fileTooLargeError]
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
    setWarningFile(null);
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
      if (e.target !== e.currentTarget) return;

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

  const handleContinueClick = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      if (warningFile) {
        void pickFile(warningFile, true);
      }
    },
    [pickFile, warningFile]
  );

  const hasError = Boolean(error);
  const hasWarning = Boolean(warningFile);
  const message = error ?? (hasWarning ? IMAGE_UPLOAD_SIZE_WARNING : DROP_HINT);
  const warningRole = hasWarning ? 'status' : undefined;
  const messageRole = hasError ? 'alert' : warningRole;

  return (
    <Box data-testid="UploadView" sx={styles.root}>
      <Box
        component="div"
        data-testid="UploadView-dropzone"
        role="button"
        tabIndex={0}
        aria-label={ariaLabel}
        aria-describedby={messageId}
        sx={styles.dropzone(isDragging, hasError, hasWarning)}
        onClick={openPicker}
        onKeyDown={handleDropzoneKeyDown}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <Box sx={styles.center}>
          <Box sx={styles.iconWrap(hasError, hasWarning)}>
            <CloudUploadIcon aria-hidden focusable={false} />
          </Box>

          <Typography
            variant='bodyMd'
            id={messageId}
            role={messageRole}
            sx={[styles.text, hasError && styles.textError, hasWarning && styles.textWarning]}
            data-testid="UploadView-text"
          >
            {message}
          </Typography>

          <Box sx={styles.actions}>
            {hasWarning ? (
              <Button
                color="tertiary"
                variant="filled"
                label="Продовжити"
                data-testid="UploadView-continueButton"
                onClick={handleContinueClick}
              />
            ) : null}

            <Button
              color="secondary"
              variant="filled"
              label={hasWarning ? 'Обрати інший файл' : 'Обрати файл'}
              data-testid="UploadView-chooseFileButton"
              onClick={handleChooseClick}
            />
          </Box>
        </Box>
      </Box>

      <input
        ref={inputRef}
        hidden
        type="file"
        accept={accept}
        data-testid="UploadView-fileInput"
        onChange={handleFileChange}
      />
    </Box>
  );
}

export default UploadView;
