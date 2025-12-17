'use client';

import { Box, Checkbox, FormControlLabel, Typography } from '@mui/material';
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
import { LibraryView } from './views/library-view/LibraryView';
import { UploadView } from './views/upload-view/UploadView';
import CheckCircleOutlineIcon from '~/public/icons/checkCircleOutline.svg';
import ChevronRightIcon from '~/public/icons/chevronRight.svg';
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
  applyForAllLocales: boolean;
};

type Action =
  | { type: 'OPEN'; initial?: MediaModalOpenState }
  | { type: 'SET_TAB'; tab: MediaModalTab }
  | { type: 'SELECT'; selected: SelectedMedia }
  | { type: 'RESET_SELECTION' }
  | { type: 'GO_CROP' }
  | { type: 'BACK' }
  | { type: 'SET_APPLY_ALL'; value: boolean };

const tabFromSelected = (s: SelectedMedia | null): MediaModalTab | null => {
  if (!s) return null;
  return s.kind === 'upload' ? 'UPLOAD' : 'LIBRARY';
};

const buildInitialState = (initial?: MediaModalOpenState): State => {
  const initialSelected = initial?.selected ?? null;
  const tab: MediaModalTab = tabFromSelected(initialSelected) ?? initial?.tab ?? 'LIBRARY';

  const stepRequested: MediaModalStep = initial?.step ?? 'SELECT';
  const step: MediaModalStep = stepRequested === 'CROP' && !initialSelected ? 'SELECT' : stepRequested;

  const selected =
    step === 'SELECT'
      ? initialSelected && tabFromSelected(initialSelected) === tab
        ? initialSelected
        : null
      : initialSelected;

  return {
    tab,
    step,
    selected,
    applyForAllLocales: initial?.applyForAllLocales ?? true
  };
};

function reducer(state: State, action: Action): State {
  if (action.type === 'OPEN') {
    return buildInitialState(action.initial);
  }

  if (action.type === 'SET_TAB') {
    return { ...state, tab: action.tab, step: 'SELECT', selected: null };
  }

  if (action.type === 'SELECT') {
    return { ...state, selected: action.selected };
  }

  if (action.type === 'RESET_SELECTION') {
    return { ...state, selected: null };
  }

  if (action.type === 'GO_CROP') {
    return state.selected ? { ...state, step: 'CROP' } : state;
  }

  if (action.type === 'BACK') {
    return { ...state, step: 'SELECT' };
  }

  if (action.type === 'SET_APPLY_ALL') {
    return { ...state, applyForAllLocales: action.value };
  }

  return state;
}

export function MediaModal({ open, onClose, onApply, initial }: MediaModalProps) {
  const [state, dispatch] = useReducer(reducer, initial, buildInitialState);

  const latestInitialRef = useRef(initial);
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

  const footerTop =
    !isCrop && state.selected ? (
      <Box sx={styles.selectedFileRow} data-testid="MediaModal-selectedFileRow">
        <CheckCircleOutlineIcon sx={styles.selectedFileIcon} aria-hidden />
        <Typography sx={styles.selectedFileName} data-testid="MediaModal-selectedFileName">
          {state.selected.name}
        </Typography>
      </Box>
    ) : null;

  const footerLeft =
    state.tab === 'LIBRARY' || isCrop ? (
      <FormControlLabel
        sx={styles.checkboxLabel}
        data-testid="MediaModal-applyForAllLocales"
        control={
          <Checkbox
            checked={state.applyForAllLocales}
            onChange={(e) => dispatch({ type: 'SET_APPLY_ALL', value: e.target.checked })}
            sx={styles.checkbox}
          />
        }
        label="Застосувати для всіх мовних версій"
      />
    ) : null;

  const footerRight = isCrop ? (
    <>
      <Button
        color="secondary"
        variant="outlined"
        label="Скасувати"
        data-testid="MediaModal-cancelButton"
        sx={styles.footerActionButton}
        onClick={() => dispatch({ type: 'BACK' })}
      />
      <Button
        color="secondary"
        variant="filled"
        label="Зберегти"
        data-testid="MediaModal-saveButton"
        sx={styles.footerActionButton}
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
  ) : (
    <>
      <Button
        color="secondary"
        variant="outlined"
        label="Скинути"
        data-testid="MediaModal-resetButton"
        sx={styles.footerActionButton}
        disabled={!state.selected}
        onClick={() => dispatch({ type: 'RESET_SELECTION' })}
      />
      <Button
        color="secondary"
        variant="filled"
        label="Застосувати"
        data-testid="MediaModal-applyButton"
        sx={styles.footerActionButton}
        endIcon={<ChevronRightIcon width={24} height={24} aria-hidden focusable={false} />}
        disabled={!state.selected}
        onClick={() => dispatch({ type: 'GO_CROP' })}
      />
    </>
  );

  const body = isCrop ? (
    <CropView selectedName={selectedName} />
  ) : state.tab === 'LIBRARY' ? (
    <LibraryView
      selectedName={state.selected?.kind === 'library' ? state.selected.name : null}
      onSelect={(name) => dispatch({ type: 'SELECT', selected: { kind: 'library', name } })}
    />
  ) : (
    <UploadView
      selectedName={state.selected?.kind === 'upload' ? state.selected.name : null}
      onSelect={(name) => dispatch({ type: 'SELECT', selected: { kind: 'upload', name } })}
    />
  );

  return (
    <MediaModalContainer
      open={open}
      onClose={onClose}
      dataTestId="MediaModal"
      headerLeft={headerLeft}
      headerCenter={headerCenter}
      footerTop={footerTop}
      footerLeft={footerLeft}
      footerRight={footerRight}
    >
      {body}
    </MediaModalContainer>
  );
}
