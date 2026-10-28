import { fireEvent, render, screen } from '@testing-library/react';

import { RequisitesContentEditor } from './RequisitesContentEditor';

describe('RequisitesContentEditor', () => {
  it('renders content label and value', () => {
    const handleChange = jest.fn();
    render(<RequisitesContentEditor value="Test Content" onChange={handleChange} />);

    const textarea = screen.getByLabelText(/текст реквізитів/i);
    expect(textarea).toBeInTheDocument();
    expect(textarea).toHaveValue('Test Content');
  });

  it('calls onChange when user types', () => {
    const handleChange = jest.fn();
    render(<RequisitesContentEditor value="" onChange={handleChange} />);

    const textarea = screen.getByLabelText(/текст реквізитів/i);
    fireEvent.change(textarea, { target: { value: 'Updated Details' } });

    expect(handleChange).toHaveBeenCalledWith('Updated Details');
  });

  it('disables input when disabled prop is true', () => {
    const handleChange = jest.fn();
    render(<RequisitesContentEditor value="Value" onChange={handleChange} disabled />);

    const textarea = screen.getByLabelText(/текст реквізитів/i);
    expect(textarea).toBeDisabled();
  });
});
