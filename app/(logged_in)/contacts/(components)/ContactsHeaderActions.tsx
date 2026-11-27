import { Box } from '@mui/material';

import { styles } from './ContactsHeaderActions.styles';
import Button from '~/ds-components/button/Button';

type ContactsHeaderActionsProps = Readonly<{
  onSave: () => void;
  saving?: boolean;
}>;

export const ContactsHeaderActions = ({ onSave, saving = false }: ContactsHeaderActionsProps) => {
  return (
    <Box sx={styles.container}>
      <Button variant="filled" color="tertiary" size="medium" onClick={onSave} loading={saving}>
        Зберегти зміни
      </Button>
    </Box>
  );
};
