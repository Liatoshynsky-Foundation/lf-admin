import { act, fireEvent, render, screen } from '@testing-library/react';
import toast from 'react-hot-toast';

import { CONTACT_INFORMATION, CONTACT_LOCALES, CONTACTS_DATA, SOCIAL_NETWORKS } from '../__mocks__/contacts';
import ContactsPageContent from './ContactsPageContent';
import {
  type ContactInformation,
  CONTACTS_ERROR,
  CONTACTS_LOADING,
  CONTACTS_VALIDATION_ERROR,
  type ContactsLocale,
  INITIAL_CONTACT_INFORMATION
} from '~/constants/contacts';

const mockUseContacts = jest.fn();
const mockUpdateContacts = jest.fn();
const LANGUAGE_BUTTON_LABEL = 'change language';
const SAVE_BUTTON_LABEL = 'save contacts';
const CONTACT_INFORMATION_ID = 'contacts-page-content';
const CONTACT_NAME_INPUT_LABEL = 'contact name';
const LOCALIZED_FIELD_CHANGE_LABEL = 'change localized field';
const PLAIN_FIELD_CHANGE_LABEL = 'change plain field';
const LOCALIZED_FIELD_BLUR_LABEL = 'blur localized field';
const PLAIN_FIELD_BLUR_LABEL = 'blur plain field';
const SOCIAL_NETWORK_FIELD_CHANGE_LABEL = 'change social network field';
const SOCIAL_NETWORK_FIELD_BLUR_LABEL = 'blur social network field';

jest.mock('~/shared/hooks/use-contacts/useContacts', () => ({ useContacts: () => mockUseContacts() }));
jest.mock('react-hot-toast', () => ({ __esModule: true, default: { error: jest.fn() } }));
jest.mock('~/shared/hooks/use-upsert-contacts/useUpsertContacts', () => {
  const actual = jest.requireActual('~/shared/hooks/use-upsert-contacts/useUpsertContacts');

  return {
    ...actual,
    useUpsertContacts: () => ({ updateContacts: mockUpdateContacts, loading: false })
  };
});
jest.mock('~/shared/components/content-page-layout/ContentPageLayout', () => ({
  __esModule: true,
  ContentPageLayout: ({ children, rightActions }: { children: React.ReactNode; rightActions: React.ReactNode }) => (
    <main>
      {rightActions}
      {children}
    </main>
  )
}));
jest.mock('~/ds-components/collapsible-block/CollapsibleBlock', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <section>{children}</section>
}));
jest.mock('~/shared/components/empty-state', () => ({
  __esModule: true,
  EmptyState: ({ title, description }: { title: string; description: string }) => (
    <div>
      <h1>{title}</h1>
      <p>{description}</p>
    </div>
  )
}));
jest.mock('./ContactsHeaderActions', () => ({
  __esModule: true,
  ContactsHeaderActions: ({
    onLanguageChange,
    onSave
  }: {
    onLanguageChange: (locale: ContactsLocale) => void;
    onSave: () => void;
  }) => (
    <div>
      <button onClick={() => onLanguageChange(CONTACT_LOCALES.en)}>{LANGUAGE_BUTTON_LABEL}</button>
      <button onClick={onSave}>{SAVE_BUTTON_LABEL}</button>
    </div>
  )
}));
jest.mock('./section-blocks/ContactInformationBlock', () => ({
  __esModule: true,
  ContactInformationBlock: ({
    data,
    locale,
    onFieldChange,
    onFieldBlur
  }: {
    data: ContactInformation;
    locale: ContactsLocale;
    onFieldChange?: (field: keyof ContactInformation, fieldLocale?: ContactsLocale) => void;
    onFieldBlur?: (field: keyof ContactInformation, fieldLocale?: ContactsLocale) => void;
  }) => (
    <div data-testid={CONTACT_INFORMATION_ID}>
      <span>{locale}</span>
      <input aria-label={CONTACT_NAME_INPUT_LABEL} value={data.foundationName[locale]} readOnly />
      <button onClick={() => onFieldChange?.('foundationName', locale)}>{LOCALIZED_FIELD_CHANGE_LABEL}</button>
      <button onClick={() => onFieldChange?.('email')}>{PLAIN_FIELD_CHANGE_LABEL}</button>
      <button onClick={() => onFieldBlur?.('foundationName', locale)}>{LOCALIZED_FIELD_BLUR_LABEL}</button>
      <button onClick={() => onFieldBlur?.('email')}>{PLAIN_FIELD_BLUR_LABEL}</button>
    </div>
  )
}));
jest.mock('./section-blocks/SocialNetworksBlock', () => ({
  __esModule: true,
  SocialNetworksBlock: ({
    onFieldChange,
    onFieldBlur
  }: {
    onFieldChange?: (index: number) => void;
    onFieldBlur?: (index: number) => void;
  }) => (
    <div data-testid="social-networks">
      <button onClick={() => onFieldChange?.(0)}>{SOCIAL_NETWORK_FIELD_CHANGE_LABEL}</button>
      <button onClick={() => onFieldBlur?.(0)}>{SOCIAL_NETWORK_FIELD_BLUR_LABEL}</button>
    </div>
  )
}));

