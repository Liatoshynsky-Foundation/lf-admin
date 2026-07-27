import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import toast from 'react-hot-toast';

import ResearchModal from './ResearchModal';

jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: {
    success: jest.fn(),
    error: jest.fn()
  }
}));

describe('ResearchModal', () => {
  const onClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with the create dialog title by default', () => {
    render(<ResearchModal isOpen onClose={onClose} />);

    expect(screen.getByText('Нова робота')).toBeInTheDocument();
  });

  it('renders with the edit dialog title when mode is edit', () => {
    render(<ResearchModal isOpen mode="edit" onClose={onClose} />);

    expect(screen.getByText('Деталі роботи')).toBeInTheDocument();
  });

  it('pre-fills fields from initialData in edit mode', () => {
    render(
      <ResearchModal
        isOpen
        mode="edit"
        onClose={onClose}
        initialData={{
          bibliographicDescription: 'Опис роботи',
          author: 'Автор роботи',
          caseDates: '1970',
          keywords: 'слова'
        }}
      />
    );

    expect(screen.getByDisplayValue('Опис роботи')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Автор роботи')).toBeInTheDocument();
  });

  it('shows a "not implemented" message and keeps the modal open on save', async () => {
    render(<ResearchModal isOpen onClose={onClose} />);

    fireEvent.change(screen.getByLabelText(/бібліографічний опис/i), { target: { value: 'Опис' } });
    fireEvent.change(screen.getByLabelText(/автор/i), { target: { value: 'Автор' } });
    fireEvent.change(screen.getByLabelText(/дати справи/i), { target: { value: '1970' } });
    fireEvent.change(screen.getByLabelText(/ключові слова/i), { target: { value: 'слово' } });

    fireEvent.click(screen.getByRole('button', { name: 'Зберегти' }));

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith('Збереження ще не реалізовано. Дані не будуть збережені.')
    );
    expect(onClose).not.toHaveBeenCalled();
  });

  it('calls onClose when Cancel is clicked', () => {
    render(<ResearchModal isOpen onClose={onClose} />);

    fireEvent.click(screen.getByRole('button', { name: 'Скасувати' }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('shows the same "not implemented" message in edit mode', async () => {
    render(
      <ResearchModal
        isOpen
        mode="edit"
        onClose={onClose}
        initialData={{ author: 'Автор', bibliographicDescription: 'Опис', caseDates: '1970', keywords: 'слово' }}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Зберегти' }));

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith('Збереження ще не реалізовано. Дані не будуть збережені.')
    );
  });
});
