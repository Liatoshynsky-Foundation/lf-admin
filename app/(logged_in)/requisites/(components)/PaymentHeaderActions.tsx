import { Box } from '@mui/material';

import { styles } from './PaymentHeaderActions.styles';
import Button from '~/ds-components/button/Button';

type PaymentHeaderActionsProps = Readonly<{
  onSave: () => void;
  saving?: boolean;
}>;

export const PaymentHeaderActions = ({onSave, saving = false }: PaymentHeaderActionsProps) => {
  return (
    <Box sx={styles.container}>
      <Button variant="filled" color="tertiary" size="medium" onClick={onSave} loading={saving}>
        Зберегти
      </Button>
    </Box>
  );
};
