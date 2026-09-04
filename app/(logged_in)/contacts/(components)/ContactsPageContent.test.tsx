import { fireEvent, render, screen } from '@testing-library/react';

import { CONTACT_INFORMATION, CONTACT_LOCALES, CONTACTS_DATA, SOCIAL_NETWORKS } from '../__mocks__/contacts';
import ContactsPageContent from './ContactsPageContent';
import {
  type ContactInformation,
  CONTACTS_ERROR,
  CONTACTS_LOADING,
  type ContactsLocale,
  INITIAL_CONTACT_INFORMATION,
  type SocialNetworkFormItem
} from '~/constants/contacts';

const mockUseContacts = jest.fn();
const mockUpdateContacts = jest.fn();
const LANGUAGE_BUTTON_LABEL = 'change language';
const SAVE_BUTTON_LABEL = 'save contacts';
const CONTACT_INFORMATION_ID = 'contacts-page-content';
const CONTACT_NAME_INPUT_LABEL = 'contact name';
const SOCIAL_NETWORK_INPUT_LABEL = 'social network';

jest.mock('~/shared/hooks/use-contacts/useContacts', () => ({ useContacts: () => mockUseContacts() }));
jest.mock('~/shared/hooks/use-upsert-contacts/useUpsertContacts', () => ({
  useUpsertContacts: () => ({ updateContacts: mockUpdateContacts })
}));
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
  ContactInformationBlock: ({ data, locale }: { data: ContactInformation; locale: ContactsLocale }) => (
    <div data-testid={CONTACT_INFORMATION_ID}>
      <span>{locale}</span>
      <input aria-label={CONTACT_NAME_INPUT_LABEL} value={data.name[locale]} readOnly />
    </div>
  )
}));
jest.mock('./section-blocks/SocialNetworksBlock', () => ({
  __esModule: true,
  SocialNetworksBlock: ({ items }: { items: SocialNetworkFormItem[] }) => (
    <div data-testid="social-networks">
      {items.map((item) => (
        <input key={item.id} aria-label={SOCIAL_NETWORK_INPUT_LABEL} value={item.link} readOnly />
      ))}
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

  it('renders content, changes locale and saves the current data', () => {
    mockUseContacts.mockReturnValue({ data: CONTACTS_DATA, loading: false });
    render(<ContactsPageContent />);

    expect(screen.getByTestId(CONTACT_INFORMATION_ID)).toHaveTextContent(CONTACT_LOCALES.uk);
    fireEvent.click(screen.getByRole('button', { name: LANGUAGE_BUTTON_LABEL }));
    expect(screen.getByTestId(CONTACT_INFORMATION_ID)).toHaveTextContent(CONTACT_LOCALES.en);
    fireEvent.click(screen.getByRole('button', { name: SAVE_BUTTON_LABEL }));

    expect(mockUpdateContacts).toHaveBeenCalledWith({
      contactInformation: CONTACT_INFORMATION,
      socialNetworks: SOCIAL_NETWORKS.map((item, id) => ({ ...item, id }))
    });
  });
});
