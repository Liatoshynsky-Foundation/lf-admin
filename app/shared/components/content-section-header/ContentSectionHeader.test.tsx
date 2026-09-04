import { render, screen } from '@testing-library/react';

import { ContentSectionHeader } from './ContentSectionHeader';

const TITLE = 'Contact information';

describe('ContentSectionHeader', () => {
  it('renders the title and divider', () => {
    render(<ContentSectionHeader title={TITLE} />);
    expect(screen.getByText(TITLE)).toBeInTheDocument();
    expect(screen.getByRole('separator')).toBeInTheDocument();
  });
});
