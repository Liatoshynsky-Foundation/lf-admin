import { Box, IconButton, Tooltip } from '@mui/material';
import { Trash2 } from 'lucide-react';

import { styles } from './GroupPerformancesSection.styles';
import type { GroupPerformance } from '~/constants/creativity';
import { CustomTextField } from '~/shared/components/design-system/text-field/TextField';

export type PerformanceRowProps = {
  item: GroupPerformance;
  langKey: 'uk' | 'en';
  renderLinkPreview: (url: string) => React.ReactNode;
  onUpdateUrl: (id: string, value: string) => void;
  onUpdateCaption: (id: string, value: string) => void;
  onDeleteRequest: (id: string) => void;
};

export const PerformanceRow = ({
  item,
  langKey,
  renderLinkPreview,
  onUpdateUrl,
  onUpdateCaption,
  onDeleteRequest
}: PerformanceRowProps) => {
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
            />
          </Box>
        </Tooltip>

        <CustomTextField
          label="Підпис"
          value={item.caption?.[langKey] || ''}
          onChange={(e) => onUpdateCaption(item.id, e.target.value)}
          fullWidth
        />
      </Box>

      <IconButton aria-label="Видалити" onClick={() => onDeleteRequest(item.id)} sx={styles.actionIcon}>
        <Trash2 size={18} strokeWidth={1.5} />
      </IconButton>
    </>
  );
};
