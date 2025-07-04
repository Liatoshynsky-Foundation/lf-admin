import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

import { CustomTextField } from './TextField';

describe('CustomTextField', () => {
  it('should render with a title', () => {
    render(<CustomTextField title="Email" />);

    expect(screen.getByText('Email')).toBeInTheDocument();
  });

  it('should not render a title when not provided', () => {
    render(<CustomTextField />);
    expect(screen.queryByText('Текст заголовку')).not.toBeInTheDocument();
  });

  it('should render with placeholder and passes props to TextField', () => {
    render(<CustomTextField placeholder="Enter your name" />);

    const input = screen.getByPlaceholderText('Enter your name');
    expect(input).toBeInTheDocument();
  });

  it('should call onChange when typing', () => {
    const handleChange = jest.fn();

    render(<CustomTextField onChange={handleChange} />);

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'Hello' } });

    expect(handleChange).toHaveBeenCalled();
  });

  it('should render with a specific value', () => {
    render(<CustomTextField value="Test value" onChange={() => {}} />);

    const input = screen.getByDisplayValue('Test value');
    expect(input).toBeInTheDocument();
  });
});
