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

  test.each([
    [undefined, undefined],
    ['Start', 'End']
  ] as const)('renders with startDateTime label "%s" and endDateTime label "%s"', (startLabel, endLabel) => {
    const labels = startLabel ? { startDateTime: startLabel, endDateTime: endLabel } : undefined;
    const { startInput, endInput } = renderPicker({ labels });
    expect(startInput).toBeInTheDocument();
    expect(endInput).toBeInTheDocument();
  });

  test.each([
    ['start', '2025-01-01T10:00:00', undefined, 'startInput', '2025-01-02T12:00:00', [expect.any(String), undefined]],
    ['end', undefined, '2025-01-02T10:00:00', 'endInput', '2025-01-03T12:00:00', [undefined, expect.any(String)]]
  ] as const)('calls onChange when %s date changes', (_type, start, end, inputKey, newValue, expected) => {
    const handleChange = jest.fn();
    const inputs = renderPicker({ startDateTime: start, endDateTime: end, onChange: handleChange });
    changeInput(inputs[inputKey], newValue);
    expect(handleChange).toHaveBeenCalledWith(expected[0], expected[1]);
  });

  test.each([
    ['start', { startDateTime: '2025-01-01T10:00:00' }, 'startInput'],
    ['end', { endDateTime: '2025-01-02T10:00:00' }, 'endInput']
  ] as const)('calls onChange with undefined when %s date is cleared', (_type, props, inputKey) => {
    const handleChange = jest.fn();
    const inputs = renderPicker({ ...props, onChange: handleChange });
    changeInput(inputs[inputKey], '');
    expect(handleChange).toHaveBeenCalledWith(undefined, undefined);
  });

  it('renders dash separator', () => {
    renderPicker();
    expect(screen.getByText('—')).toBeInTheDocument();
  });
});
