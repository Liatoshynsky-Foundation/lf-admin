import { fireEvent, render, screen } from '@testing-library/react';

import { CONTACT_LOCALES, CONTACTS_DATA } from '../__mocks__/contacts';
import ContactsPageContent from './ContactsPageContent';
import { CONTACTS_ERROR, CONTACTS_LOADING, type ContactsLocale } from '~/constants/contacts';

const mockUseContacts = jest.fn();
const mockUpdateContacts = jest.fn();
const LANGUAGE_BUTTON_LABEL = 'change language';
const SAVE_BUTTON_LABEL = 'save contacts';
const CONTACT_INFORMATION_ID = 'contacts-page-content';

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
  ContactInformationBlock: ({ locale }: { locale: ContactsLocale }) => (
    <div data-testid={CONTACT_INFORMATION_ID}>{locale}</div>
  )
}));
jest.mock('./section-blocks/SocialNetworksBlock', () => ({
  __esModule: true,
  SocialNetworksBlock: () => <div data-testid="social-networks" />
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

  it('renders content, changes locale and saves the current data', () => {
    mockUseContacts.mockReturnValue({ data: CONTACTS_DATA, loading: false });
    render(<ContactsPageContent />);

    expect(screen.getByTestId(CONTACT_INFORMATION_ID)).toHaveTextContent(CONTACT_LOCALES.uk);
    fireEvent.click(screen.getByRole('button', { name: LANGUAGE_BUTTON_LABEL }));
    expect(screen.getByTestId(CONTACT_INFORMATION_ID)).toHaveTextContent(CONTACT_LOCALES.en);
    fireEvent.click(screen.getByRole('button', { name: SAVE_BUTTON_LABEL }));

    expect(mockUpdateContacts).toHaveBeenCalledWith({
      contactInformation: CONTACTS_DATA.contactInformation,
      socialNetworks: CONTACTS_DATA.socialNetworks.map((item, id) => ({ ...item, id }))
    });
  });
});
