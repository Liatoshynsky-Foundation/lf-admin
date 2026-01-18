import type { ReactNode } from 'react';

import type { GalleryFilters, UsedFilters } from './flow/MediaModalFlowState';
import type { CropResult, GalleryMedia, SelectedMedia, UploadMedia, UsedMedia } from './MediaModal.types';

export type GalleryRendererProps = {
  selected: GalleryMedia | null;
  onPick: (selected: GalleryMedia) => void;
  filters: GalleryFilters;
  onFiltersChange: (filters: Partial<GalleryFilters>) => void;
};

export type UploadRendererProps = {
  selected: UploadMedia | null;
  onPick: (selected: UploadMedia) => void;
};

export type UsedRendererProps = {
  selected: UsedMedia | null;
  onPick: (selected: UsedMedia) => void;
  filters: UsedFilters;
  onFiltersChange: (filters: Partial<UsedFilters>) => void;
};

export type CropRendererProps = {
  selected: SelectedMedia;
  crop: CropResult | null;
  onBaseline: (crop: CropResult | null) => void;
  resetSeq: number;
  onChange: (crop: CropResult | null) => void;
};

export type MediaModalRenderers = {
  gallery: (props: GalleryRendererProps) => ReactNode;
  upload: (props: UploadRendererProps) => ReactNode;
  used: (props: UsedRendererProps) => ReactNode;
  crop: (props: CropRendererProps) => ReactNode;
};
