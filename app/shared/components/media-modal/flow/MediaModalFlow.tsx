'use client';

import { Box, IconButton } from '@mui/material';
import React, { useCallback, useEffect, useReducer, useRef } from 'react';

import { MediaModalContainer } from '../components/container/MediaModalContainer';
import { MediaModalSwitcher } from '../components/switcher/MediaModalSwitcher';
import type { MediaModalRenderers } from '../MediaModal.renderers';
import { styles } from '../MediaModal.styles';
import type { MediaKind, MediaModalOpenState, MediaModalResult, MediaModalTab, SelectedMedia } from '../MediaModal.types';
import { isImageUploadFile } from '../MediaModal.utils';
import { FileView } from '../views/file-view/FileView';
import { buildInitialState, GalleryFilters, isSameCrop, reducer, UsedFilters } from './MediaModalFlowState';
import { useMediaModalApply } from './useMediaModalApply';
import ArrowLeftIcon from '~/public/icons/arrowLeft.svg';
import IterationIcon from '~/public/icons/iteration.svg';
import Button from '~/shared/components/design-system/button/Button';
import type { CropResult } from '~/types/common';

export type MediaModalFlowProps = {
  open: boolean;
  onClose: () => void;
  onApply: (result: MediaModalResult) => void | Promise<void>;
  initial?: MediaModalOpenState;
  renderers: MediaModalRenderers;
  directory?: string;
  hideTabs?: boolean;
  accept?: string;
  isAllowedFile?: (file: File) => boolean;
  invalidFileError?: string;
  uploadAriaLabel?: string;
  mediaKind?: MediaKind;
  aspectRatio?: number;
  persistUploadAsAsset?: boolean;
};

const GALLERY_LABELS: Record<MediaKind, string> = { image: 'Галерея', audio: 'Аудіо', pdf: 'Файли' };

const isNonImageUploadSelection = (selected: SelectedMedia | null): boolean => {
  if (selected?.kind !== 'upload') {
    return false;
  }

  return !isImageUploadFile(selected.file);
};

