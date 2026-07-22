import { createEvent, fireEvent, render, screen } from '@testing-library/react';
import { ReactNode } from 'react';

import YearPicker from './YearPicker';

jest.mock('@mui/x-date-pickers/LocalizationProvider', () => ({
  LocalizationProvider: ({ children }: { children: ReactNode }) => <>{children}</>
}));

jest.mock('@mui/x-date-pickers/DatePicker', () => ({
  DatePicker: (props: any) => {
    const { onOpen, onClose, onChange, slotProps, value, open } = props;
    const textField = slotProps?.textField;
    const iconButton = textField?.InputProps?.startAdornment?.props?.children;

    return (
      <div data-testid="mock-datepicker" data-open={open}>
        <span>{props.label}</span>

        <span data-testid="value-display">{value ? value.year() : 'null'}</span>

        <button onClick={() => onChange({ year: () => 1915, isValid: () => true })}>pick</button>
        <button onClick={() => onChange({ year: () => NaN, isValid: () => false })}>pick-invalid</button>
        <button onClick={() => onChange(null)}>clear</button>

        <button onClick={onOpen}>onOpen</button>
        <button onClick={onClose}>onClose</button>

        <button onClick={textField?.onClick}>tf-click</button>
        <button onKeyDown={(e) => textField?.onKeyDown(e)}>tf-keydown</button>

        <button onClick={iconButton?.props?.onClick}>icon-click</button>
      </div>
    );
  }
}));

describe('YearPicker', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the provided label and correctly converts valid string to Dayjs', () => {
    render(<YearPicker label="Рік створення" value="2023" onChange={jest.fn()} />);
    expect(screen.getByText('Рік створення')).toBeInTheDocument();
    expect(screen.getByTestId('value-display')).toHaveTextContent('2023');
  });

  it('handles invalid year string gracefully returning null (yearToValue)', () => {
    render(<YearPicker label="Рік" value="abc" onChange={jest.fn()} />);
    expect(screen.getByTestId('value-display')).toHaveTextContent('null');
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

  it('reports an empty string when the picked year is invalid (valueToYear)', () => {
    const onChange = jest.fn();
    render(<YearPicker label="Рік" value="" onChange={onChange} />);

    fireEvent.click(screen.getByText('pick-invalid'));

    expect(onChange).toHaveBeenCalledWith('');
  });

  it('manages the open state correctly through onOpen and onClose', () => {
    render(<YearPicker label="Рік" value="" onChange={jest.fn()} />);
    const container = screen.getByTestId('mock-datepicker');

    expect(container).toHaveAttribute('data-open', 'false');

    fireEvent.click(screen.getByText('onOpen'));
    expect(container).toHaveAttribute('data-open', 'true');

    fireEvent.click(screen.getByText('onClose'));
    expect(container).toHaveAttribute('data-open', 'false');
  });

  it('opens the picker when clicking the text field directly', () => {
    render(<YearPicker label="Рік" value="" onChange={jest.fn()} />);
    const container = screen.getByTestId('mock-datepicker');

    fireEvent.click(screen.getByText('tf-click'));

    expect(container).toHaveAttribute('data-open', 'true');
  });

  it('prevents default behavior on text field keydown', () => {
    render(<YearPicker label="Рік" value="" onChange={jest.fn()} />);
    const button = screen.getByText('tf-keydown');

    const keyDownEvent = createEvent.keyDown(button, { key: 'Enter' });
    fireEvent(button, keyDownEvent);
    expect(keyDownEvent.defaultPrevented).toBe(true);
  });

  it('opens the picker when clicking the calendar icon inside startAdornment', () => {
    render(<YearPicker label="Рік" value="" onChange={jest.fn()} />);
    const container = screen.getByTestId('mock-datepicker');

    fireEvent.click(screen.getByText('icon-click'));

    expect(container).toHaveAttribute('data-open', 'true');
  });
});
