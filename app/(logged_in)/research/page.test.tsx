import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';

import ResearchPage from './page';

jest.mock('./ResearchPageContent', () => ({
  ResearchPageContent: () => <div data-testid="research-page-content" />
}));

describe('Research page', () => {
  it('renders ResearchPageContent', () => {
    render(<ResearchPage />);

    expect(screen.getByTestId('research-page-content')).toBeInTheDocument();
  });
});
