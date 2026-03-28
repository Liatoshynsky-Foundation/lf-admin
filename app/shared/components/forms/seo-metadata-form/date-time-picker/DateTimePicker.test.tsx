import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import dayjs from 'dayjs';

import type { DateTimePickerProps } from './DateTimePicker';
import DateTimePicker from './DateTimePicker';

jest.mock('@mui/x-date-pickers/DesktopDateTimePicker', () => ({
  DesktopDateTimePicker: ({ label, value, onChange }: any) => (
    <input
      aria-label={label}
      value={value ? value.format('YYYY-MM-DDTHH:mm:ss') : ''}
      onChange={(e) => {
        const val = e.target.value;
        onChange(val ? dayjs(val) : null);
      }}
    />
  )
}));

describe('DateTimePicker', () => {
  const renderPicker = (props: Partial<DateTimePickerProps> = {}) => {
    render(<DateTimePicker onChange={jest.fn()} {...props} />);
    const startInput = screen.getByLabelText(props.labels?.startDateTime || 'Початок події');
    const endInput = screen.getByLabelText(props.labels?.endDateTime || 'Закінчення події');
    return { startInput, endInput };
  };

  const changeInput = (input: HTMLElement, value: string) => {
    fireEvent.change(input, { target: { value } });
  };

  it('renders default and custom labels', () => {
    let inputs = renderPicker();
    expect(inputs.startInput).toBeInTheDocument();
    expect(inputs.endInput).toBeInTheDocument();

    inputs = renderPicker({ labels: { startDateTime: 'Start', endDateTime: 'End' } });
    expect(inputs.startInput).toBeInTheDocument();
    expect(inputs.endInput).toBeInTheDocument();
  });

  test.each([
    ['start', '2025-01-01T10:00:00', undefined],
    ['end', undefined, '2025-01-02T10:00:00']
  ])('calls onChange when %s date changes', (type, start, end) => {
    const handleChange = jest.fn();
    const { startInput, endInput } = renderPicker({ startDateTime: start, endDateTime: end, onChange: handleChange });

    const input = type === 'start' ? startInput : endInput;
    changeInput(input, type === 'start' ? '2025-01-02T12:00:00' : '2025-01-03T12:00:00');

    if (type === 'start') {
      expect(handleChange).toHaveBeenCalledWith(expect.any(String), end);
    } else {
      expect(handleChange).toHaveBeenCalledWith(start, expect.any(String));
    }
  });

  it('calls onChange with correct values for start and end dates', () => {
    const handleChange = jest.fn();
    const start = dayjs('2025-01-01T10:00:00').toISOString();
    const end = dayjs('2025-01-02T10:00:00').toISOString();
    const { startInput, endInput } = renderPicker({ startDateTime: start, endDateTime: end, onChange: handleChange });

    changeInput(startInput, '02.01.2025 12:00');
    changeInput(endInput, '03.01.2025 12:00');

    expect(handleChange).toHaveBeenCalledTimes(2);
  });

  it('renders dash separator', () => {
    renderPicker();
    expect(screen.getByText('—')).toBeInTheDocument();
  });
});
