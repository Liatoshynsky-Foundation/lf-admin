import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

import { ResearchCreateAction } from './ResearchCreateAction';

describe('ResearchCreateAction', () => {
  it('renders the button label', () => {
    render(<ResearchCreateAction onClick={jest.fn()} />);

    expect(screen.getByText('Додати роботу')).toBeInTheDocument();
  });

  it('links to the research create page', () => {
    const onClick = jest.fn();
    render(<ResearchCreateAction onClick={onClick} />);

    fireEvent.click(screen.getByText('Додати роботу'));

    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
