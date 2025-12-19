'use client';

import React, { useMemo } from 'react';

import type { MediaModalFlowProps } from './flow/MediaModalFlow';
import { MediaModalFlow } from './flow/MediaModalFlow';
import type { MediaModalRenderers } from './MediaModal.renderers';
import { CropView } from './views/crop-view/CropView';
import { GalleryView } from './views/gallery-view/GalleryView';
import { UploadView } from './views/upload-view/UploadView';
import { UsedView } from './views/used-view/UsedView';

export type MediaModalProps = Omit<MediaModalFlowProps, 'renderers'> & {
  renderers?: Partial<MediaModalRenderers>;
};

export function MediaModal({ renderers: overrides, ...rest }: MediaModalProps) {
  const baseRenderers = useMemo<MediaModalRenderers>(
    () => ({
      gallery: (props) => <GalleryView {...props} />,
      upload: (props) => <UploadView {...props} />,
      used: (props) => <UsedView {...props} />,
      crop: (props) => <CropView {...props} />
    }),
    []
  );

  const renderers = useMemo<MediaModalRenderers>(
    () => ({ ...baseRenderers, ...(overrides ?? {}) }),
    [baseRenderers, overrides]
  );

  return <MediaModalFlow {...rest} renderers={renderers} />;
}
