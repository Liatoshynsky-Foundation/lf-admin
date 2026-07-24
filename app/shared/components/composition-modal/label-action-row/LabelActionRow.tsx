import { Button, SxProps, Theme } from '@mui/material';
import React from 'react';

import LabelRow from '../label-row/LabelRow';
import { styles } from './LabelActionRow.styles';

interface Props {
  title?: string;
  actionButtonText?: string;
  action: () => void;
  sx?: SxProps<Theme>;
  disabled?: boolean;
}

const LabelActionRow = ({ title = 'Текст', actionButtonText = 'Додати', action, sx, disabled }: Props) => {
  return (
    <LabelRow title={title} sx={sx}>
      <Button variant="contained" disableElevation onClick={action} sx={styles.button} disabled={disabled}>
        {actionButtonText}
      </Button>
    </LabelRow>
  );
};

export default LabelActionRow;
