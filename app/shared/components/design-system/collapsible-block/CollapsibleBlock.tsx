import { Accordion, AccordionDetails, AccordionProps, AccordionSummary } from '@mui/material';
import React from 'react';

import { styles } from './CollapsibleBlock.styles';
import ChevronIcon from '~/public/icons/chevron-down.svg';

interface CollapsibleBlockProps extends AccordionProps {
  title: string;
  childrenContainerSx?: object;
}

const CollapsibleBlock = ({ title, children, sx, childrenContainerSx, ...props }: CollapsibleBlockProps) => {
  return (
    <Accordion {...props} sx={{ ...styles.container, ...sx }}>
      <AccordionSummary sx={styles.title} expandIcon={<ChevronIcon width={24} height={24} aria-label="Expand" />}>
        {title}
      </AccordionSummary>
      <AccordionDetails data-testid="inserted-container" sx={childrenContainerSx}>
        {children}
      </AccordionDetails>
    </Accordion>
  );
};

export default CollapsibleBlock;
