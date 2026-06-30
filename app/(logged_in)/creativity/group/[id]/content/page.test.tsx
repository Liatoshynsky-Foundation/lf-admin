import { render, screen } from '@testing-library/react';
import React from 'react';

import ContentGroupPage from './page';

jest.mock('./GroupContentView', () => ({
  GroupContentView: ({ id }: { id: string }) => (
    <div data-testid="mock-edit-group-view">
      Mock Edit Group View - ID: {id}
    </div>
  )
}));

describe('ContentGroupPage Server Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should await params and render GroupContentView with the correct id', async () => {
    const mockParams = Promise.resolve({ id: 'test-group-123' });

    const PageComponent = await ContentGroupPage({ params: mockParams });
    render(PageComponent);

    const mockView = screen.getByTestId('mock-edit-group-view');
    expect(mockView).toBeInTheDocument();
    
    expect(mockView).toHaveTextContent('Mock Edit Group View - ID: test-group-123');
  });

  it('should handle different group IDs dynamically', async () => {
    const mockParams = Promise.resolve({ id: 'another-id-456' });

    const PageComponent = await ContentGroupPage({ params: mockParams });
    render(PageComponent);

    const mockView = screen.getByTestId('mock-edit-group-view');
    expect(mockView).toHaveTextContent('Mock Edit Group View - ID: another-id-456');
  });
});
