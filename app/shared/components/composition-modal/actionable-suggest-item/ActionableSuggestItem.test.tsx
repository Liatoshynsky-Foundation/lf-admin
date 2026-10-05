import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

import ActionableSuggestItem from './ActionableSuggestItem';

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

  beforeEach(() => {
    jest.clearAllMocks();
    onUploadMock = jest.fn();
    onDeleteMock = jest.fn();
    onSelectMock = jest.fn();
  });

  const renderComponent = (overrides = {}) => {
    return render(
      <ActionableSuggestItem
        suggestions={mockSuggestions}
        onUpload={onUploadMock}
        onDelete={onDeleteMock}
        onSelect={onSelectMock}
        {...overrides}
      />
    );
  };

  it('should render audio fallback input mode labels and hide date picking interfaces when mode is audio', () => {
    renderComponent({ mode: 'audio', value: 'Sonata No. 1' });

    expect(screen.getByLabelText('Назва аудіо *')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Введіть назву аудіо')).toBeInTheDocument();
  });

  it('should render pdf input mode labels and hide date picking interfaces when mode is pdf', () => {
    renderComponent({ mode: 'pdf', value: 'Document' });

    expect(screen.getByLabelText('Назва PDF')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Введіть назву PDF')).toBeInTheDocument();
  });

  it('should render notes input mode labelss', () => {
    renderComponent({ mode: 'notes', value: 'Nocturne Op. 9' });

    expect(screen.getByLabelText('Назва нот *')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Введіть назву нот')).toBeInTheDocument();
  });

  it('should propagate values correctly up when selecting alternate suggestion parameters', () => {
    renderComponent({ mode: 'audio' });

    const selectElement = screen.getByTestId('autocomplete-select');
    fireEvent.change(selectElement, { target: { value: 'Prelude in C' } });

    expect(onSelectMock).toHaveBeenCalledWith('Prelude in C');
  });

  it('should execute context triggers sequentially exactly once when action button clicks happen', () => {
    renderComponent();

    const iconButtons = screen.getAllByRole('button');

    fireEvent.click(iconButtons[0]);
    expect(onUploadMock).toHaveBeenCalledTimes(1);

    fireEvent.click(iconButtons[1]);
    expect(onDeleteMock).toHaveBeenCalledTimes(1);
  });

  it('should use default values for props when they are completely omitted', () => {
    const propsWithoutOptional = {
      suggestions: mockSuggestions,
      onUpload: onUploadMock,
      onDelete: onDeleteMock,
      onSelect: onSelectMock
    };

    render(
      <ActionableSuggestItem
        {...(propsWithoutOptional as unknown as React.ComponentProps<typeof ActionableSuggestItem>)}
      />
    );

    expect(screen.getByLabelText('Назва аудіо *')).toBeInTheDocument();
  });
});
