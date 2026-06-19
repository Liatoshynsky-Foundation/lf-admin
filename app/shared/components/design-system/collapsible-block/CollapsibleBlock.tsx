import { Accordion, AccordionDetails, AccordionProps, AccordionSummary, Box } from '@mui/material';
import React from 'react';

import { Grip } from '../../grip/Grip';
import { getStyles } from './CollapsibleBlock.styles';
import { sxToArray } from '~/lib/utils/sxToArray';
import ChevronIcon from '~/public/icons/chevron-down.svg';
interface CollapsibleBlockProps extends AccordionProps {
  title: string;
  childrenContainerSx?: object;
  grip?: boolean;
}

const CollapsibleBlock = ({ title, children, sx, grip = false, childrenContainerSx, ...props }: CollapsibleBlockProps) => {
  
  const styles = getStyles(grip);

  return (
    <Accordion {...props} sx={[styles.root, ...(sxToArray(sx))]}>
      <AccordionSummary expandIcon={<ChevronIcon width={24} height={24} aria-label="Expand" />} sx={styles.summary}>
        {grip && (
          <Box sx={styles.gripWrapper}>
            <Grip orientation='horizontal'/>
          </Box>
        )}
        {title}
      </AccordionSummary>
      <AccordionDetails data-testid="inserted-container" sx={childrenContainerSx}>
        {children}
      </AccordionDetails>
    </Accordion >
  );
};

export default CollapsibleBlock;
