import { fireEvent, render, screen } from '@testing-library/react';

import { CircleIconButton } from './CircleIconButton';

const ICON_LABEL = 'icon';
const FILLED_VARIANT = 'filled' as const;
const CUSTOM_SIZE = 48;

describe('CircleIconButton', () => {
  it('renders the icon with default styling and handles clicks', () => {
    const onClick = jest.fn();
    render(<CircleIconButton icon={ICON_LABEL} onClick={onClick} />);

    fireEvent.click(screen.getByRole('button'));

    expect(screen.getByText(ICON_LABEL)).toBeInTheDocument();
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('accepts a filled variant and custom size', () => {
    render(<CircleIconButton icon={ICON_LABEL} onClick={jest.fn()} variant={FILLED_VARIANT} size={CUSTOM_SIZE} />);

    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});
