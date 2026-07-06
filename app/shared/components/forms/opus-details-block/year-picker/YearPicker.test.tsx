import { fireEvent, render, screen } from '@testing-library/react';
import { ReactNode } from 'react';

import YearPicker from './YearPicker';

jest.mock('@mui/x-date-pickers/LocalizationProvider', () => ({
  LocalizationProvider: ({ children }: { children: ReactNode }) => <>{children}</>
}));

jest.mock('@mui/x-date-pickers/DatePicker', () => ({
  DatePicker: ({
    label,
    onChange
  }: {
    label: string;
    onChange: (value: { year: () => number; isValid: () => boolean } | null) => void;
  }) => (
    <div>
      <span>{label}</span>
      <button onClick={() => onChange({ year: () => 1915, isValid: () => true })}>pick</button>
      <button onClick={() => onChange(null)}>clear</button>
    </div>
  )
}));

describe('YearPicker', () => {
  it('renders the provided label', () => {
    render(<YearPicker label="Рік створення" value="" onChange={jest.fn()} />);

    expect(screen.getByText('Рік створення')).toBeInTheDocument();
  });

  it('reports the picked year as a string', () => {
    const onChange = jest.fn();
    render(<YearPicker label="Рік" value="" onChange={onChange} />);

    fireEvent.click(screen.getByText('pick'));

    expect(onChange).toHaveBeenCalledWith('1915');
  });

  it('reports an empty string when the value is cleared', () => {
    const onChange = jest.fn();
    render(<YearPicker label="Рік" value="1915" onChange={onChange} />);

    fireEvent.click(screen.getByText('clear'));

    expect(onChange).toHaveBeenCalledWith('');
  });
});
