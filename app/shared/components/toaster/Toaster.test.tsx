import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { toast } from 'react-hot-toast';

import { Toaster } from './Toaster';

describe('Toaster Component', () => {
  beforeEach(() => {
    act(() => {
      toast.remove();
    });
  });

  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });

  it('should render success toast with message', async () => {
    render(<Toaster />);

    act(() => {
      toast.success('Успішна операція');
    });

    const toastMessage = await screen.findByText('Успішна операція');
    expect(toastMessage).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument();

    expect(screen.getByTestId('success-icon')).toBeInTheDocument();
  });

  it('should call toast.dismiss when close button is clicked', async () => {
    const dismissSpy = jest.spyOn(toast, 'dismiss');

    render(<Toaster />);

    act(() => {
      toast.success('Тест закриття');
    });

    const closeButton = await screen.findByTestId('close-button');
    fireEvent.click(closeButton);

    expect(dismissSpy).toHaveBeenCalledTimes(1);
    expect(dismissSpy).toHaveBeenCalledWith(expect.any(String));
  });

  it('should render error toast with error icon and alert role', async () => {
    render(<Toaster />);

    act(() => {
      toast.error('Сталася помилка');
    });

    const errorMessage = await screen.findByText('Сталася помилка');
    expect(errorMessage).toBeInTheDocument();

    const alertBox = screen.getByRole('alert');
    expect(alertBox).toBeInTheDocument();

    expect(screen.getByTestId('error-icon')).toBeInTheDocument();
  });
});
