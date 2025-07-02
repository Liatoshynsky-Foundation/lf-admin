import { Accordion, AccordionDetails, AccordionProps, AccordionSummary, Box } from '@mui/material';
import React from 'react';

import { styles } from './CollapsibleBlock.styles';
import ChevronIcon from '~/public/icons/chevron-down.svg';

interface CollapsibleBlockProps extends AccordionProps {
  title: string;
}

const CollapsibleBlock = ({ title, children, ...props }: CollapsibleBlockProps) => {
  return (
    <Box component="div" sx={styles.container}>
      <Accordion sx={styles.accorditionOverWrite} {...props}>
        <AccordionSummary sx={styles.title} expandIcon={<ChevronIcon width={24} height={24} aria-label="Expand" />}>
          {title}
        </AccordionSummary>
        <AccordionDetails data-testid="inserted-container">{children}</AccordionDetails>
      </Accordion>
    </Box>
  );
};

export default CollapsibleBlock;
