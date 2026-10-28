import { fireEvent, render, screen } from '@testing-library/react';

import { PaymentHeaderActions } from './PaymentHeaderActions';

describe('PaymentHeaderActions', () => {
  it('renders save button and triggers onSave when clicked', () => {
    const handleSave = jest.fn();
    render(<PaymentHeaderActions onSave={handleSave} />);

    const saveButton = screen.getByRole('button', { name: /зберегти/i });
    expect(saveButton).toBeInTheDocument();

    fireEvent.click(saveButton);
    expect(handleSave).toHaveBeenCalledTimes(1);
  });

  it('disables button and shows loader when saving is true', () => {
    const handleSave = jest.fn();
    render(<PaymentHeaderActions onSave={handleSave} saving />);

    const saveButton = screen.getByRole('button');
    expect(saveButton).toBeDisabled();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });
});
