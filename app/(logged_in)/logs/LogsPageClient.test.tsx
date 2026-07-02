import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import LogsPageClient from './LogsPageClient';
import type { LogEntry, LogsResponse } from '~/back-shared/types/logs';

const mockLogEntryFull: LogEntry = {
  id: '1',
  level: 'error',
  message: 'Internal Server Error',
  timestamp: '2026-07-02T10:00:00Z',
  meta: {
    method: 'GET',
    url: '/api/test',
    statusCode: 500,
    stack: 'Error: Something went wrong\n at line 1',
    metadata: { userId: '123' },
    raw: { body: 'invalid payload' }
  }
};

const mockLogEntryEmptyMeta: LogEntry = {
  id: '2',
  level: 'info',
  message: 'User logged in',
  timestamp: 'invalid-date-string',
  meta: {}
};

const mockFetch = jest.spyOn(global, 'fetch');
const mockWarn = jest.spyOn(console, 'warn').mockImplementation(() => {});

describe('LogsPageClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const setupMockFetch = (response: Partial<LogsResponse>, ok = true) => {
    mockFetch.mockResolvedValueOnce({
      ok,
      json: async () => response
    } as Response);
  };

  it('renders initial loading state and then data', async () => {
    setupMockFetch({
      items: [mockLogEntryFull],
      pagination: { total: 1, page: 1, limit: 20 }
    });

    render(<LogsPageClient />);

    expect(screen.getByText('Завантаження...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByText('Завантаження...')).not.toBeInTheDocument();
    });

    expect(screen.getByText('Internal Server Error')).toBeInTheDocument();
    expect(screen.getByText('1 записів')).toBeInTheDocument();
  });

  it('renders empty state when no logs are returned', async () => {
    setupMockFetch({
      items: [],
      pagination: { total: 0, page: 1, limit: 20 }
    });

    render(<LogsPageClient />);

    await waitFor(() => {
      expect(screen.getByText('Логи не знайдено.')).toBeInTheDocument();
    });
  });

  it('handles fetch errors gracefully', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    render(<LogsPageClient />);

    await waitFor(() => {
      expect(screen.getByText('Логи не знайдено.')).toBeInTheDocument();
    });
    expect(screen.getByText('0 записів')).toBeInTheDocument();
  });

  it('fetches new data when a tab (level) is clicked', async () => {
    const user = userEvent.setup();
    setupMockFetch({ items: [], pagination: { total: 0, page: 1, limit: 20 } });

    render(<LogsPageClient />);
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/logs?page=1&limit=20', expect.any(Object));
    });

    setupMockFetch({ items: [], pagination: { total: 0, page: 1, limit: 20 } });
    await user.click(screen.getByRole('tab', { name: 'Error' }));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/logs?page=1&limit=20&level=error', expect.any(Object));
    });
  });

  it('handles pagination correctly', async () => {
    const user = userEvent.setup();
    setupMockFetch({
      items: [mockLogEntryFull],
      pagination: { total: 40, page: 1, limit: 20 }
    });

    render(<LogsPageClient />);

    await waitFor(() => {
      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });

    setupMockFetch({ items: [], pagination: { total: 40, page: 2, limit: 20 } });
    await user.click(screen.getByRole('button', { name: 'Go to page 2' }));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/logs?page=2&limit=20', expect.any(Object));
    });
  });

  it('renders LogItem details and handles JsonBlock', async () => {
    const user = userEvent.setup();
    setupMockFetch({
      items: [mockLogEntryFull, mockLogEntryEmptyMeta],
      pagination: { total: 2, page: 1, limit: 20 }
    });

    render(<LogsPageClient />);

    await waitFor(() => {
      expect(screen.getByText('Internal Server Error')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Internal Server Error'));

    expect(screen.getByText('GET')).toBeInTheDocument();
    expect(screen.getByText('/api/test')).toBeInTheDocument();
    expect(screen.getByText('500')).toBeInTheDocument();
    expect(screen.getByText('Error: Something went wrong', { exact: false })).toBeInTheDocument();

    expect(screen.getByText(/userId/)).toBeInTheDocument();
    expect(screen.getByText(/invalid payload/)).toBeInTheDocument();

    await user.click(screen.getByText('User logged in'));
    expect(screen.getByText('Немає додаткових деталей.')).toBeInTheDocument();
    expect(screen.getByText('invalid-date-string')).toBeInTheDocument();
  });

  it('manages the clear logs dialog and successful deletion', async () => {
    const user = userEvent.setup();
    setupMockFetch({
      items: [mockLogEntryFull],
      pagination: { total: 1, page: 1, limit: 20 }
    });

    render(<LogsPageClient />);

    await waitFor(() => {
      expect(screen.getByText('Видалити всі логи')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Видалити всі логи'));
    expect(screen.getByText('Видалити всі логи?')).toBeInTheDocument();

    await user.click(screen.getByText('Скасувати'));
    await waitFor(() => {
      expect(screen.queryByText('Видалити всі логи?')).not.toBeInTheDocument();
    });

    await user.click(screen.getByText('Видалити всі логи'));

    mockFetch.mockResolvedValueOnce({ ok: true } as Response);
    setupMockFetch({ items: [], pagination: { total: 0, page: 1, limit: 20 } });

    await user.click(screen.getByRole('button', { name: 'Видалити' }));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/logs?', expect.objectContaining({ method: 'DELETE' }));
      expect(screen.queryByText('Видалити всі логи?')).not.toBeInTheDocument();
    });
  });

  it('handles failed log deletion', async () => {
    const user = userEvent.setup();
    setupMockFetch({
      items: [mockLogEntryFull],
      pagination: { total: 1, page: 1, limit: 20 }
    });

    render(<LogsPageClient />);

    await waitFor(() => {
      expect(screen.getByText('Видалити всі логи')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Видалити всі логи'));

    mockFetch.mockResolvedValueOnce({ ok: false } as Response);

    await user.click(screen.getByRole('button', { name: 'Видалити' }));

    await waitFor(() => {
      expect(mockWarn).toHaveBeenCalledWith(new Error('Failed to clear logs'));
      expect(screen.queryByText('Видалити всі логи?')).not.toBeInTheDocument();
    });
  });
});
