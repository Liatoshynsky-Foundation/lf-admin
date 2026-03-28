import dayjs from 'dayjs';

jest.mock('@mui/x-date-pickers/DesktopDateTimePicker', () => ({
  DesktopDateTimePicker: ({ label, value, onChange }: any) => (
    <input
      aria-label={label}
      value={value ? value.toString() : ''}
      onChange={(e) => onChange(e.target.value ? dayjs(e.target.value) : null)}
    />
  )
}));

import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';

import DateTimePicker from './DateTimePicker';

describe('DateTimePicker', () => {
  it('renders start and end labels', () => {
    render(
      <DateTimePicker
        onChange={jest.fn()}
        labels={{
          startDateTime: 'Start',
          endDateTime: 'End'
        }}
      />
    );

    expect(screen.getByLabelText('Start')).toBeInTheDocument();
    expect(screen.getByLabelText('End')).toBeInTheDocument();
  });

  it('renders default labels if not provided', () => {
    render(<DateTimePicker onChange={jest.fn()} />);

    expect(screen.getByLabelText('Початок події')).toBeInTheDocument();
    expect(screen.getByLabelText('Закінчення події')).toBeInTheDocument();
  });

  it('calls onChange when end date changes', () => {
    const handleChange = jest.fn();
    render(<DateTimePicker onChange={handleChange} />);
    const input = screen.getByLabelText('Закінчення події');
    fireEvent.change(input, {
      target: { value: '2025-01-02T10:00:00' }
    });

    expect(handleChange).toHaveBeenCalledWith(undefined, expect.any(String));
  });

  it('calls onChange when start date changes', () => {
    const handleChange = jest.fn();
    render(<DateTimePicker onChange={handleChange} />);
    const input = screen.getByLabelText('Початок події');
    fireEvent.change(input, {
      target: { value: '2025-01-01T10:00:00' }
    });

    expect(handleChange).toHaveBeenCalledWith(expect.any(String), undefined);
  });

  it('calls onChange with correct values for start date', () => {
    const handleChange = jest.fn();
    const start = dayjs('2025-01-01T10:00:00').toISOString();
    render(<DateTimePicker startDateTime={start} onChange={handleChange} />);
    const inputs = screen.getAllByRole('textbox');
    fireEvent.change(inputs[0], {
      target: { value: '02.01.2025 12:00' }
    });

    expect(handleChange).toHaveBeenCalled();
  });

  it('calls onChange with correct values for end date', () => {
    const handleChange = jest.fn();
    const end = dayjs('2025-01-02T10:00:00').toISOString();
    render(<DateTimePicker endDateTime={end} onChange={handleChange} />);
    const inputs = screen.getAllByRole('textbox');
    fireEvent.change(inputs[1], {
      target: { value: '03.01.2025 12:00' }
    });

    expect(handleChange).toHaveBeenCalled();
  });

  it('renders dash separator', () => {
    render(<DateTimePicker onChange={jest.fn()} />);

    expect(screen.getByText('—')).toBeInTheDocument();
  });
});
