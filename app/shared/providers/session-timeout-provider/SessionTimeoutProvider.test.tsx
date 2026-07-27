import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import React from 'react';

import { SessionTimeoutProvider } from './SessionTimeoutProvider';
import { logoutAction } from '~/shared/actions/auth';
import { useStore } from '~/store';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}));

jest.mock('~/shared/actions/auth', () => ({
  logoutAction: jest.fn()
}));

jest.mock('~/store', () => ({
  useStore: jest.fn()
}));

const mockPush = jest.fn();
const mockRefresh = jest.fn();
const mockLogout = jest.fn();

describe('SessionTimeoutProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    (useRouter as jest.Mock).mockReturnValue({ push: mockPush, refresh: mockRefresh });
    (useStore as unknown as jest.Mock).mockImplementation((selector) => selector({ logout: mockLogout }));
    (logoutAction as jest.Mock).mockResolvedValue(undefined);

    process.env.NEXT_PUBLIC_SESSION_INACTIVITY_TIMEOUT_MINUTES = '60';
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders children', () => {
    render(
      <SessionTimeoutProvider>
        <div>Protected content</div>
      </SessionTimeoutProvider>
    );

    expect(screen.getByText('Protected content')).toBeInTheDocument();
  });

  it('does not log out before the timeout period has elapsed', () => {
    render(
      <SessionTimeoutProvider>
        <div>Protected content</div>
      </SessionTimeoutProvider>
    );

    jest.advanceTimersByTime(59 * 60 * 1000);

    expect(logoutAction).not.toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('logs out and redirects after the configured inactivity period', async () => {
    render(
      <SessionTimeoutProvider>
        <div>Protected content</div>
      </SessionTimeoutProvider>
    );

    jest.advanceTimersByTime(60 * 60 * 1000);

    await waitFor(() => expect(logoutAction).toHaveBeenCalledTimes(1));
    expect(mockLogout).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith('/login?reason=inactivity');
    expect(mockRefresh).toHaveBeenCalledTimes(1);
  });

  it('uses the default 60 minute timeout when the env variable is not set', async () => {
    delete process.env.NEXT_PUBLIC_SESSION_INACTIVITY_TIMEOUT_MINUTES;

    render(
      <SessionTimeoutProvider>
        <div>Protected content</div>
      </SessionTimeoutProvider>
    );

    jest.advanceTimersByTime(60 * 60 * 1000);

    await waitFor(() => expect(logoutAction).toHaveBeenCalledTimes(1));
  });

  it('respects a custom timeout value from the env variable', async () => {
    process.env.NEXT_PUBLIC_SESSION_INACTIVITY_TIMEOUT_MINUTES = '1';

    render(
      <SessionTimeoutProvider>
        <div>Protected content</div>
      </SessionTimeoutProvider>
    );

    jest.advanceTimersByTime(60 * 1000);

    await waitFor(() => expect(logoutAction).toHaveBeenCalledTimes(1));
  });

  it('resets the timer on mousemove activity', async () => {
    render(
      <SessionTimeoutProvider>
        <div>Protected content</div>
      </SessionTimeoutProvider>
    );

    jest.advanceTimersByTime(59 * 60 * 1000);
    fireEvent.mouseMove(window);
    jest.advanceTimersByTime(59 * 60 * 1000);

    expect(logoutAction).not.toHaveBeenCalled();

    jest.advanceTimersByTime(1 * 60 * 1000);

    await waitFor(() => expect(logoutAction).toHaveBeenCalledTimes(1));
  });

  it('resets the timer on keypress activity', () => {
    render(
      <SessionTimeoutProvider>
        <div>Protected content</div>
      </SessionTimeoutProvider>
    );

    jest.advanceTimersByTime(59 * 60 * 1000);
    fireEvent.keyPress(window, { key: 'a', code: 'KeyA', charCode: 97 });
    jest.advanceTimersByTime(59 * 60 * 1000);

    expect(logoutAction).not.toHaveBeenCalled();
  });

  it('resets the timer on click activity', () => {
    render(
      <SessionTimeoutProvider>
        <div>Protected content</div>
      </SessionTimeoutProvider>
    );

    jest.advanceTimersByTime(59 * 60 * 1000);
    fireEvent.click(window);
    jest.advanceTimersByTime(59 * 60 * 1000);

    expect(logoutAction).not.toHaveBeenCalled();
  });

  it('still redirects even if logoutAction rejects', async () => {
    (logoutAction as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    render(
      <SessionTimeoutProvider>
        <div>Protected content</div>
      </SessionTimeoutProvider>
    );

    jest.advanceTimersByTime(60 * 60 * 1000);

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/login?reason=inactivity'));
    expect(mockLogout).toHaveBeenCalledTimes(1);
  });

  it('removes event listeners on unmount', () => {
    const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');

    const { unmount } = render(
      <SessionTimeoutProvider>
        <div>Protected content</div>
      </SessionTimeoutProvider>
    );

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('mousemove', expect.any(Function));
    expect(removeEventListenerSpy).toHaveBeenCalledWith('keypress', expect.any(Function));
    expect(removeEventListenerSpy).toHaveBeenCalledWith('click', expect.any(Function));

    removeEventListenerSpy.mockRestore();
  });
});
