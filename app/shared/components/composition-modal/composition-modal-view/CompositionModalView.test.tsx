import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import dayjs, { Dayjs } from 'dayjs';
import React from 'react';

import { CompositionModalView } from './CompositionModalView';

interface MockDatePickerProps {
  readonly label: string;
  readonly value: Dayjs | null;
  readonly onChange: (val: Dayjs | null) => void;
}

interface MockActionableSuggestItemProps {
  readonly mode: 'audio' | 'notes';
  readonly value: string | null;
  readonly date: Dayjs | null;
  readonly onSelect: (val: string | null) => void;
  readonly onDateChange: (val: Dayjs | null) => void;
  readonly onUpload: () => void;
  readonly onDelete: () => void;
}

interface MockFileItemProps {
  readonly fileName: string;
  readonly fileType: string;
  readonly onDelete: () => void;
}

interface MockAlertProps {
  readonly description: string;
  readonly onClose: () => void;
}

jest.mock('@mui/x-date-pickers/LocalizationProvider', () => ({
  __esModule: true,
  LocalizationProvider: ({ children }: { readonly children: React.ReactNode }) => <>{children}</>
}));

jest.mock('@mui/x-date-pickers/DatePicker', () => ({
  __esModule: true,
  DatePicker: ({ label, value, onChange }: MockDatePickerProps) => (
    <div data-testid="mock-date-picker">
      <span data-testid="date-picker-label">{label}</span>
      <span data-testid="date-picker-value">
        {value && typeof value.year === 'function' ? String(value.year()) : 'null'}
      </span>
      <button data-testid="trigger-date-select" onClick={() => onChange(dayjs('2026-01-01'))}>
        Select 2026
      </button>
    </div>
  )
}));

jest.mock('../label-action-row/LabelActionRow', () => ({
  __esModule: true,
  default: ({ title, action }: { readonly title: string; readonly action: () => void }) => (
    <div data-testid={`action-row-${title}`}>
      <h3>{title}</h3>
      <button data-testid={`btn-add-${title}`} onClick={action}>
        Add {title}
      </button>
    </div>
  )
}));

jest.mock('../actionable-suggest-item/ActionableSuggestItem', () => ({
  __esModule: true,
  default: ({ mode, value, date, onSelect, onDateChange, onUpload, onDelete }: MockActionableSuggestItemProps) => (
    <div data-testid={`suggest-item-${mode}`}>
      <span data-testid="suggest-value">{value || 'empty'}</span>
      <span data-testid="suggest-date">
        {date?.isValid() ? date.format('YYYY-MM-DD') : 'empty-date'}
      </span>
      <button data-testid="action-select-item" onClick={() => onSelect('Selected Item')}>
        Select Track
      </button>
      <button data-testid="action-date-item" onClick={() => onDateChange(dayjs('2026-06-14'))}>
        Set Date
      </button>
      <button data-testid="action-upload-item" onClick={onUpload}>
        Upload
      </button>
      <button data-testid="action-delete-item" onClick={onDelete}>
        Delete Row
      </button>
    </div>
  )
}));

jest.mock('../file-item/FileItem', () => ({
  __esModule: true,
  default: ({ fileName, fileType, onDelete }: MockFileItemProps) => (
    <div data-testid={`file-item-${fileType}`}>
      <span data-testid="file-name-text">{fileName}</span>
      <button data-testid="action-remove-file" onClick={onDelete}>
        Remove File
      </button>
    </div>
  )
}));

jest.mock('../../design-system/alert/Alert', () => ({
  __esModule: true,
  default: ({ description, onClose }: MockAlertProps) => (
    <div data-testid="info-alert">
      <p>{description}</p>
      <button data-testid="action-close-alert" onClick={onClose}>
        Close Alert
      </button>
    </div>
  )
}));

const mockSuggestions = {
  audio: ['Track 1', 'Track 2'],
  notes: ['Score 1', 'Score 2']
};

