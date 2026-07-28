import '@testing-library/jest-dom';
import { render, waitFor } from '@testing-library/react';
import { useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';

import { LoginInactivityToast } from './LoginInactivityToast';

jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn()
}));

jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: {
    error: jest.fn()
  }
}));

describe('LoginInactivityToast', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows inactivity toast when reason=inactivity', async () => {
    (useSearchParams as jest.Mock).mockReturnValue({
      get: jest.fn().mockReturnValue('inactivity')
    });

    render(<LoginInactivityToast />);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Сесію завершено через бездіяльність. Будь ласка, увійдіть знову.');
    });
  });

  it('does not show toast when reason is missing', async () => {
    (useSearchParams as jest.Mock).mockReturnValue({
      get: jest.fn().mockReturnValue(null)
    });

    render(<LoginInactivityToast />);

    await waitFor(() => {
      expect(toast.error).not.toHaveBeenCalled();
    });
  });
});
