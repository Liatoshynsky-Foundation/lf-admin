'use client';

import { Box, IconButton } from '@mui/material';
import React, { useEffect, useReducer, useRef } from 'react';

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

type CropState = 'INITIAL' | 'RESIZED';

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
  applyForAllLocales: boolean;
  cropState: CropState;
};

type Action =
  | { type: 'OPEN'; initial?: MediaModalOpenState }
  | { type: 'SET_TAB'; tab: MediaModalTab }
  | { type: 'PICK_AND_CROP'; selected: SelectedMedia }
  | { type: 'BACK' }
  | { type: 'RESET_CROP' }
  | { type: 'MARK_CROP_RESIZED' };

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
    applyForAllLocales: initial?.applyForAllLocales ?? true,
    cropState: 'INITIAL'
  };
};

function reducer(state: State, action: Action): State {
  if (action.type === 'OPEN') return buildInitialState(action.initial);

  if (action.type === 'SET_TAB') {
    return { ...state, tab: action.tab, step: 'SELECT', selected: null, cropState: 'INITIAL' };
  }

  if (action.type === 'PICK_AND_CROP') {
    return { ...state, selected: action.selected, step: 'CROP', cropState: 'INITIAL' };
  }

  if (action.type === 'BACK') {
    return { ...state, step: 'SELECT' };
  }

  if (action.type === 'RESET_CROP') {
    return { ...state, cropState: 'INITIAL' };
  }

  if (action.type === 'MARK_CROP_RESIZED') {
    return state.cropState === 'RESIZED' ? state : { ...state, cropState: 'RESIZED' };
  }

  return state;
}

export function MediaModal({ open, onClose, onApply, initial }: MediaModalProps) {
  const [state, dispatch] = useReducer(reducer, initial, buildInitialState);

  const latestInitialRef = useRef<MediaModalOpenState | undefined>(initial);
  useEffect(() => {
    latestInitialRef.current = initial;
  }, [initial]);

  const wasOpenRef = useRef(false);
  useEffect(() => {
    if (open && !wasOpenRef.current) {
      dispatch({ type: 'OPEN', initial: latestInitialRef.current });
    }
    wasOpenRef.current = open;
  }, [open]);

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
    <MediaModalSwitcher value={state.tab} onChange={(tab) => dispatch({ type: 'SET_TAB', tab })} />
  );

  const headerRight = isCrop ? (
    <IconButton
      onClick={() => dispatch({ type: 'RESET_CROP' })}
      aria-label="reverse"
      data-testid="MediaModal-reverseButton"
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
      onClick={() => dispatch({ type: 'BACK' })}
    />
  ) : null;

  const footerRight = isCrop ? (
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
        disabled={!state.selected}
        onClick={async () => {
          if (!state.selected) return;

          await onApply({
            selected: state.selected,
            applyForAllLocales: state.applyForAllLocales
          });

          onClose();
        }}
      />
    </>
  ) : null;

  const body = isCrop ? (
    <CropView cropState={state.cropState} onSimulateResize={() => dispatch({ type: 'MARK_CROP_RESIZED' })} />
  ) : state.tab === 'GALLERY' ? (
    <GalleryView
      selected={state.selected?.kind === 'gallery' ? state.selected : null}
      onPick={(selected) => dispatch({ type: 'PICK_AND_CROP', selected })}
    />
  ) : state.tab === 'UPLOAD' ? (
    <UploadView onPick={(selected) => dispatch({ type: 'PICK_AND_CROP', selected })} />
  ) : (
    <UsedView
      selected={state.selected?.kind === 'used' ? state.selected : null}
      onPick={(selected) => dispatch({ type: 'PICK_AND_CROP', selected })}
    />
  );

  return (
    <MediaModalContainer
      open={open}
      onClose={onClose}
      dataTestId="MediaModal"
      headerLeft={headerLeft}
      headerCenter={headerCenter}
      headerRight={headerRight}
      footerLeft={footerLeft}
      footerRight={footerRight}
    >
      {body}
    </MediaModalContainer>
  );
}
