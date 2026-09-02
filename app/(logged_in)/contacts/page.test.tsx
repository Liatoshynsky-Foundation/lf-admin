import { render, screen } from '@testing-library/react';

import ContactsPage from './page';

const CONTACTS_PAGE_TITLE = 'Контакти';

jest.mock('next/navigation', () => ({ useRouter: jest.fn(() => ({ push: jest.fn() })) }));
jest.mock('~/ds-components/collapsible-block/CollapsibleBlock', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <section>{children}</section>
}));
jest.mock('~/components/language-switcher/LanguageSwitcher', () => ({
  __esModule: true,
  default: () => <button type="button">language</button>
}));
jest.mock('./(components)/section-blocks/SocialNetworksBlock', () => ({
  __esModule: true,
  SocialNetworksBlock: () => <div data-testid="social-networks-block" />
}));

describe('ContactsPage', () => {
  it('renders the contacts page', () => {
    render(<ContactsPage />);

    expect(screen.getByRole('heading', { name: CONTACTS_PAGE_TITLE, level: 4 })).toBeInTheDocument();
  });
});
