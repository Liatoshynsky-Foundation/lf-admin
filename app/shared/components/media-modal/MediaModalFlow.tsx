'use client';

import { Box, IconButton } from '@mui/material';
import React, { useCallback, useEffect, useReducer, useRef, useState } from 'react';

import { MediaModalContainer } from './components/container/MediaModalContainer';
import { MediaModalSwitcher } from './components/switcher/MediaModalSwitcher';
import type { MediaModalRenderers } from './MediaModal.renderers';
import { styles } from './MediaModal.styles';
import type {
  CropResult,
  MediaModalOpenState,
  MediaModalResult,
  MediaModalStep,
  MediaModalTab,
  SelectedMedia
} from './MediaModal.types';
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

type State = {
  tab: MediaModalTab;
  step: MediaModalStep;
  selected: SelectedMedia | null;
  crop: CropResult | null;
  baselineCrop: CropResult | null;
  resetSeq: number;
};

type Action =
  | { type: 'OPEN'; initial?: MediaModalOpenState }
  | { type: 'SET_TAB'; tab: MediaModalTab }
  | { type: 'PICK_AND_CROP'; selected: SelectedMedia }
  | { type: 'BACK' }
  | { type: 'RESET_CROP' }
  | { type: 'SET_BASELINE_CROP'; crop: CropResult | null }
  | { type: 'SET_CROP'; crop: CropResult | null };

const tabFromSelected = (s: SelectedMedia | null): MediaModalTab | null => {
  if (!s) return null;
  if (s.kind === 'upload') return 'UPLOAD';
  if (s.kind === 'used') return 'USED';
  return 'GALLERY';
};

const isSameCrop = (a: CropResult | null, b: CropResult | null) => {
  if (a === b) return true;
  if (!a || !b) return false;

  return (
    a.rect.x === b.rect.x && a.rect.y === b.rect.y && a.rect.width === b.rect.width && a.rect.height === b.rect.height
  );
};

const buildInitialState = (initial?: MediaModalOpenState): State => {
  const initialSelected = initial?.selected ?? null;
  const tab: MediaModalTab = tabFromSelected(initialSelected) ?? initial?.tab ?? 'GALLERY';

  const requestedStep: MediaModalStep = initial?.step ?? 'SELECT';
  const step: MediaModalStep = requestedStep === 'CROP' && !initialSelected ? 'SELECT' : requestedStep;

  const crop = step === 'CROP' ? (initial?.crop ?? null) : null;

  return {
    tab,
    step,
    selected: initialSelected,
    crop,
    baselineCrop: crop,
    resetSeq: 0
  };
};

function reducer(state: State, action: Action): State {
  if (action.type === 'OPEN') return buildInitialState(action.initial);

  if (action.type === 'SET_TAB') {
    return {
      ...state,
      tab: action.tab,
      step: 'SELECT',
      selected: null,
      crop: null,
      baselineCrop: null,
      resetSeq: 0
    };
  }

  if (action.type === 'PICK_AND_CROP') {
    return {
      ...state,
      tab: tabFromSelected(action.selected) ?? state.tab,
      selected: action.selected,
      step: 'CROP',
      crop: null,
      baselineCrop: null,
      resetSeq: 0
    };
  }

  if (action.type === 'BACK') {
    return {
      ...state,
      step: 'SELECT'
    };
  }

  if (action.type === 'RESET_CROP') {
    return {
      ...state,
      crop: state.baselineCrop,
      resetSeq: state.resetSeq + 1
    };
  }

  if (action.type === 'SET_BASELINE_CROP') {
    if (state.step !== 'CROP') return state;

    const userHasChanged = !isSameCrop(state.crop, state.baselineCrop);

    if (userHasChanged) return state;

    if (isSameCrop(state.baselineCrop, action.crop) && isSameCrop(state.crop, action.crop)) return state;

    return {
      ...state,
      baselineCrop: action.crop,
      crop: action.crop
    };
  }

  if (action.type === 'SET_CROP') {
    return isSameCrop(state.crop, action.crop) ? state : { ...state, crop: action.crop };
  }

  return state;
}

export function MediaModalFlow({ open, onClose, onApply, initial, renderers }: MediaModalFlowProps) {
  const [state, dispatch] = useReducer(reducer, initial, buildInitialState);

  const [isApplying, setIsApplying] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);

  const openRef = useRef(open);
  useEffect(() => {
    openRef.current = open;
  }, [open]);

  const latestInitialRef = useRef<MediaModalOpenState | undefined>(initial);
  useEffect(() => {
    latestInitialRef.current = initial;
  }, [initial]);

  const applySeqRef = useRef(0);

  const clearApplyState = useCallback(() => {
    setIsApplying(false);
    setApplyError(null);
  }, []);

  const cancelInFlightApply = useCallback(() => {
    applySeqRef.current += 1;
    clearApplyState();
  }, [clearApplyState]);

  const handleClose = useCallback(() => {
    cancelInFlightApply();
    onClose();
  }, [cancelInFlightApply, onClose]);

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

  const handleApply = async () => {
    if (!state.selected) return;
    if (isApplying) return;

    const seq = ++applySeqRef.current;

    setIsApplying(true);
    setApplyError(null);

    try {
      await onApply({ selected: state.selected, crop: state.crop });

      if (applySeqRef.current !== seq) return;
      if (!openRef.current) return;

      handleClose();
    } catch (e) {
      if (applySeqRef.current !== seq) return;
      if (!openRef.current) return;

      setApplyError(e instanceof Error ? e.message : 'Не вдалося застосувати зміни. Спробуйте ще раз.');
    } finally {
      if (applySeqRef.current !== seq) return;
      if (!openRef.current) return;

      setIsApplying(false);
    }
  };

  const isCrop = state.step === 'CROP';
  const selectedFileName = state.selected?.fileName ?? '';

  const hasCropChanges = !isSameCrop(state.crop, state.baselineCrop);
  const isResetDisabled = isApplying || !hasCropChanges;

  const handleTabChange = (tab: MediaModalTab) => {
    if (isApplying) return;
    setApplyError(null);
    dispatch({ type: 'SET_TAB', tab });
  };

  const pickAndCrop = (selected: SelectedMedia) => {
    if (isApplying) return;
    setApplyError(null);
    dispatch({ type: 'PICK_AND_CROP', selected });
  };

  const handleBack = () => {
    if (isApplying) return;
    setApplyError(null);
    dispatch({ type: 'BACK' });
  };

  const handleResetCrop = () => {
    if (isResetDisabled) return;
    setApplyError(null);
    dispatch({ type: 'RESET_CROP' });
  };

  const handleCropChange = (crop: CropResult | null) => {
    if (isApplying) return;
    setApplyError(null);
    dispatch({ type: 'SET_CROP', crop });
  };

  const handleCropBaseline = (crop: CropResult | null) => {
    if (isApplying) return;
    setApplyError(null);
    dispatch({ type: 'SET_BASELINE_CROP', crop });
  };

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
        onPick: pickAndCrop
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
      onPick: pickAndCrop
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
