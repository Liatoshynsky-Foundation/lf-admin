import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ViewToggle } from './index';

describe('ViewToggle', () => {
  it('calls onChange with list when list button is clicked', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(<ViewToggle value="grid" onChange={onChange} />);

    await user.click(screen.getByLabelText('Список'));

    expect(onChange).toHaveBeenCalledWith('list');
  });

  it('calls onChange with grid when grid button is clicked', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(<ViewToggle value="list" onChange={onChange} />);

    await user.click(screen.getByLabelText('Сітка'));

    expect(onChange).toHaveBeenCalledWith('grid');
  });
});
