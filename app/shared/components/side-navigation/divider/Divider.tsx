import { Divider as MuiDvider, ListSubheader } from '@mui/material';
import { DividerProps } from 'app/types/sideNavigation';

import { styles } from './Divider.styles';

export const Divider: React.FC<DividerProps> = ({ open, text }) => {
  return open ? (
    <ListSubheader sx={{ ...styles.divider, ...styles.bothDivider }}>{text}</ListSubheader>
  ) : (
    <MuiDvider sx={styles.bothDivider} />
  );
};