describe('ContactsPageContent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state', () => {
    mockUseContacts.mockReturnValue({ data: null, loading: true });
    render(<ContactsPageContent />);
    expect(screen.getByText(CONTACTS_LOADING.title)).toBeInTheDocument();
  });

  it('renders error state', () => {
    mockUseContacts.mockReturnValue({ data: null, loading: false });
    render(<ContactsPageContent />);
    expect(screen.getByText(CONTACTS_ERROR.title)).toBeInTheDocument();
  });

  it('renders empty contact information fields when no contact information exists', () => {
    mockUseContacts.mockReturnValue({
      data: { ...CONTACTS_DATA, contactInformation: INITIAL_CONTACT_INFORMATION },
      loading: false
    });
    render(<ContactsPageContent />);

    expect(screen.getByRole('textbox', { name: CONTACT_NAME_INPUT_LABEL })).toHaveValue('');
  });

  it('does not update contacts when validation fails', () => {
    mockUseContacts.mockReturnValue({
      data: {
        ...CONTACTS_DATA,
        contactInformation: { ...CONTACT_INFORMATION, email: '' }
      },
      loading: false
    });
    render(<ContactsPageContent />);

    fireEvent.click(screen.getByRole('button', { name: SAVE_BUTTON_LABEL }));

    expect(mockUpdateContacts).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalledWith(CONTACTS_VALIDATION_ERROR);
  });

  it('renders content, changes locale and saves the current data', async () => {
    mockUseContacts.mockReturnValue({ data: CONTACTS_DATA, loading: false });
    render(<ContactsPageContent />);

    expect(screen.getByTestId(CONTACT_INFORMATION_ID)).toHaveTextContent(CONTACT_LOCALES.uk);
    fireEvent.click(screen.getByRole('button', { name: LANGUAGE_BUTTON_LABEL }));
    expect(screen.getByTestId(CONTACT_INFORMATION_ID)).toHaveTextContent(CONTACT_LOCALES.en);
    fireEvent.click(screen.getByRole('button', { name: SAVE_BUTTON_LABEL }));

    fireEvent.click(screen.getByRole('button', { name: LOCALIZED_FIELD_CHANGE_LABEL }));
    fireEvent.click(screen.getByRole('button', { name: PLAIN_FIELD_CHANGE_LABEL }));
    fireEvent.click(screen.getByRole('button', { name: LOCALIZED_FIELD_BLUR_LABEL }));
    fireEvent.click(screen.getByRole('button', { name: PLAIN_FIELD_BLUR_LABEL }));
    fireEvent.click(screen.getByRole('button', { name: SOCIAL_NETWORK_FIELD_CHANGE_LABEL }));
    fireEvent.click(screen.getByRole('button', { name: SOCIAL_NETWORK_FIELD_BLUR_LABEL }));

    expect(mockUpdateContacts).toHaveBeenCalledWith({
      contactInformation: CONTACT_INFORMATION,
      socialNetworks: SOCIAL_NETWORKS.map((item, id) => ({ ...item, id }))
    });
  });

  it('saves contacts successfully', async () => {
    mockUseContacts.mockReturnValue({ data: CONTACTS_DATA, loading: false });
    mockUpdateContacts.mockResolvedValue({ data: { updateContacts: CONTACTS_DATA } });

    render(<ContactsPageContent />);

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: SAVE_BUTTON_LABEL }));
    });

    expect(mockUpdateContacts).toHaveBeenCalledTimes(1);
  });
});
