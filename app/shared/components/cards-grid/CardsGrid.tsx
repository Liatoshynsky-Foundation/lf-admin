import { Box } from '@mui/material';

import { styles } from './CardsGrid.styles';

interface CardsGridProps {
  children: React.ReactNode;
  dataTestId?: string;
  columns?: {
    xsCols?: number;
    smCols?: number;
    mdCols?: number;
    xlCols?: number;
  };
  gap?: string | number;
}

const CardsGrid = ({ children, columns, gap, dataTestId }: CardsGridProps) => (
  <Box sx={styles.grid({ ...columns, gap })} data-testid={dataTestId}>
    {children}
  </Box>
);

export default CardsGrid;
