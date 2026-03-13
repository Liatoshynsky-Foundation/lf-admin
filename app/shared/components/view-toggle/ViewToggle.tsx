import GridViewOutlinedIcon from '@mui/icons-material/GridViewOutlined';
import MenuIcon from '@mui/icons-material/Menu';
import { Box, IconButton } from '@mui/material';

import { styles } from './ViewToggle.styles';
import { type FilesCardsLayoutView } from '~/shared/components/files-cards-layout';

type ViewToggleProps = Readonly<{
  value: FilesCardsLayoutView;
  onChange: (value: FilesCardsLayoutView) => void;
}>;

export function ViewToggle({ value, onChange }: ViewToggleProps) {
  return (
    <Box sx={styles.root} role="group" aria-label="Перемикач вигляду файлів" data-testid="ViewToggle">
      <IconButton
        aria-label="Сітка"
        onClick={() => onChange('grid')}
        sx={{ ...styles.button, ...(value === 'grid' ? styles.active : styles.inactive) }}
      >
        <GridViewOutlinedIcon sx={{ fontSize: 28, transform: 'scale(0.94)' }} />
      </IconButton>

      <IconButton
        aria-label="Список"
        onClick={() => onChange('list')}
        sx={{ ...styles.button, ...(value === 'list' ? styles.active : styles.inactive) }}
      >
        <MenuIcon sx={{ fontSize: 28 }} />
      </IconButton>
    </Box>
  );
}
