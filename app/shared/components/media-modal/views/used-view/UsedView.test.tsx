import { render, screen } from '@testing-library/react';

import { UsedView } from './UsedView';

describe('UsedView', () => {
  const defaultProps = {
    selected: null,
    onPick: jest.fn(),
    filters: { search: '', language: '' },
    onFiltersChange: jest.fn()
  };

  it('should render used view component', () => {
    render(<UsedView {...defaultProps} />);

    expect(screen.getByTestId('UsedView')).toBeInTheDocument();
  });

  it('should render title', () => {
    render(<UsedView {...defaultProps} />);

    expect(screen.getByText('Зображення на сторінці')).toBeInTheDocument();
  });

  it('should render info alert about tab being temporarily unavailable', () => {
    render(<UsedView {...defaultProps} />);

    expect(screen.getByText('Вкладка тимчасово недоступна')).toBeInTheDocument();
    expect(screen.getByText('Дана вкладка не підключена до джерела даних. В майбутньому цей недолік буде виправлено.')).toBeInTheDocument();
  });
});
