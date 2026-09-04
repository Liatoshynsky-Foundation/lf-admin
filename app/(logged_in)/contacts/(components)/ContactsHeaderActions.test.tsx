import { fireEvent, render, screen } from '@testing-library/react';

import { CONTACT_LOCALES } from '../__mocks__/contacts';
import { ContactsHeaderActions } from './ContactsHeaderActions';
import type { LanguageSwitcherProps } from '~/shared/components/language-switcher/LanguageSwitcher';

const LANGUAGE_BUTTON_LABEL = 'language';
const SAVE_BUTTON_NAME_PATTERN = /зберегти/i;

jest.mock('~/shared/components/language-switcher/LanguageSwitcher', () => ({
  __esModule: true,
  default: ({ languageSwitcher }: LanguageSwitcherProps) => (
    <button onClick={() => languageSwitcher(CONTACT_LOCALES.en)}>{LANGUAGE_BUTTON_LABEL}</button>
  )
}));

describe('ContactsHeaderActions', () => {
  it('renders actions and forwards language and save events', () => {
    const onLanguageChange = jest.fn();
    const onSave = jest.fn();
    render(<ContactsHeaderActions onLanguageChange={onLanguageChange} onSave={onSave} />);

    fireEvent.click(screen.getByRole('button', { name: LANGUAGE_BUTTON_LABEL }));
    fireEvent.click(screen.getByRole('button', { name: SAVE_BUTTON_NAME_PATTERN }));

    expect(onLanguageChange).toHaveBeenCalledWith(CONTACT_LOCALES.en);
    expect(onSave).toHaveBeenCalledTimes(1);
  });
});
