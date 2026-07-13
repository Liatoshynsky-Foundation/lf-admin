import { render, screen } from '@testing-library/react';

import { GroupContentViewError } from './GroupContentViewError';

describe('GroupContentViewError Component', () => {
  it('renders default error title', () => {
    render(<GroupContentViewError />);
    
    expect(screen.getByText('Помилка завантаження даних')).toBeInTheDocument();
  });

  it('renders specific error message when provided via props', () => {
    const customMessage = 'Network Error 500';
    render(<GroupContentViewError message={customMessage} />);
    
    expect(screen.getByText('Помилка завантаження даних')).toBeInTheDocument();
    expect(screen.getByText(customMessage)).toBeInTheDocument();
  });

  it('does not render error message paragraph if message is not provided', () => {
    const { container } = render(<GroupContentViewError />);
    
    expect(container.querySelectorAll('p, h6, span')).toHaveLength(1); 
  });
});
