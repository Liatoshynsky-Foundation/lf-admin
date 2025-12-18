export type MediaModalTab = 'GALLERY' | 'UPLOAD' | 'USED';
export type MediaModalStep = 'SELECT' | 'CROP';

export type MediaLocale = 'UA' | 'EN';

export type SelectedMedia =
  | { kind: 'gallery'; name: string; locale: MediaLocale }
  | { kind: 'upload'; name: string }
  | { kind: 'used'; name: string; locale: MediaLocale };

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
