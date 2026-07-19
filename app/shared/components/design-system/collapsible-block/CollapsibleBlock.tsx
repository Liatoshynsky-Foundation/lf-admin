import { Accordion, AccordionDetails, AccordionProps, AccordionSummary, Box } from '@mui/material';
import React from 'react';

import { Grip } from '../../grip/Grip';
import { getStyles } from './CollapsibleBlock.styles';
import { sxToArray } from '~/lib/utils/sxToArray';
import ChevronIcon from '~/public/icons/chevron-down.svg';
import EyeIcon from '~/public/icons/eye.svg';
import EyeClosedIcon from '~/public/icons/eye-closed.svg';

interface CollapsibleBlockProps extends AccordionProps {
  title: string;
  childrenContainerSx?: object;
  grip?: boolean;
  hidden?: boolean;
  onToggleVisibility?: () => void;
}

const CollapsibleBlock = ({
  title,
  children,
  sx,
  grip = false,
  childrenContainerSx,
  hidden = false,
  onToggleVisibility,
  ...props
}: CollapsibleBlockProps) => {

  const styles = getStyles(grip, hidden);

  return (
    <Accordion {...props} sx={[styles.root, ...(sxToArray(sx))]}>
      <AccordionSummary expandIcon={<ChevronIcon width={24} height={24} aria-label="Expand" />} sx={styles.summary}>
        {grip && (
          <Box sx={styles.gripWrapper}>
            <Grip orientation='horizontal'/>
          </Box>
        )}
        <Box sx={styles.titleRow}>
          <Box component="span" sx={styles.titleText}>
            {title}
          </Box>
          {onToggleVisibility && (
            <Box
              component="span"
              role="button"
              tabIndex={0}
              aria-label={hidden ? 'Показати розділ' : 'Приховати розділ'}
              onClick={(event) => {
                event.stopPropagation();
                onToggleVisibility();
              }}
              onKeyDown={(event) => {
                if (event.key !== 'Enter' && event.key !== ' ') return;
                event.preventDefault();
                event.stopPropagation();
                onToggleVisibility();
              }}
              sx={styles.visibilityToggle}
            >
              {hidden ? <EyeClosedIcon /> : <EyeIcon />}
            </Box>
          )}
        </Box>
      </AccordionSummary>
      <AccordionDetails data-testid="inserted-container" sx={childrenContainerSx}>
        {children}
      </AccordionDetails>
    </Accordion >
  );
};

export default CollapsibleBlock;
