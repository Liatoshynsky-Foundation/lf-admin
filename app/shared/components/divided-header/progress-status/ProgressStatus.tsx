import { Stack, Typography } from '@mui/material';
import { CircleCheck,RefreshCcwDot } from 'lucide-react';

import { styles } from './ProgressStatus.styles';

type ProgressStatusProps = {
  isSaved?: boolean;
};

const ProgressStatus = ({ isSaved = true }: ProgressStatusProps) => {
  const displayText = isSaved ? 'Зміни збережено' : 'Редагування';

  return (
    <Stack direction="row" spacing={1} alignItems="center">
      {isSaved ? <CircleCheck strokeWidth={1.5} size={24} /> : <RefreshCcwDot strokeWidth={1.5} size={24} />}
      <Typography
        key={String(isSaved)}
        sx={{
          transition: 'opacity 0.3s ease',
          animation: isSaved ? `${styles.blinkThenFade} 4s ease` : `${styles.blinkStay} 0.4s ease`,
          opacity: isSaved ? 0 : 1
        }}
        variant="customMedium14Tight"
      >
        {displayText}
      </Typography>
    </Stack>
  );
};

export default ProgressStatus;