export function MediaModalFlow({
  open,
  onClose,
  onApply,
  initial,
  renderers,
  directory,
  hideTabs,
  accept,
  isAllowedFile,
  invalidFileError,
  uploadAriaLabel,
  mediaKind = 'image',
  aspectRatio,
  persistUploadAsAsset
}: Readonly<MediaModalFlowProps>) {
  const [state, dispatch] = useReducer(reducer, initial, buildInitialState);

  const cropEnabled = mediaKind === 'image';
  const galleryLabel = GALLERY_LABELS[mediaKind];

  const { isApplying, applyError, clearApplyState, clearApplyError, cancelInFlightApply, handleClose, runApply } =
    useMediaModalApply({ open, onClose, onApply, directory, persistUploadAsAsset });

  const latestInitialRef = useRef<MediaModalOpenState | undefined>(initial);
  useEffect(() => {
    latestInitialRef.current = initial;
  }, [initial]);

  const wasOpenRef = useRef(false);
  useEffect(() => {
    if (open && !wasOpenRef.current) {
      dispatch({ type: 'OPEN', initial: latestInitialRef.current });
      clearApplyState();
    }

    if (!open && wasOpenRef.current) {
      cancelInFlightApply();
    }

    wasOpenRef.current = open;
  }, [open, cancelInFlightApply, clearApplyState]);

  const isCrop = state.step === 'CROP';
  const selectedFileName = state.selected?.fileName ?? '';

  const hasCropChanges = !isSameCrop(state.crop, state.baselineCrop);
  const isResetDisabled = isApplying || !hasCropChanges;

  const handleTabChange = useCallback(
    (tab: MediaModalTab) => {
      if (isApplying) return;
      clearApplyError();
      dispatch({ type: 'SET_TAB', tab });
    },
    [clearApplyError, isApplying]
  );

  const pickAndCrop = useCallback(
    (selected: SelectedMedia) => {
      if (isApplying) return;
      clearApplyError();

      const shouldCrop = cropEnabled && !isNonImageUploadSelection(selected);

      if (shouldCrop) {
        dispatch({ type: 'PICK_AND_CROP', selected });
        return;
      }

      dispatch({ type: 'PICK', selected });
    },
    [clearApplyError, isApplying, cropEnabled]
  );

  const handleClearFile = useCallback(() => {
    if (isApplying) return;
    clearApplyError();
    dispatch({ type: 'OPEN', initial: latestInitialRef.current });
  }, [clearApplyError, isApplying]);

  const handleBack = useCallback(() => {
    if (isApplying) return;
    clearApplyError();
    dispatch({ type: 'BACK' });
  }, [clearApplyError, isApplying]);

  const handleResetCrop = useCallback(() => {
    if (isResetDisabled) return;
    clearApplyError();
    dispatch({ type: 'RESET_CROP' });
  }, [clearApplyError, isResetDisabled]);

  const handleCropChange = useCallback(
    (crop: CropResult | null) => {
      if (isApplying) return;
      clearApplyError();
      dispatch({ type: 'SET_CROP', crop });
    },
    [clearApplyError, isApplying]
  );

  const handleCropBaseline = useCallback(
    (crop: CropResult | null) => {
      if (isApplying) return;
      clearApplyError();
      dispatch({ type: 'SET_BASELINE_CROP', crop });
    },
    [clearApplyError, isApplying]
  );

  const handleGalleryFiltersChange = useCallback((filters: Partial<GalleryFilters>) => {
    dispatch({ type: 'SET_GALLERY_FILTERS', filters });
  }, []);

  const handleUsedFiltersChange = useCallback((filters: Partial<UsedFilters>) => {
    dispatch({ type: 'SET_USED_FILTERS', filters });
  }, []);

  const handleApply = useCallback(() => {
    if (!state.selected) return;
    if (isApplying) return;

    const result: MediaModalResult = { selected: state.selected, crop: state.crop };
    void runApply(result);
  }, [isApplying, runApply, state.crop, state.selected]);

  const isUploadFileView =
    state.tab === 'UPLOAD' && state.selected?.kind === 'upload' && isNonImageUploadSelection(state.selected);

  const canApplySelection =
    state.step === 'SELECT' && Boolean(state.selected) && (!cropEnabled || isNonImageUploadSelection(state.selected));

  const getHeaderLeftContent = () => {
    if (isCrop) {
      return (
        <Box sx={styles.cropHeader} data-testid="MediaModal-cropHeader">
          <Box sx={styles.cropHeaderTitle}>Редагування зображення</Box>
          <Box sx={styles.cropHeaderSubtitle} data-testid="MediaModal-cropHeaderFileName">
            {selectedFileName}
          </Box>
        </Box>
      );
    }

    if (hideTabs) {
      return <Box sx={styles.cropHeaderTitle}>Завантажити файл</Box>;
    }

    return null;
  };

  const headerLeft = getHeaderLeftContent();

  const headerCenter =
    isCrop || hideTabs ? null : (
      <MediaModalSwitcher value={state.tab} onChange={handleTabChange} galleryLabel={galleryLabel} />
    );

  const headerRight = isCrop ? (
    <IconButton
      aria-label="reset"
      data-testid="MediaModal-resetButton"
      sx={styles.headerIconButton}
      disabled={isResetDisabled}
      onClick={handleResetCrop}
    >
      <IterationIcon aria-hidden focusable={false} width={24} height={24} />
    </IconButton>
  ) : null;

  const footerLeft =
    isCrop || isUploadFileView ? (
      <Button
        color="secondary"
        variant="outlined"
        label="Повернутись назад"
        data-testid="MediaModal-backButton"
        sx={styles.footerBackButton}
        startIcon={<ArrowLeftIcon width={12} height={12} aria-hidden focusable={false} />}
        onClick={isCrop ? handleBack : handleClearFile}
      />
    ) : null;

  const footerRight =
    isCrop || canApplySelection ? (
      <>
        <Button
          color="secondary"
          variant="outlined"
          label="Скасувати"
          data-testid="MediaModal-cancelButton"
          onClick={onClose}
        />
        <Button
          color="tertiary"
          variant="filled"
          label="Застосувати"
          data-testid="MediaModal-applyButton"
          loading={isApplying}
          disabled={!state.selected || isApplying}
          onClick={handleApply}
        />
      </>
    ) : null;

  const renderBody = () => {
    if (isCrop) {
      if (!state.selected) return null;

      return renderers.crop({
        selected: state.selected,
        crop: state.crop,
        onBaseline: handleCropBaseline,
        resetSeq: state.resetSeq,
        onChange: handleCropChange,
        aspectRatio
      });
    }

    if (state.tab === 'GALLERY') {
      return renderers.gallery({
        selected: state.selected?.kind === 'gallery' ? state.selected : null,
        onPick: pickAndCrop,
        filters: state.filters.gallery,
        onFiltersChange: handleGalleryFiltersChange,
        mediaKind
      });
    }

    if (state.tab === 'UPLOAD') {
      if (state.selected?.kind === 'upload' && isNonImageUploadSelection(state.selected)) {
        return <FileView file={state.selected.file} />;
      }

      return renderers.upload({
        selected: state.selected?.kind === 'upload' ? state.selected : null,
        onPick: pickAndCrop,
        accept,
        isAllowedFile,
        invalidFileError,
        ariaLabel: uploadAriaLabel
      });
    }

    return renderers.used({
      selected: state.selected?.kind === 'used' ? state.selected : null,
      onPick: pickAndCrop,
      filters: state.filters.used,
      onFiltersChange: handleUsedFiltersChange,
      mediaKind
    });
  };

  return (
    <MediaModalContainer
      open={open}
      onClose={handleClose}
      dataTestId="MediaModal"
      headerLeft={headerLeft}
      headerCenter={headerCenter}
      headerRight={headerRight}
      footerTop={
        applyError ? (
          <Box role="alert" data-testid="MediaModal-applyError" sx={{ color: 'error.main', fontWeight: 500 }}>
            {applyError}
          </Box>
        ) : null
      }
      footerLeft={footerLeft}
      footerRight={footerRight}
    >
      {open ? renderBody() : null}
    </MediaModalContainer>
  );
}
