import { fireEvent, render, screen } from '@testing-library/react';

import { ContactsHeaderActions } from './ContactsHeaderActions';

const SAVE_BUTTON_NAME = 'Зберегти зміни';

describe('ContactsHeaderActions', () => {
  it('renders the save action and forwards the event', () => {
    const onSave = jest.fn();
    render(<ContactsHeaderActions onSave={onSave} />);

    fireEvent.click(screen.getByRole('button', { name: SAVE_BUTTON_NAME }));

    expect(onSave).toHaveBeenCalledTimes(1);
  });
});
