'use client';

import { Box, IconButton } from '@mui/material';
import React, { useCallback, useEffect, useReducer, useRef } from 'react';

import { MediaModalContainer } from '../components/container/MediaModalContainer';
import { MediaModalSwitcher } from '../components/switcher/MediaModalSwitcher';
import type { MediaModalRenderers } from '../MediaModal.renderers';
import { styles } from '../MediaModal.styles';
import type {
  CropResult,
  MediaModalOpenState,
  MediaModalResult,
  MediaModalTab,
  SelectedMedia
} from '../MediaModal.types';
import { buildInitialState, GalleryFilters, isSameCrop, reducer, UsedFilters } from './MediaModalFlowState';
import { useMediaModalApply } from './useMediaModalApply';
import ArrowLeftIcon from '~/public/icons/arrowLeft.svg';
import IterationIcon from '~/public/icons/iteration.svg';
import Button from '~/shared/components/design-system/button/Button';

export type MediaModalFlowProps = {
  open: boolean;
  onClose: () => void;
  onApply: (result: MediaModalResult) => void | Promise<void>;
  initial?: MediaModalOpenState;
  renderers: MediaModalRenderers;
};

export function MediaModalFlow({ open, onClose, onApply, initial, renderers }: Readonly<MediaModalFlowProps>) {
  const [state, dispatch] = useReducer(reducer, initial, buildInitialState);

  const { isApplying, applyError, clearApplyState, clearApplyError, cancelInFlightApply, handleClose, runApply } =
    useMediaModalApply({ open, onClose, onApply });

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
      dispatch({ type: 'PICK_AND_CROP', selected });
    },
    [clearApplyError, isApplying]
  );

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

  const headerLeft = isCrop ? (
    <Box sx={styles.cropHeader} data-testid="MediaModal-cropHeader">
      <Box sx={styles.cropHeaderTitle}>Редагування зображення</Box>
      <Box sx={styles.cropHeaderSubtitle} data-testid="MediaModal-cropHeaderFileName">
        {selectedFileName}
      </Box>
    </Box>
  ) : null;

  const headerCenter = isCrop ? null : <MediaModalSwitcher value={state.tab} onChange={handleTabChange} />;

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

  const footerLeft = isCrop ? (
    <Button
      color="secondary"
      variant="outlined"
      label="Повернутись назад"
      data-testid="MediaModal-backButton"
      sx={styles.footerBackButton}
      startIcon={<ArrowLeftIcon width={12} height={12} aria-hidden focusable={false} />}
      onClick={handleBack}
    />
  ) : null;

  const footerRight = isCrop ? (
    <>
      <Button
        color="secondary"
        variant="outlined"
        label="Скасувати"
        data-testid="MediaModal-cancelButton"
        onClick={handleClose}
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
        onChange: handleCropChange
      });
    }

    if (state.tab === 'GALLERY') {
      return renderers.gallery({
        selected: state.selected?.kind === 'gallery' ? state.selected : null,
        onPick: pickAndCrop,
        filters: state.filters.gallery,
        onFiltersChange: handleGalleryFiltersChange
      });
    }

    if (state.tab === 'UPLOAD') {
      return renderers.upload({
        selected: state.selected?.kind === 'upload' ? state.selected : null,
        onPick: pickAndCrop
      });
    }

    return renderers.used({
      selected: state.selected?.kind === 'used' ? state.selected : null,
      onPick: pickAndCrop,
      filters: state.filters.used,
      onFiltersChange: handleUsedFiltersChange
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
      {renderBody()}
    </MediaModalContainer>
  );
}
