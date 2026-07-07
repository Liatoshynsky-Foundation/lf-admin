import { fireEvent, render, screen } from '@testing-library/react';
import dayjs from 'dayjs';
import React from 'react';

import ActionableSuggestItem from './ActionableSuggestItem';

jest.mock('@mui/x-date-pickers/LocalizationProvider', () => ({
  __esModule: true,
  LocalizationProvider: ({ children }: { readonly children: React.ReactNode }) => <>{children}</>
}));

jest.mock('@mui/x-date-pickers/DatePicker', () => ({
  __esModule: true,
  DatePicker: ({ label, value, onChange }: { readonly label: string; readonly value: unknown; readonly onChange: (val: unknown) => void }) => (
    <div data-testid="mock-date-picker">
      <label htmlFor="mock-date-input">{label}</label>
      <input
        id="mock-date-input"
        data-testid="date-picker-input"
        value={value ? dayjs(value as any).format('DD/MM/YYYY') : ''}
        onChange={() => onChange(dayjs('2026-06-14'))}
      />
    </div>
  )
}));

jest.mock('@mui/material', () => {
  const actualMui = jest.requireActual('@mui/material');
  return {
    ...actualMui,
    Autocomplete: ({
      options,
      value,
      onChange,
      renderInput
    }: {
      readonly options: string[];
      readonly value: string | null;
      readonly onChange: (event: unknown, val: string | null) => void;
      readonly renderInput: (params: Record<string, unknown>) => React.ReactNode;
    }) => (
      <div data-testid="mock-autocomplete">
        {renderInput({})}
        <select
          data-testid="autocomplete-select"
          value={value || ''}
          onChange={(e) => onChange(null, e.target.value || null)}
        >
          <option value="">None</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>
    )
  };
});

const mockSuggestions = ['Sonata No. 1', 'Nocturne Op. 9', 'Prelude in C'];

describe('ActionableSuggestItem', () => {
  let onUploadMock: jest.Mock;
  let onDeleteMock: jest.Mock;
  let onSelectMock: jest.Mock;
  let onDateChangeMock: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    onUploadMock = jest.fn();
    onDeleteMock = jest.fn();
    onSelectMock = jest.fn();
    onDateChangeMock = jest.fn();
  });

  const renderComponent = (overrides = {}) => {
    return render(
      <ActionableSuggestItem
        suggestions={mockSuggestions}
        onUpload={onUploadMock}
        onDelete={onDeleteMock}
        onSelect={onSelectMock}
        date={null}
        onDateChange={onDateChangeMock}
        {...overrides}
      />
    );
  };

  it('should render audio fallback input mode labels and hide date picking interfaces when mode is audio', () => {
    renderComponent({ mode: 'audio', value: 'Sonata No. 1' });

    expect(screen.getByLabelText('Назва аудіо *')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Введіть назву аудіо')).toBeInTheDocument();
    expect(screen.queryByTestId('mock-date-picker')).not.toBeInTheDocument();
  });

  it('should render notes alternative mode inputs and mount localization selectors when mode is notes', () => {
    const mockDate = dayjs('2026-05-20');
    renderComponent({ mode: 'notes', value: 'Nocturne Op. 9', date: mockDate });

    expect(screen.getByLabelText('Назва нот *')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Введіть назву нот')).toBeInTheDocument();
    expect(screen.getByTestId('mock-date-picker')).toBeInTheDocument();
    expect(screen.getByLabelText('Дата видання')).toBeInTheDocument();
    expect(screen.getByTestId('date-picker-input')).toHaveValue('20/05/2026');
  });

  it('should propagate values correctly up when selecting alternate suggestion parameters', () => {
    renderComponent({ mode: 'audio' });

    const selectElement = screen.getByTestId('autocomplete-select');
    fireEvent.change(selectElement, { target: { value: 'Prelude in C' } });

    expect(onSelectMock).toHaveBeenCalledWith('Prelude in C');
  });

  it('should trigger target parameter updates when the nested date picking handler fires', () => {
    renderComponent({ mode: 'notes' });

    const dateInputElement = screen.getByTestId('date-picker-input');
    fireEvent.change(dateInputElement, { target: { value: '14/06/2026' } });

    expect(onDateChangeMock).toHaveBeenCalledWith(expect.any(dayjs));
  });

  it('should execute context triggers sequentially exactly once when action button clicks happen', () => {
    renderComponent();

    const iconButtons = screen.getAllByRole('button');
    
    fireEvent.click(iconButtons[0]);
    expect(onUploadMock).toHaveBeenCalledTimes(1);

    fireEvent.click(iconButtons[1]);
    expect(onDeleteMock).toHaveBeenCalledTimes(1);
  });
});
