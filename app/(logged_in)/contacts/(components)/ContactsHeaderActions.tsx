import { Box } from '@mui/material';

import LanguageSwitcher from '~/components/language-switcher/LanguageSwitcher';
import Button from '~/ds-components/button/Button';

type ContactsHeaderActionsProps = Readonly<{
  onLanguageChange?: (language: 'uk' | 'en') => void;
}>;

export const ContactsHeaderActions = ({ onLanguageChange = () => undefined }: ContactsHeaderActionsProps) => (
  <Box display="flex" alignItems="center" gap={1}>
    <LanguageSwitcher languageSwitcher={onLanguageChange} />
    <Button variant="filled" color="tertiary" size="medium">
      Зберегти
    </Button>
  </Box>
);
