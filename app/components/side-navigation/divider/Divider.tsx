import { ListSubheader, Divider as MuiDvider } from '@mui/material';
import { styles } from './Divider.styles';
import { DividerProps } from 'app/types/sideNavigation';

export const Divider: React.FC<DividerProps> = ({ open, text }) => {
  return open ? (
    <ListSubheader sx={{ ...styles.divider, ...styles.bothDivider }}>
      {text}
    </ListSubheader>
  ) : (
    <MuiDvider sx={styles.bothDivider} />
  );
};
