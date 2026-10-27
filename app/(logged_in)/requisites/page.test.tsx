import { render, screen } from '@testing-library/react';

import RequisitesPage from './page';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({ push: jest.fn() }))
}));

jest.mock('~/public/icons/type-pdf.svg', () => ({
  __esModule: true,
  default: () => <svg data-testid="PdfIcon" />
}));

jest.mock('~/ds-components/collapsible-block/CollapsibleBlock', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <section>{children}</section>
}));

describe('RequisitesPage', () => {
  it('renders the requisites page with title and currency tabs', () => {
    render(<RequisitesPage />);

    expect(screen.getByRole('heading', { name: 'Реквізити', level: 4 })).toBeInTheDocument();
    expect(screen.getByText('UAH')).toBeInTheDocument();
    expect(screen.getByText('Додати реквізити')).toBeInTheDocument();
    expect(screen.getByText('PDF файл')).toBeInTheDocument();
  });
});
