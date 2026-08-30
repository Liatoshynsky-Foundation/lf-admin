import { Box } from '@mui/material';

import LanguageSwitcher from '~/components/language-switcher/LanguageSwitcher';
import { ContactsLocale } from '~/constants/contacts';
import Button from '~/ds-components/button/Button';

type ContactsHeaderActionsProps = Readonly<{
  onLanguageChange: (locale: ContactsLocale) => void;
  onSave: () => void;
}>;

export const ContactsHeaderActions = ({
  onLanguageChange,
  onSave
}: ContactsHeaderActionsProps) => {
  return (
    <Box display="flex" alignItems="center" gap={1}>
      <LanguageSwitcher languageSwitcher={onLanguageChange} />
      <Button variant="filled" color="tertiary" size="medium" onClick={onSave}>
        Зберегти
      </Button>
    </Box>
  );
};
