import { Box, IconButton, Tooltip } from '@mui/material';
import { Trash2 } from 'lucide-react';

import { styles } from './GroupPerformancesSection.styles';
import { NormalizedGroupPerformance } from '~/constants/creativity';
import {OPUS_FIELD_LIMITS} from '~/constants/opus';
import { CustomTextField } from '~/shared/components/design-system/text-field/TextField';

export type PerformanceRowProps = {
  item: NormalizedGroupPerformance;
  langKey: 'uk' | 'en';
  urlError?: string;
  captionError?: string;
  renderLinkPreview: (url: string) => React.ReactNode;
  onUpdateUrl: (id: string, value: string) => void;
  onUpdateCaption: (id: string, value: string) => void;
  onDeleteRequest: (id: string) => void;
};

export const PerformanceRow = ({
  item,
  langKey,
  urlError,
  captionError,
  renderLinkPreview,
  onUpdateUrl,
  onUpdateCaption,
  onDeleteRequest
}: PerformanceRowProps) => {
  const urlValue = item.url || '';

  const captionUk = item.caption?.uk || '';
  const captionEn = item.caption?.en || '';

  const isRowEmpty = !urlValue.trim() && !captionUk.trim() && !captionEn.trim();
  const showCaptionError = Boolean(captionError && !isRowEmpty);
  const showUrlError = Boolean(urlError && !isRowEmpty && !urlValue.trim());

  return (
    <>
      <Box sx={styles.inputsWrapper}>
        <Tooltip
          title={renderLinkPreview(item.url || '')}
          placement="top-start"
          enterDelay={400}
          slotProps={{ tooltip: { sx: styles.tooltipBox } }}
        >
          <Box sx={{ width: '100%' }}>
            <CustomTextField
              label="Canonical URL"
              value={item.url}
              onChange={(e) => onUpdateUrl(item.id, e.target.value)}
              fullWidth
              error={showUrlError}
              helperText={showUrlError ? urlError : ''}
            />
          </Box>
        </Tooltip>

        <CustomTextField
          label="Підпис"
          value={item.caption?.[langKey] || ''}
          onChange={(e) => onUpdateCaption(item.id, e.target.value)}
          fullWidth
          error={showCaptionError}
          helperText={showCaptionError ? captionError : ''}
          inputProps={{ maxLength: OPUS_FIELD_LIMITS.caption.max }}
        />
      </Box>

      <IconButton aria-label="Видалити" onClick={() => onDeleteRequest(item.id)} sx={styles.actionIcon}>
        <Trash2 size={18} strokeWidth={1.5} />
      </IconButton>
    </>
  );
};
