import { Accordion, AccordionDetails, AccordionProps, AccordionSummary, Box } from '@mui/material';
import React from 'react';

import { Grip } from '../../grip/Grip';
import { getStyles } from './CollapsibleBlock.styles';
import { sxToArray } from '~/lib/utils/sxToArray';
import ChevronIcon from '~/public/icons/chevron-down.svg';
import EyeIcon from '~/public/icons/eye.svg';
import EyeClosedIcon from '~/public/icons/eye-closed.svg';
import TrashIcon from '~/public/icons/trash.svg';
import { useStore } from '~/store';

interface CollapsibleBlockProps extends AccordionProps {
  title: string;
  childrenContainerSx?: object;
  grip?: boolean;
  hidden?: boolean;
  onToggleVisibility?: () => void;
  onDelete?: () => void;
}

const CollapsibleBlock = ({
  title,
  children,
  sx,
  grip = false,
  childrenContainerSx,
  hidden = false,
  onToggleVisibility,
  onDelete,
  ...props
}: CollapsibleBlockProps) => {
  const isSaving = useStore((state) => state.isSaving);

  const styles = getStyles(grip, hidden, isSaving);

  return (
    <Accordion {...props} sx={[styles.root, ...sxToArray(sx)]}>
      <AccordionSummary expandIcon={<ChevronIcon width={24} height={24} aria-label="Expand" />} sx={styles.summary}>
        {grip && (
          <Box sx={styles.gripWrapper}>
            <Grip orientation="horizontal" />
          </Box>
        )}
        <Box sx={styles.titleRow}>
          <Box component="span" sx={[styles.titleText, onDelete ? { flex: '1 1 auto' } : null]}>
            {title}
          </Box>
          {onDelete && (
            <Box
              component="span"
              role="button"
              tabIndex={0}
              aria-label="Видалити секцію"
              onClick={(event) => {
                event.stopPropagation();
                onDelete();
              }}
              onKeyDown={(event) => {
                if (event.key !== 'Enter' && event.key !== ' ') return;
                event.preventDefault();
                event.stopPropagation();
                onDelete();
              }}
              sx={styles.deleteButton}
            >
              <TrashIcon width={20} height={22} />
            </Box>
          )}
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
    </Accordion>
  );
};

export default CollapsibleBlock;
