import { fireEvent, render, screen } from '@testing-library/react';

import DiscardChangesModal from './DiscardChangesModal';

describe('DiscardChangesModal', () => {
  const setup = (overrideProps = {}) => {
    const defaultProps = {
      open: true,
      handleClose: jest.fn(),
      handleSubmit: jest.fn()
    };

    const props = { ...defaultProps, ...overrideProps };
    render(<DiscardChangesModal {...props} />);
    return props;
  };

  it('should render modal with title and description', () => {
    setup();

    expect(screen.getByText('Скасувати зміни?')).toBeInTheDocument();
    expect(
      screen.getByText('Усі внесені зміни буде втрачено. Ви впевнені, що хочете вийти без збереження?')
    ).toBeInTheDocument();
  });

  it('should call handleClose when "Повернутись" button is clicked', () => {
    const { handleClose } = setup();

    const closeButton = screen.getByRole('button', { name: /Повернутись/i });
    fireEvent.click(closeButton);

    expect(handleClose).toHaveBeenCalled();
  });

  it('should call handleSubmit when "Скасувати зміни" button is clicked', () => {
    const { handleSubmit } = setup();

    const submitButton = screen.getByRole('button', { name: /Скасувати зміни/i });
    fireEvent.click(submitButton);

    expect(handleSubmit).toHaveBeenCalled();
  });

  it('should not render content when modal is closed', () => {
    setup({ open: false });

    expect(screen.queryByText('Скасувати зміни?')).not.toBeInTheDocument();
  });
});
