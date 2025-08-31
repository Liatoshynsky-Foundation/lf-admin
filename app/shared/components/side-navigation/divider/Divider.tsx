import { Divider as MuiDvider, ListSubheader, Typography } from '@mui/material';
import { DividerProps } from 'app/types/sideNavigation';

import { styles } from './Divider.styles';

export const Divider: React.FC<DividerProps> = ({ open, text }) => {
  return open ? (
    <ListSubheader sx={{ ...styles.divider, ...styles.bothDivider }}>
      <Typography variant="custom14regular" color="textSecondary">
        {text}
      </Typography>
    </ListSubheader>
  ) : (
    <MuiDvider sx={styles.bothDivider} />
  );
};
