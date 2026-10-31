import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import { Trash2 } from 'lucide-react';
import { ClipboardEvent } from 'react';

import { styles } from './GroupPerformancesSection.styles';
import { NormalizedGroupPerformance } from '~/constants/creativity';
import {OPUS_FIELD_LIMITS} from '~/constants/opus';
import { CustomTextField } from '~/shared/components/design-system/text-field/TextField';

const CAPTION_MAX = OPUS_FIELD_LIMITS.caption.max;

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
  const captionValue = item.caption?.[langKey] || '';

  const captionUk = item.caption?.uk || '';
  const captionEn = item.caption?.en || '';

  const isRowEmpty = !urlValue.trim() && !captionUk.trim() && !captionEn.trim();
  const showCaptionError = Boolean(captionError && !isRowEmpty);
  const showUrlError = Boolean(urlError && !isRowEmpty && !urlValue.trim());

  const handleCaptionPaste = (e: ClipboardEvent<HTMLDivElement>) => {
    const pastedText = e.clipboardData.getData('text');
    const currentValue = captionValue;
    const remaining = CAPTION_MAX - currentValue.length;

    if (pastedText.length > remaining) {
      e.preventDefault();
      const trimmed = (currentValue + pastedText).slice(0, CAPTION_MAX);
      onUpdateCaption(item.id, trimmed);
    }
  };

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
              label="URL"
              value={item.url}
              onChange={(e) => onUpdateUrl(item.id, e.target.value)}
              fullWidth
              error={showUrlError}
              helperText={showUrlError ? urlError : ''}
            />
          </Box>
        </Tooltip>

        <Box sx={styles.captionWrapper}>
          <CustomTextField
            label="Підпис"
            value={captionValue}
            onChange={(e) => onUpdateCaption(item.id, e.target.value.slice(0, OPUS_FIELD_LIMITS.caption.max))}
            fullWidth
            error={showCaptionError}
            helperText={showCaptionError ? captionError : ' '}
            inputProps={{ maxLength: CAPTION_MAX }}
            onPaste={handleCaptionPaste}
          />
          <Typography variant="caption" sx={styles.charCounter}>
            {captionValue.length}/{CAPTION_MAX}
          </Typography>
        </Box>
      </Box>

      <IconButton aria-label="Видалити" onClick={() => onDeleteRequest(item.id)} sx={styles.actionIcon}>
        <Trash2 size={18} strokeWidth={1.5} />
      </IconButton>
    </>
  );
};
