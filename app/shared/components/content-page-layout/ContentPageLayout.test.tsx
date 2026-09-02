import { render, screen } from '@testing-library/react';

import { ContentPageLayout } from './ContentPageLayout';

const PAGE_TITLE = 'Contacts';
const HEADER_CONTENT = 'Header content';
const PAGE_CONTENT = 'Page content';
const ORIGIN_URL = '/dashboard';
const SAVE_LABEL = 'Save';

jest.mock('next/navigation', () => ({ useRouter: jest.fn(() => ({ push: jest.fn() })) }));

describe('ContentPageLayout', () => {
  it('renders the header content and forwards header properties', () => {
    render(
      <ContentPageLayout
        title={PAGE_TITLE}
        headerContent={HEADER_CONTENT}
        originUrl={ORIGIN_URL}
        showBackButton={false}
        rightActions={SAVE_LABEL}
      >
        {PAGE_CONTENT}
      </ContentPageLayout>
    );

    const header = screen.getByText(SAVE_LABEL).parentElement?.parentElement?.parentElement;
    expect(header).toHaveTextContent(PAGE_TITLE);
    expect(header).toHaveTextContent(HEADER_CONTENT);
    expect(screen.getByText(SAVE_LABEL)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: new RegExp(ORIGIN_URL) })).not.toBeInTheDocument();
    expect(screen.getByText(PAGE_CONTENT)).toBeInTheDocument();
  });

  it('renders only the main content when no header content is provided', () => {
    render(<ContentPageLayout>{PAGE_CONTENT}</ContentPageLayout>);

    expect(screen.queryByRole('banner')).not.toBeInTheDocument();
    expect(screen.getByText(PAGE_CONTENT)).toBeInTheDocument();
  });
});
