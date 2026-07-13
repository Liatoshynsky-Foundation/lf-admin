import { render, screen } from '@testing-library/react';

import { GroupContentViewLoading } from './GroupContentViewLoading';

describe('GroupContentViewLoading Component', () => {
  it('renders loading text correctly', () => {
    render(<GroupContentViewLoading />);
    
    expect(screen.getByText('Завантаження...')).toBeInTheDocument();
  });
});
