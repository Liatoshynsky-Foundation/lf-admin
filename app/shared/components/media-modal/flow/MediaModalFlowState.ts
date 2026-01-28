import type {
  CropResult,
  MediaModalOpenState,
  MediaModalStep,
  MediaModalTab,
  SelectedMedia
} from '../MediaModal.types';

export type GalleryFilters = {
  search: string;
  favorites: string;
  usage: string;
};

export type UsedFilters = {
  search: string;
  language: string;
};

export type TabFilters = {
  gallery: GalleryFilters;
  used: UsedFilters;
};

export type State = {
  tab: MediaModalTab;
  step: MediaModalStep;
  selected: SelectedMedia | null;
  crop: CropResult | null;
  baselineCrop: CropResult | null;
  resetSeq: number;
  filters: TabFilters;
};

export type Action =
  | { type: 'OPEN'; initial?: MediaModalOpenState }
  | { type: 'SET_TAB'; tab: MediaModalTab }
  | { type: 'PICK_AND_CROP'; selected: SelectedMedia }
  | { type: 'BACK' }
  | { type: 'RESET_CROP' }
  | { type: 'SET_BASELINE_CROP'; crop: CropResult | null }
  | { type: 'SET_CROP'; crop: CropResult | null }
  | { type: 'SET_GALLERY_FILTERS'; filters: Partial<GalleryFilters> }
  | { type: 'SET_USED_FILTERS'; filters: Partial<UsedFilters> };

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
    resetSeq: 0,
    filters: {
      gallery: { search: '', favorites: '', usage: '' },
      used: { search: '', language: '' }
    }
  };
};

const toSelectState = (state: State, tab: MediaModalTab): State => ({
  ...state,
  tab,
  step: 'SELECT',
  selected: null,
  crop: null,
  baselineCrop: null,
  resetSeq: 0
});

const toCropState = (state: State, selected: SelectedMedia): State => ({
  ...state,
  tab: tabFromSelected(selected) ?? state.tab,
  selected,
  step: 'CROP',
  crop: null,
  baselineCrop: null,
  resetSeq: 0
});

const setBaselineCrop = (state: State, crop: CropResult | null): State => {
  if (state.step !== 'CROP') return state;

  const userHasChanged = !isSameCrop(state.crop, state.baselineCrop);
  if (userHasChanged) return state;

  const noChange = isSameCrop(state.baselineCrop, crop) && isSameCrop(state.crop, crop);
  if (noChange) return state;

  return {
    ...state,
    baselineCrop: crop,
    crop
  };
};

type ActionHandler<K extends Action['type']> = (state: State, action: Extract<Action, { type: K }>) => State;

const handlers = {
  OPEN: (_state, action) => buildInitialState(action.initial),

  SET_TAB: (state, action) => toSelectState(state, action.tab),

  PICK_AND_CROP: (state, action) => toCropState(state, action.selected),

  BACK: (state) => (state.step === 'SELECT' ? state : { ...state, step: 'SELECT' }),

  RESET_CROP: (state) => ({
    ...state,
    crop: state.baselineCrop,
    resetSeq: state.resetSeq + 1
  }),

  SET_BASELINE_CROP: (state, action) => setBaselineCrop(state, action.crop),

  SET_CROP: (state, action) => (isSameCrop(state.crop, action.crop) ? state : { ...state, crop: action.crop }),

  SET_GALLERY_FILTERS: (state, action) => ({
    ...state,
    filters: {
      ...state.filters,
      gallery: { ...state.filters.gallery, ...action.filters }
    }
  }),

  SET_USED_FILTERS: (state, action) => ({
    ...state,
    filters: {
      ...state.filters,
      used: { ...state.filters.used, ...action.filters }
    }
  })
} satisfies {
  [K in Action['type']]: ActionHandler<K>;
};

export function reducer(state: State, action: Action): State {
  return (handlers[action.type] as (s: State, a: Action) => State)(state, action);
}
