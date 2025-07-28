import { render, screen } from '@testing-library/react';

import Home from './page';

describe('Home component', () => {
  it('renders the Home component correctly', async () => {
    render(<Home />);
    const homeElement = screen.getByText('Liatoshynsky project');
    expect(homeElement).toBeInTheDocument();
  });
});
