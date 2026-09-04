import { Box } from '@mui/material';

import { styles } from './ContactsHeaderActions.styles';
import { type ContactsLocale } from '~/constants/contacts';
import Button from '~/ds-components/button/Button';
import LanguageSwitcher from '~/shared/components/language-switcher/LanguageSwitcher';

type ContactsHeaderActionsProps = Readonly<{
  onLanguageChange: (locale: ContactsLocale) => void;
  onSave: () => void;
}>;

export const ContactsHeaderActions = ({ onLanguageChange, onSave }: ContactsHeaderActionsProps) => {
  return (
    <Box sx={styles.container}>
      <LanguageSwitcher languageSwitcher={onLanguageChange} />
      <Button variant="filled" color="tertiary" size="medium" onClick={onSave}>
        Зберегти
      </Button>
    </Box>
  );
};
