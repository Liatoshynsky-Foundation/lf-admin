import { fireEvent,render, screen } from '@testing-library/react';

import { TitleDropdown } from './TitleDropdown';

describe('TitleDropdown Component', () => {
  it('should render the multilingual type correctly', () => {
    render(<TitleDropdown title="Про Фундацію" type="multilingual" language="UA" onMenuOpen={() => {}} />);

    expect(screen.getByText('Про Фундацію')).toBeInTheDocument();
    expect(screen.getByText('UA')).toBeInTheDocument();
  });

  it('should render the SEO type correctly', () => {
    render(<TitleDropdown title="Налаштування" type="SEO" onMenuOpen={() => {}} />);

    expect(screen.getByText('Налаштування')).toBeInTheDocument();
    expect(screen.getByText('SEO')).toBeInTheDocument();
  });

  it('should call onMenuOpen when the dropdown trigger is clicked', () => {
    const mockOnMenuOpen = jest.fn();

    render(<TitleDropdown title="Про Фундацію" type="multilingual" language="EN" onMenuOpen={mockOnMenuOpen} />);

    const triggerElement = screen.getByRole('button', {name: 'Open menu'});

    fireEvent.click(triggerElement);

    expect(mockOnMenuOpen).toHaveBeenCalledTimes(1);
  });
});