describe('CompositionModalView', () => {
  let onCloseMock: jest.Mock;
  let onTriggerUploadMock: jest.Mock;
  let onSaveMock: jest.Mock;

  beforeAll(() => {
    if (!globalThis.crypto) {
      // @ts-expect-error Mocking partial crypto object for test environment compatibility
      globalThis.crypto = {};
    }
    globalThis.crypto.randomUUID = jest.fn(() => 'mocked-stable-uuid') as typeof crypto.randomUUID;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    onCloseMock = jest.fn();
    onTriggerUploadMock = jest.fn();
    onSaveMock = jest.fn(() => Promise.resolve());
  });

  const renderComponent = (overrides = {}) => {
    return render(
      <CompositionModalView
        isOpen={true}
        isLoadingData={false}
        suggestions={mockSuggestions}
        onClose={onCloseMock}
        onTriggerUpload={onTriggerUploadMock}
        onSave={onSaveMock}
        {...overrides}
      />
    );
  };

  it('should immediately return null and bypass mounting layout trees if data is loading', () => {
    const { container } = renderComponent({ isLoadingData: true });
    expect(container.firstChild).toBeNull();
  });

  it('should render the full form structure and display empty field baselines alongside an informative fallback alert description', () => {
    renderComponent();

    expect(screen.getByText('Нова композиція')).toBeInTheDocument();
    expect(screen.getByLabelText(/Назва твору/)).toHaveValue('');
    expect(screen.getByLabelText('Жанр *')).toHaveValue('');
    expect(screen.getByTestId('info-alert')).toHaveTextContent(/Додайте файли для відкритого доступу/);
  });

  it('should enable and trigger close callbacks, dismissing the view envelope securely upon cancel actions', () => {
    renderComponent();

    fireEvent.click(screen.getByRole('button', { name: 'Скасувати' }));
    expect(onCloseMock).toHaveBeenCalled();
  });

  it('should allow typing values directly inside text inputs and select year fields cleanly via targeted event firing', () => {
    renderComponent();

    expect(screen.getByTestId('date-picker-value')).toHaveTextContent('null');

    fireEvent.change(screen.getByLabelText(/Назва твору/), { target: { value: 'Melody in F' } });
    fireEvent.change(screen.getByLabelText('Жанр *'), { target: { value: 'Classical' } });
    fireEvent.click(screen.getByTestId('trigger-date-select'));

    expect(screen.getByLabelText(/Назва твору/)).toHaveValue('Melody in F');
    expect(screen.getByLabelText('Жанр *')).toHaveValue('Classical');
    expect(screen.getByTestId('date-picker-value')).toHaveTextContent('2026');
  });

  it('should cleanly append dynamic rows to audio and notes entry sections when add action triggers execute', () => {
    renderComponent();

    fireEvent.click(screen.getByTestId('btn-add-Аудіо'));
    fireEvent.click(screen.getByTestId('btn-add-Ноти'));

    expect(screen.getByTestId('suggest-item-audio')).toBeInTheDocument();
    expect(screen.getByTestId('suggest-item-notes')).toBeInTheDocument();
    expect(screen.queryByTestId('info-alert')).not.toBeInTheDocument();
  });

  it('should allow editing row parameters, assigning item name titles and specific dates correctly', () => {
    renderComponent();

    fireEvent.click(screen.getByTestId('btn-add-Ноти'));

    const notesContainer = screen.getByTestId('suggest-item-notes');
    fireEvent.click(within(notesContainer).getByTestId('action-select-item'));
    fireEvent.click(within(notesContainer).getByTestId('action-date-item'));

    expect(within(notesContainer).getByTestId('suggest-value')).toHaveTextContent('Selected Item');
    expect(within(notesContainer).getByTestId('suggest-date')).toHaveTextContent('2026-06-14');
  });

  it('should successfully run file upload routines through the upload handler and render file items with targeted file names', () => {
    onTriggerUploadMock.mockImplementation((_mode: string, callback: (name: string) => void) => {
      callback('symphony_draft.mp3');
    });

    renderComponent();
    fireEvent.click(screen.getByTestId('btn-add-Аудіо'));

    const itemWrapper = screen.getByTestId('suggest-item-audio');
    fireEvent.click(within(itemWrapper).getByTestId('action-upload-item'));

    expect(onTriggerUploadMock).toHaveBeenCalledWith('audio', expect.any(Function));
    expect(screen.getByTestId('file-item-audio')).toBeInTheDocument();
    expect(screen.getByTestId('file-name-text')).toHaveTextContent('symphony_draft.mp3');
  });

  it('should remove entry configurations from state maps entirely when triggering row or file removal requests', () => {
    renderComponent();

    fireEvent.click(screen.getByTestId('btn-add-Аудіо'));
    expect(screen.getByTestId('suggest-item-audio')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('action-delete-item'));
    expect(screen.queryByTestId('suggest-item-audio')).not.toBeInTheDocument();
  });

  it('should clear internal layout structures, reset inputs, and propagate full configuration collections to onSave when the submit button is triggered', async () => {
    renderComponent();

    fireEvent.change(screen.getByLabelText(/Назва твору/), { target: { value: 'Symphony No. 5' } });
    fireEvent.change(screen.getByLabelText('Жанр *'), { target: { value: 'Orchestral' } });
    fireEvent.click(screen.getByTestId('trigger-date-select'));

    fireEvent.click(screen.getByTestId('btn-add-Аудіо'));

    const saveButton = screen.getByRole('button', { name: 'Зберегти' });
    expect(saveButton).not.toBeDisabled();
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(onSaveMock).toHaveBeenCalledWith(
        'Symphony No. 5',
        'Orchestral',
        expect.any(dayjs),
        expect.arrayContaining([expect.objectContaining({ id: expect.any(String) })]),
        []
      );
    });

    expect(screen.getByLabelText(/Назва твору/)).toHaveValue('');
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });
});
