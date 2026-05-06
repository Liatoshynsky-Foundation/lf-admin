import { defaultProps } from '@blocknote/core';
import { createReactBlockSpec } from '@blocknote/react';
import { Box, InputBase, Paper, Typography } from '@mui/material';
import { FileImage, GripHorizontal } from 'lucide-react';
import { useState } from 'react';

import { CroppedImageRendererProps } from '../types';
import { styles } from './CroppedImageBlock.styles';
import { useCroppedImage } from '~/hooks/use-cropped-image/use-cropped-image';

const EDITOR_PREVIEW_W = 600;
const EDITOR_PREVIEW_H = 400;

const CroppedImageRenderer = ({ props }: { props: CroppedImageRendererProps }) => {
  const [tempWidth, setTempWidth] = useState<number | null>(null);

  const savedCrop = JSON.parse(props.block.props.cropData);
  const currentWidth = tempWidth ?? props.block.props.width;
  const currentHeight = (currentWidth / EDITOR_PREVIEW_W) * EDITOR_PREVIEW_H;

  const { styles: cropStyles, onLoad: onImgLoad } = useCroppedImage(savedCrop, currentWidth, currentHeight);

  if (!props.block.props.url) return null;

  const handleUpdateProp = <K extends keyof CroppedImageRendererProps['block']['props']>(
    key: K,
    value: CroppedImageRendererProps['block']['props'][K]
  ) => {
    props.editor.updateBlock(props.block.id, {
      type: 'image',
      props: { [key]: value }
    });
  };

  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = props.block.props.width;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      setTempWidth(Math.max(150, startWidth + (moveEvent.clientX - startX)));
    };

    const handleMouseUp = (upEvent: MouseEvent) => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      const finalWidth = Math.max(150, startWidth + (upEvent.clientX - startX));
      setTempWidth(null);
      handleUpdateProp('width', finalWidth);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <Box sx={[styles.mainContainer, { alignItems: props.block.props.textAlignment }]}>
      {props.block.props.showPreview ? (
        <Box sx={[styles.imageStateContainer, { width: currentWidth }]} contentEditable={false}>
          <Box sx={{ ...cropStyles.container, width: currentWidth, height: currentHeight }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              draggable={false}
              src={props.block.props.url}
              alt={props.block.props.fileName}
              onLoad={onImgLoad}
              width={currentWidth}
              height={currentHeight}
              style={{
                ...cropStyles.image,
                maxWidth: 'none',
                maxHeight: 'none',
                userSelect: 'none'
              }}
            />
          </Box>
          <Box className="overlay-controls" onMouseDown={handleResizeStart} sx={styles.resizeHandle}>
            <GripHorizontal size={16} style={{ transform: 'rotate(90deg)' }} />
          </Box>
        </Box>
      ) : (
        <Paper
          variant="outlined"
          sx={styles.fileCard}
          contentEditable={false}
          onClick={() => handleUpdateProp('showPreview', true)}
        >
          <Box sx={styles.fileIconBox}>
            <FileImage size={24} />
          </Box>
          <Typography variant="body2" sx={styles.fileName}>
            {props.block.props.fileName}
          </Typography>
        </Paper>
      )}
      {props.block.props.showPreview && (
        <InputBase
          placeholder="Додати підпис..."
          value={props.block.props.caption}
          onChange={(e) => handleUpdateProp('caption', e.target.value)}
          onKeyDown={(e) => e.stopPropagation()}
          sx={[
            styles.captionInput,
            {
              width: currentWidth,
              '& input': { textAlign: props.block.props.textAlignment === 'left' ? 'left' : 'center' }
            }
          ]}
        />
      )}
    </Box>
  );
};

export const CroppedImageBlock = createReactBlockSpec(
  {
    type: 'image',
    propSchema: {
      textAlignment: defaultProps.textAlignment,
      textColor: defaultProps.textColor,
      url: { default: '' },
      cropData: { default: '{}' },
      fileName: { default: 'image' },
      caption: { default: '' },
      width: { default: 512 },
      showPreview: { default: true }
    },
    content: 'none'
  },
  {
    render: (props) => <CroppedImageRenderer props={props as unknown as CroppedImageRendererProps} />,

    toExternalHTML: (props) => {
      return (
        <img
          src={props.block.props.url}
          alt={props.block.props.fileName}
          data-custom-cropped="true"
          data-crop-data={props.block.props.cropData}
          data-width={props.block.props.width.toString()}
          data-preview={props.block.props.showPreview.toString()}
          data-caption={props.block.props.caption}
        />
      );
    },

    parse: (el) => {
      const img = el.tagName.toLowerCase() === 'img' ? el : el.querySelector('img');

      if (img) {
        const { src, alt, cropData, width, preview, caption } = img.dataset;
        return {
          url: src || '',
          fileName: alt || 'image',
          cropData: cropData || '{}',
          width: Number.parseInt(width || '512', 10),
          showPreview: preview === 'true',
          caption: caption || ''
        };
      }

      return undefined;
    }
  }
);
