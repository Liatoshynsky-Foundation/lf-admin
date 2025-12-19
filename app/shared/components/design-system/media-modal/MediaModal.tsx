'use client';

import { Box, IconButton } from '@mui/material';
import React, { useCallback, useEffect, useReducer, useRef, useState } from 'react';

import { MediaModalContainer } from './components/container/MediaModalContainer';
import { MediaModalSwitcher } from './components/switcher/MediaModalSwitcher';
import { styles } from './MediaModal.styles';
import type {
  MediaModalOpenState,
  MediaModalResult,
  MediaModalStep,
  MediaModalTab,
  SelectedMedia
} from './MediaModal.types';
import { CropView } from './views/crop-view/CropView';
import { GalleryView } from './views/gallery-view/GalleryView';
import { UploadView } from './views/upload-view/UploadView';
import { UsedView } from './views/used-view/UsedView';
import ArrowLeftIcon from '~/public/icons/arrowLeft.svg';
import IterationIcon from '~/public/icons/iteration.svg';
import Button from '~/shared/components/design-system/button/Button';

export type MediaModalProps = {
  open: boolean;
  onClose: () => void;
  onApply: (result: MediaModalResult) => void | Promise<void>;
  initial?: MediaModalOpenState;
};

type State = {
  tab: MediaModalTab;
  step: MediaModalStep;
  selected: SelectedMedia | null;
  hasCropChanges: boolean;
  resetSeq: number;
};

type Action =
  | { type: 'OPEN'; initial?: MediaModalOpenState }
  | { type: 'SET_TAB'; tab: MediaModalTab }
  | { type: 'PICK_AND_CROP'; selected: SelectedMedia }
  | { type: 'BACK' }
  | { type: 'RESET_CROP' }
  | { type: 'SET_CROP_CHANGES'; hasCropChanges: boolean };

const tabFromSelected = (s: SelectedMedia | null): MediaModalTab | null => {
  if (!s) return null;
  if (s.kind === 'upload') return 'UPLOAD';
  if (s.kind === 'used') return 'USED';
  return 'GALLERY';
};

const buildInitialState = (initial?: MediaModalOpenState): State => {
  const initialSelected = initial?.selected ?? null;
  const tab: MediaModalTab = tabFromSelected(initialSelected) ?? initial?.tab ?? 'GALLERY';

  const requestedStep: MediaModalStep = initial?.step ?? 'SELECT';
  const step: MediaModalStep = requestedStep === 'CROP' && !initialSelected ? 'SELECT' : requestedStep;

  return {
    tab,
    step,
    selected: initialSelected,
    hasCropChanges: false,
    resetSeq: 0
  };
};

function reducer(state: State, action: Action): State {
  if (action.type === 'OPEN') return buildInitialState(action.initial);

  if (action.type === 'SET_TAB') {
    return { ...state, tab: action.tab, step: 'SELECT', selected: null, hasCropChanges: false, resetSeq: 0 };
  }

  if (action.type === 'PICK_AND_CROP') {
    return { ...state, selected: action.selected, step: 'CROP', hasCropChanges: false, resetSeq: 0 };
  }

  if (action.type === 'BACK') {
    return { ...state, step: 'SELECT', hasCropChanges: false };
  }

  if (action.type === 'RESET_CROP') {
    return { ...state, hasCropChanges: false, resetSeq: state.resetSeq + 1 };
  }

  if (action.type === 'SET_CROP_CHANGES') {
    return state.hasCropChanges === action.hasCropChanges ? state : { ...state, hasCropChanges: action.hasCropChanges };
  }

  return state;
}

export function MediaModal({ open, onClose, onApply, initial }: MediaModalProps) {
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

  const isApplyingRef = useRef(isApplying);
  useEffect(() => {
    isApplyingRef.current = isApplying;
  }, [isApplying]);

  const applySeqRef = useRef(0);

  const handleClose = () => {
    applySeqRef.current += 1;
    setIsApplying(false);
    setApplyError(null);
    onClose();
  };

  const wasOpenRef = useRef(false);
  useEffect(() => {
    if (open && !wasOpenRef.current) {
      dispatch({ type: 'OPEN', initial: latestInitialRef.current });
      setApplyError(null);
      setIsApplying(false);
    }

    if (!open && wasOpenRef.current) {
      applySeqRef.current += 1;
      setIsApplying(false);
      setApplyError(null);
    }

    wasOpenRef.current = open;
  }, [open]);

  const handleApply = async () => {
    if (!state.selected) return;
    if (isApplying) return;

    const seq = ++applySeqRef.current;

    setIsApplying(true);
    setApplyError(null);

    try {
      await onApply({
        selected: state.selected
      });

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

  const handleCropChanges = useCallback((hasCropChanges: boolean) => {
    if (isApplyingRef.current) return;
    dispatch({ type: 'SET_CROP_CHANGES', hasCropChanges });
  }, []);

  const isCrop = state.step === 'CROP';
  const selectedName = state.selected?.name ?? '';

  const headerLeft = isCrop ? (
    <Box sx={styles.cropHeader} data-testid="MediaModal-cropHeader">
      <Box sx={styles.cropHeaderTitle}>Редагування зображення</Box>
      <Box sx={styles.cropHeaderSubtitle} data-testid="MediaModal-cropHeaderFileName">
        {selectedName}
      </Box>
    </Box>
  ) : null;

  const headerCenter = isCrop ? null : (
    <MediaModalSwitcher
      value={state.tab}
      onChange={(tab) => {
        if (isApplying) return;
        setApplyError(null);
        dispatch({ type: 'SET_TAB', tab });
      }}
    />
  );

  const isResetDisabled = isApplying || !state.hasCropChanges;

  const headerRight = isCrop ? (
    <IconButton
      disabled={isResetDisabled}
      onClick={() => {
        if (isResetDisabled) return;
        dispatch({ type: 'RESET_CROP' });
      }}
      aria-label="reset"
      data-testid="MediaModal-resetButton"
      sx={styles.headerIconButton}
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
      onClick={() => {
        if (isApplying) return;
        setApplyError(null);
        dispatch({ type: 'BACK' });
      }}
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
        disabled={!state.selected}
        onClick={handleApply}
      />
    </>
  ) : null;

  const body = isCrop ? (
    <CropView resetSeq={state.resetSeq} onCropChanges={handleCropChanges} />
  ) : state.tab === 'GALLERY' ? (
    <GalleryView
      selected={state.selected?.kind === 'gallery' ? state.selected : null}
      onPick={(selected) => {
        if (isApplying) return;
        setApplyError(null);
        dispatch({ type: 'PICK_AND_CROP', selected });
      }}
    />
  ) : state.tab === 'UPLOAD' ? (
    <UploadView
      onPick={(selected) => {
        if (isApplying) return;
        setApplyError(null);
        dispatch({ type: 'PICK_AND_CROP', selected });
      }}
    />
  ) : (
    <UsedView
      selected={state.selected?.kind === 'used' ? state.selected : null}
      onPick={(selected) => {
        if (isApplying) return;
        setApplyError(null);
        dispatch({ type: 'PICK_AND_CROP', selected });
      }}
    />
  );

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
      {body}
    </MediaModalContainer>
  );
}
