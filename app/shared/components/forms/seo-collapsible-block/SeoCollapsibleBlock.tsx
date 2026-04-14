import type { ReactNode } from 'react';

import CollapsibleBlock from '~/shared/components/design-system/collapsible-block/CollapsibleBlock';
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
  defaultExpanded,
  sx,
  childrenContainerSx,
  children,
  ...seoProps
}: SeoCollapsibleBlockProps) {
  return (
    <>
      <CollapsibleBlock
        title={title}
        defaultExpanded={defaultExpanded}
        sx={sx}
        childrenContainerSx={childrenContainerSx}
      >
        {children}
      </CollapsibleBlock>
      <SeoMetadataBlock {...seoProps} />
    </>
  );
}
