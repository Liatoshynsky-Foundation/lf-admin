import { Box, Typography } from '@mui/material';
import type { ReactNode } from 'react';

import type { SeoMetadataBlockProps } from '~/shared/components/forms/seo-metadata-form/seo-metadata-block/SeoMetadataBlock';
import SeoMetadataBlock from '~/shared/components/forms/seo-metadata-form/seo-metadata-block/SeoMetadataBlock';

interface SeoCollapsibleBlockProps extends SeoMetadataBlockProps {
  title: string;
  defaultExpanded?: boolean;
  sx?: object;
  childrenContainerSx?: object;
  children: NonNullable<ReactNode>;
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
          border: '0.5px solid #190D0333',
          borderRadius: '20px',
          backgroundColor: 'rgba(25, 13, 3, 0.04)',
          boxShadow: 'none',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          ...sx
        }}
      >
        <Typography
          sx={{
            fontFamily: 'Mulish',
            fontWeight: 700,
            fontSize: '24px',
            lineHeight: '120%',
            letterSpacing: '0px'
          }}
        >
          {title}
        </Typography>
        <Box sx={childrenContainerSx}>{children}</Box>
      </Box>
      <Box sx={{ padding: '32px 0' }}>
        <SeoMetadataBlock {...seoProps} />
      </Box>
    </>
  );
}
