'use client';

import React, { useMemo } from 'react';

import type { MediaModalFlowProps } from './flow/MediaModalFlow';
import { MediaModalFlow } from './flow/MediaModalFlow';
import type { MediaModalRenderers } from './MediaModal.renderers';
import { CropView } from './views/crop-view/CropView';
import { GalleryView } from './views/gallery-view/GalleryView';
import { UploadView } from './views/upload-view/UploadView';
import { UsedView } from './views/used-view/UsedView';

const renderGallery: MediaModalRenderers['gallery'] = (props) => <GalleryView {...props} />;
const renderUpload: MediaModalRenderers['upload'] = (props) => <UploadView {...props} />;
const renderUsed: MediaModalRenderers['used'] = (props) => <UsedView {...props} />;
const renderCrop: MediaModalRenderers['crop'] = (props) => <CropView {...props} />;

const DEFAULT_RENDERERS: MediaModalRenderers = {
  gallery: renderGallery,
  upload: renderUpload,
  used: renderUsed,
  crop: renderCrop
};

export type MediaModalProps = Omit<MediaModalFlowProps, 'renderers'> & {
  renderers?: Partial<MediaModalRenderers>;
};

export function MediaModal({ renderers: overrides, ...rest }: Readonly<MediaModalProps>) {
  const renderers = useMemo<MediaModalRenderers>(() => {
    if (!overrides) return DEFAULT_RENDERERS;
    return { ...DEFAULT_RENDERERS, ...overrides };
  }, [overrides]);

  return <MediaModalFlow {...rest} renderers={renderers} />;
}
