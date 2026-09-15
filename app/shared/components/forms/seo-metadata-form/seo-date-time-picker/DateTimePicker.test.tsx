import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import dayjs from 'dayjs';

import type { DateTimePickerProps } from './DateTimePicker';
import DateTimePicker from './DateTimePicker';
import { seoFormErrors } from '~/constants/errors';

jest.mock('@mui/x-date-pickers/DesktopDateTimePicker', () => ({
  DesktopDateTimePicker: ({
    label,
    value,
    onChange,
    slotProps
  }: {
    label?: string;
    value?: dayjs.Dayjs | null;
    onChange: (value: dayjs.Dayjs | null) => void;
    slotProps?: {
      textField?: {
        error?: boolean;
        onBlur?: () => void;
      };
    };
  }) => (
    <div>
      <input
        aria-label={label}
        data-error={String(Boolean(slotProps?.textField?.error))}
        value={value ? value.format('YYYY-MM-DDTHH:mm:ss') : ''}
        onChange={(e) => {
          const val = e.target.value;
          onChange(val ? dayjs(val) : null);
        }}
        onBlur={slotProps?.textField?.onBlur}
      />
    </div>
  )
}));

describe('DateTimePicker', () => {
  const fallbackLabels = { startDateTime: 'Event start', endDateTime: 'Event end' };

  const renderPicker = (props: Partial<DateTimePickerProps> = {}) => {
    render(<DateTimePicker onChange={jest.fn()} {...props} />);
    const startInput = screen.getByLabelText(props.labels?.startDateTime ?? fallbackLabels.startDateTime);
    const endInput = screen.getByLabelText(props.labels?.endDateTime ?? fallbackLabels.endDateTime);
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

  it('shows helper text when end date is before start date', () => {
    renderPicker({
      startDateTime: '2025-01-02T15:00:00',
      endDateTime: '2025-01-02T12:00:00'
    });

    expect(screen.getByText(seoFormErrors.uk.endBeforeStart)).toBeInTheDocument();
  });

  it('shows English end-before-start helper text for en locale', () => {
    renderPicker({
      locale: 'en',
      startDateTime: '2025-01-02T15:00:00',
      endDateTime: '2025-01-02T12:00:00'
    });

    expect(screen.getByText(seoFormErrors.en.endBeforeStart)).toBeInTheDocument();
  });

  it('does not show end-before-start helper text when dates are valid', () => {
    renderPicker({
      startDateTime: '2025-01-02T12:00:00',
      endDateTime: '2025-01-02T15:00:00'
    });

    expect(screen.queryByText(seoFormErrors.uk.endBeforeStart)).not.toBeInTheDocument();
  });

  it('renders fallback English labels when custom labels are omitted', () => {
    renderPicker({ locale: 'en' });

    expect(screen.getByLabelText(fallbackLabels.startDateTime)).toBeInTheDocument();
    expect(screen.getByLabelText(fallbackLabels.endDateTime)).toBeInTheDocument();
  });

  it('shows required helper text only on start when forceShowErrors and start is empty', () => {
    renderPicker({ forceShowErrors: true });

    expect(screen.getByText(seoFormErrors.uk.required)).toBeInTheDocument();
    expect(screen.getAllByText(seoFormErrors.uk.required)).toHaveLength(1);
  });

  it('calls onStartBlur when start field blurs', () => {
    const onStartBlur = jest.fn();
    const { startInput } = renderPicker({ onStartBlur });

    fireEvent.blur(startInput);
    expect(onStartBlur).toHaveBeenCalledTimes(1);
  });

  it('shows English required helper text on start when locale is en', () => {
    renderPicker({ forceShowErrors: true, locale: 'en' });

    expect(screen.getByText(seoFormErrors.en.required)).toBeInTheDocument();
    expect(screen.getAllByText(seoFormErrors.en.required)).toHaveLength(1);
  });

  it('does not show required helper text when forceShowErrors and start is set', () => {
    renderPicker({
      forceShowErrors: true,
      startDateTime: '2025-01-02T12:00:00'
    });

    expect(screen.queryByText(seoFormErrors.uk.required)).not.toBeInTheDocument();
  });
});
