import { fireEvent, render, screen } from '@testing-library/react';

import { PublishEmptyFundDialog } from './PublishEmptyFundDialog';
import { FUND_PUBLISH_EMPTY_WARNING_MESSAGE } from '~/constants/fund';

describe('PublishEmptyFundDialog', () => {
  const setup = (overrides = {}) => {
    const props = {
      open: true,
      onCancel: jest.fn(),
      onConfirm: jest.fn(),
      ...overrides
    };

    render(<PublishEmptyFundDialog {...props} />);
    return props;
  };

  it('should render the publish warning text', () => {
    setup();

    expect(screen.getByText('Опублікувати фонд?')).toBeInTheDocument();
    expect(screen.getByText(FUND_PUBLISH_EMPTY_WARNING_MESSAGE)).toBeInTheDocument();
  });

  it('should call onCancel when cancel is clicked', () => {
    const { onCancel } = setup();

    fireEvent.click(screen.getByRole('button', { name: 'Скасувати' }));

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('should call onConfirm when publish is clicked', () => {
    const { onConfirm } = setup();

    fireEvent.click(screen.getByRole('button', { name: 'Опублікувати' }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('should not render content when closed', () => {
    setup({ open: false });

    expect(screen.queryByText('Опублікувати фонд?')).not.toBeInTheDocument();
  });
});
