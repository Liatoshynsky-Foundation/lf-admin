import { Accordion, AccordionDetails, AccordionProps, AccordionSummary, Box } from '@mui/material';
import React from 'react';

import { Grip } from '../../grip/Grip';
import { getStyles } from './CollapsibleBlock.styles';
import { sxToArray } from '~/lib/utils/sxToArray';
import ChevronIcon from '~/public/icons/chevron-down.svg';

const EyeIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    style={{ display: 'block', overflow: 'visible' }}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M2.06202 12.3481C1.97868 12.1236 1.97868 11.8766 2.06202 11.6521C2.87372 9.68397 4.25153 8.00116 6.02079 6.81701C7.79004 5.63287 9.87106 5.00073 12 5.00073C14.129 5.00073 16.21 5.63287 17.9792 6.81701C19.7485 8.00116 21.1263 9.68397 21.938 11.6521C22.0214 11.8766 22.0214 12.1236 21.938 12.3481C21.1263 14.3163 19.7485 15.9991 17.9792 17.1832C16.21 18.3674 14.129 18.9995 12 18.9995C9.87106 18.9995 7.79004 18.3674 6.02079 17.1832C4.25153 15.9991 2.87372 14.3163 2.06202 12.3481Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const EyeClosedIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    style={{ display: 'block', overflow: 'visible' }}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M15.0001 18L14.2781 14.75M2 8C2.74835 10.0508 4.10913 11.8219 5.8979 13.0733C7.68667 14.3247 9.81695 14.9959 12 14.9959C14.1831 14.9959 16.3133 14.3247 18.1021 13.0733C19.8909 11.8219 21.2516 10.0508 22 8M19.9999 15L18.2739 12.95M4 15L5.726 12.95M9 18L9.722 14.75"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

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
