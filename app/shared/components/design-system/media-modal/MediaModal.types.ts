export type MediaModalTab = 'LIBRARY' | 'UPLOAD';
export type MediaModalStep = 'SELECT' | 'CROP';

export type SelectedMedia = { kind: 'library'; name: string } | { kind: 'upload'; name: string };

export type MediaModalResult = {
  selected: SelectedMedia;
  applyForAllLocales: boolean;
  crop?: unknown;
};

export type MediaModalOpenState = {
  tab?: MediaModalTab;
  step?: MediaModalStep;
  selected?: SelectedMedia | null;
  applyForAllLocales?: boolean;
};
