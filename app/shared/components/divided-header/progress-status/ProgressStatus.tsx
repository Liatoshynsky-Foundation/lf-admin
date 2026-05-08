import { Stack, SxProps, Theme, Typography } from '@mui/material';
import { CircleCheck, RefreshCcwDot } from 'lucide-react';

import { styles } from './ProgressStatus.styles';

type ProgressStatusProps = {
  isSaved?: boolean;
  sx?: SxProps<Theme>;
};

const ProgressStatus = ({ isSaved = true, sx }: ProgressStatusProps) => {
  const displayText = isSaved ? 'Зміни збережено' : 'Редагування';

  return (
    <Stack sx={sx} direction="row" spacing={1} alignItems="center">
      {isSaved ? <CircleCheck strokeWidth={1.5} size={24} /> : <RefreshCcwDot strokeWidth={1.5} size={24} />}
      <Typography
        key={String(isSaved)}
        sx={{
          transition: 'opacity 0.3s ease',
          animation: isSaved ? `${styles.blinkThenFade} 4s ease forwards` : `${styles.blinkStay} 0.4s ease`,
          opacity: isSaved ? 0 : 1
        }}
        variant="subtitle2"
      >
        {displayText}
      </Typography>
    </Stack>
  );
};

export default ProgressStatus;
