import { render, screen } from '@testing-library/react';
import React from 'react';

import Foundation from './page';

jest.mock('../shared/components/accordion-blocks/Liatoshynsky-office/Liatoshynsky-Office', () => ({
  LiatoshynskyOffice: () => <div>Liatoshynsky office</div>
}));

describe('Footer component', () => {
  it('renders the footer content', async () => {
    render(await Foundation());
    expect(screen.getByText(/Liatoshynsky office/i)).toBeInTheDocument();
  });
});
