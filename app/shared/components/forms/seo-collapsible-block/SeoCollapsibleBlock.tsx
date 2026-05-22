import { Box, Typography } from '@mui/material';
import type { ReactNode } from 'react';

import { styles } from './SeoCollapsibleBlock.styles';
import type { SeoMetadataBlockProps } from '~/shared/components/forms/seo-metadata-form/seo-metadata-block/SeoMetadataBlock';
import SeoMetadataBlock from '~/shared/components/forms/seo-metadata-form/seo-metadata-block/SeoMetadataBlock';

interface SeoCollapsibleBlockProps extends SeoMetadataBlockProps {
  readonly title: string;
  readonly defaultExpanded?: boolean;
  readonly sx?: object;
  readonly childrenContainerSx?: object;
  readonly children: NonNullable<ReactNode>;
}

export default function SeoCollapsibleBlock({
  title,
  defaultExpanded: _defaultExpanded,
  sx,
  childrenContainerSx,
  children,
  ...seoProps
}: SeoCollapsibleBlockProps) {
  return (
    <>
      <Box
        sx={{
          ...styles.upperContentBlock,
          ...sx
        }}
      >
        <Typography variant="h6" sx={styles.title}>
          {title}
        </Typography>
        <Box sx={childrenContainerSx}>{children}</Box>
      </Box>
      <Box sx={styles.metadataWrapper}>
        <SeoMetadataBlock {...seoProps} />
      </Box>
    </>
  );
}
