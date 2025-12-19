import type {
  CropResult,
  MediaModalOpenState,
  MediaModalStep,
  MediaModalTab,
  SelectedMedia
} from '../MediaModal.types';

export type State = {
  tab: MediaModalTab;
  step: MediaModalStep;
  selected: SelectedMedia | null;
  crop: CropResult | null;
  baselineCrop: CropResult | null;
  resetSeq: number;
};

export type Action =
  | { type: 'OPEN'; initial?: MediaModalOpenState }
  | { type: 'SET_TAB'; tab: MediaModalTab }
  | { type: 'PICK_AND_CROP'; selected: SelectedMedia }
  | { type: 'BACK' }
  | { type: 'RESET_CROP' }
  | { type: 'SET_BASELINE_CROP'; crop: CropResult | null }
  | { type: 'SET_CROP'; crop: CropResult | null };

export const tabFromSelected = (s: SelectedMedia | null): MediaModalTab | null => {
  if (!s) return null;
  if (s.kind === 'upload') return 'UPLOAD';
  if (s.kind === 'used') return 'USED';
  return 'GALLERY';
};

export const isSameCrop = (a: CropResult | null, b: CropResult | null): boolean => {
  if (a === b) return true;
  if (!a || !b) return false;

  return (
    a.rect.x === b.rect.x && a.rect.y === b.rect.y && a.rect.width === b.rect.width && a.rect.height === b.rect.height
  );
};

export const buildInitialState = (initial?: MediaModalOpenState): State => {
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

export function reducer(state: State, action: Action): State {
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
