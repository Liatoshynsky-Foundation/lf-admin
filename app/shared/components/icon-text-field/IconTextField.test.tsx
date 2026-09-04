import { fireEvent, render, screen } from '@testing-library/react';

import { IconTextField } from './IconTextField';

const FIELD_LABEL = 'URL';
const INITIAL_VALUE = 'https://example.com';
const UPDATED_VALUE = 'https://updated.example';
const EMPTY_VALUE = '';
const PROVIDED_ICON_TEST_ID = 'provided-icon';
const ICON_CONTENT = 'icon';

describe('IconTextField', () => {
  it('renders the default icon and forwards value changes', () => {
    const onChange = jest.fn();
    const onIconClick = jest.fn();
    render(<IconTextField label={FIELD_LABEL} value={INITIAL_VALUE} onChange={onChange} onIconClick={onIconClick} />);

    fireEvent.click(screen.getByRole('button'));
    fireEvent.change(screen.getByRole('textbox', { name: FIELD_LABEL }), { target: { value: UPDATED_VALUE } });

    expect(onIconClick).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(UPDATED_VALUE);
  });

  it('renders a provided icon and filled variant', () => {
    render(
      <IconTextField
        icon={<span data-testid={PROVIDED_ICON_TEST_ID}>{ICON_CONTENT}</span>}
        label={FIELD_LABEL}
        value={EMPTY_VALUE}
        onChange={jest.fn()}
        onIconClick={jest.fn()}
        iconButtonVariant="filled"
      />
    );

    expect(screen.getByTestId(PROVIDED_ICON_TEST_ID)).toBeInTheDocument();
  });
});
