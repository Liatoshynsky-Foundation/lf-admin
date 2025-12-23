import { render, screen } from '@testing-library/react';
import React from 'react';

import Legacy from './page';

jest.mock('./MediaMentionsTest.client', () => {
  return function DummyMediaMentionsTest() {
    return <div>MediaMentionsTest Component</div>;
  };
});

describe('Footer component', () => {
  it('renders the footer content', () => {
    render(<Legacy />);
    expect(screen.getByText(/Legacy/i)).toBeInTheDocument();
  });
});
