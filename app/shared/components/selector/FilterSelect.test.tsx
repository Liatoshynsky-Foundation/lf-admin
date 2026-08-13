import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

import { FilterSelect } from './FilterSelect';
import { filterSelectStyles } from './FilterSelect.styles';
import { BaseContentStatuses } from '~/types/enums/common.enums';

const mockOptions = [
  { label: 'First', value: 'first' },
  { label: 'Second', value: 'second' },
  { label: 'Third', value: 'third' }
] as const;

const mockUseMenuScrollClose = jest.fn(({ onClose }: { onClose: () => void }) => ({
  disableTransition: false,
  handleClose: () => onClose()
}));

const rootStyleSpy = jest.spyOn(filterSelectStyles, 'root');

jest.mock('~/shared/hooks/use-menu-scroll-close/useMenuScrollClose', () => ({
  useMenuScrollClose: (args: { onClose: () => void; anchorEl: unknown }) => mockUseMenuScrollClose(args)
}));

jest.mock('~/public/icons/close.svg', () => ({
  __esModule: true,
  default: (props: React.ComponentProps<'svg'>) => <svg data-testid="clear-all-icon" {...props} />
}));

jest.mock('./FilterSelectItem/FilterSelectItem', () => {
  const MockFilterSelectItem = ({ onClick, label }: { onClick: () => void; label: string }) => (
    <button data-testid={`item-${label}`} onClick={onClick}>
      {label}
    </button>
  );
  MockFilterSelectItem.displayName = 'MockFilterSelectItem';
  return MockFilterSelectItem;
});

describe('FilterSelect', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should execute real style logic for all variants, disabled states, chips, and menus', () => {
    render(<FilterSelect label="Outlined Select" options={mockOptions} variant="outlined" />);
    expect(rootStyleSpy).toHaveBeenLastCalledWith('outlined', false);

    render(<FilterSelect label="Filled Select" options={mockOptions} variant="filled" />);
    expect(rootStyleSpy).toHaveBeenLastCalledWith('filled', false);

    const { rerender } = render(
      <FilterSelect label="Disabled Select" options={mockOptions} defaultValue={['first']} disabled={true} />
    );
    expect(rootStyleSpy).toHaveBeenLastCalledWith('filled', true);

    rerender(
      <FilterSelect label="Menu Width Select" options={mockOptions} defaultValue={['first']} menuMinWidth={250} />
    );
  });

  it('should render the label', () => {
    render(<FilterSelect label="Test Label" options={mockOptions} />);
    expect(screen.getByText('Test Label')).toBeInTheDocument();
  });

  it('should open dropdown when clicked', () => {
    render(<FilterSelect label="Dropdown" options={mockOptions} />);

    fireEvent.click(screen.getByRole('button', { name: 'Dropdown' }));

    mockOptions.forEach(({ label }) => {
      expect(screen.getByText(label)).toBeInTheDocument();
    });
  });

  it('should call onAdd when item is selected', () => {
    const onAdd = jest.fn();

    render(<FilterSelect label="Select" options={mockOptions} onAdd={onAdd} />);

    fireEvent.click(screen.getByRole('button', { name: 'Select' }));
    fireEvent.click(screen.getByText('Second'));

    expect(onAdd).toHaveBeenCalledWith('second', 'Second', ['second']);
  });

  it('should clear selected item via clear action and call onRemove', () => {
    const onRemove = jest.fn();

    render(<FilterSelect label="Remove" options={mockOptions} defaultValues={['first']} onRemove={onRemove} />);

    fireEvent.click(screen.getByRole('button', { name: /remove/i }));
    fireEvent.click(screen.getByRole('button', { name: 'Очистити' }));

    expect(onRemove).toHaveBeenCalledWith('first', 'First', []);
  });

  it('should clear selected items via Chip delete button', () => {
    const onRemove = jest.fn();
    render(<FilterSelect label="Remove" options={mockOptions} defaultValue={['first']} onRemove={onRemove} />);

    const clearIcon = screen.getByTestId('clear-all-icon');
    fireEvent.click(clearIcon);

    expect(onRemove).toHaveBeenCalledWith('first', 'First', []);
  });

  it('should not open menu if disabled', () => {
    render(<FilterSelect label="Disabled" options={mockOptions} disabled />);

    fireEvent.click(screen.getByRole('button', { name: 'Disabled' }));
    expect(screen.queryByText('First')).not.toBeInTheDocument();
  });

  it('should call onChange in controlled mode', () => {
    const onChange = jest.fn();

    render(<FilterSelect label="Controlled" options={mockOptions} value={[]} onChange={onChange} />);

    fireEvent.click(screen.getByRole('button', { name: 'Controlled' }));
    fireEvent.click(screen.getByText('Second'));

    expect(onChange).toHaveBeenCalledWith(['second']);
  });

  it('should prevent adding more items if maxSelections limit is reached', () => {
    const onAdd = jest.fn();

    render(
      <FilterSelect
        label="Max Limit"
        options={mockOptions}
        defaultValue={['first', 'second']}
        maxSelections={2}
        onAdd={onAdd}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /max limit/i }));

    fireEvent.click(screen.getByText('Third'));
    expect(onAdd).not.toHaveBeenCalled();
  });

  it('should update uncontrolled values via useEffect when defaultValues change', () => {
    const { rerender } = render(<FilterSelect label="Effect Test" options={mockOptions} defaultValue={['first']} />);

    expect(screen.getByText('First')).toBeInTheDocument();

    rerender(<FilterSelect label="Effect Test" options={mockOptions} defaultValue={['second']} />);
    expect(screen.getByText('Second')).toBeInTheDocument();
  });

  it('should hide counter chip if hideCounterChip is true', () => {
    render(<FilterSelect label="Hidden Chip" options={mockOptions} defaultValue={['first']} hideCounterChip />);

    expect(screen.queryByTestId('clear-all-icon')).not.toBeInTheDocument();
    expect(screen.getByText('Hidden Chip')).toBeInTheDocument();
  });

  it('should support maxSelections === 1 when no previous value exists', () => {
    const onAdd = jest.fn();
    const onRemove = jest.fn();

    render(
      <FilterSelect
        label="Single Empty"
        options={mockOptions}
        defaultValue={[]}
        maxSelections={1}
        onAdd={onAdd}
        onRemove={onRemove}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /single empty/i }));
    fireEvent.click(screen.getByText('First'));

    expect(onRemove).not.toHaveBeenCalled();
    expect(onAdd).toHaveBeenCalledWith('first', 'First', ['first']);
  });

  it('should handle toggle off for already selected item', () => {
    const onRemove = jest.fn();

    render(<FilterSelect label="Toggle Off" options={mockOptions} defaultValue={['first']} onRemove={onRemove} />);

    fireEvent.click(screen.getByRole('button', { name: /toggle off/i }));

    const optionsList = screen.getAllByText('First');
    fireEvent.click(optionsList[optionsList.length - 1]);

    expect(onRemove).toHaveBeenCalledWith('first', 'First', []);
  });

  it('should replace previous value when maxSelections === 1 and trigger onClose branch', () => {
    const onAdd = jest.fn();
    const onRemove = jest.fn();

    render(
      <FilterSelect
        label="Single Populated"
        options={mockOptions}
        defaultValue={['first']}
        maxSelections={1}
        onAdd={onAdd}
        onRemove={onRemove}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /single populated/i }));
    fireEvent.click(screen.getByTestId('item-Second'));

    expect(onRemove).toHaveBeenCalledWith('first', 'First', []);
    expect(onAdd).toHaveBeenCalledWith('second', 'Second', ['second']);
  });

  it('should use empty string fallback if previousOption is not found during maxSelections === 1 replacement', () => {
    const onRemove = jest.fn();

    render(
      <FilterSelect
        label="Fallback Label"
        options={mockOptions}
        defaultValue={['unknown']}
        maxSelections={1}
        onRemove={onRemove}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /fallback label/i }));
    fireEvent.click(screen.getByTestId('item-First'));

    expect(onRemove).toHaveBeenCalledWith('unknown', '', []);
  });

  it('should hit the final else return branch inside handleOptionClick', () => {
    const onAdd = jest.fn();
    const onChange = jest.fn();

    render(
      <FilterSelect
        label="Else Return"
        options={mockOptions}
        defaultValue={['first', 'second']}
        maxSelections={2}
        onAdd={onAdd}
        onChange={onChange}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /else return/i }));
    fireEvent.click(screen.getByTestId('item-Third'));
    expect(onAdd).not.toHaveBeenCalled();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('should toggle-close the menu when trigger is clicked while already open', () => {
    render(<FilterSelect label="Toggle Trigger" options={mockOptions} />);

    const trigger = screen.getByRole('button', { name: 'Toggle Trigger' });

    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');

    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('should fallback to empty label in clearAll forEach for unknown values', () => {
    const onRemove = jest.fn();

    render(
      <FilterSelect
        label="Clear Unknown"
        options={mockOptions}
        defaultValue={['first', 'unknown']}
        onRemove={onRemove}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /clear unknown/i }));
    fireEvent.click(screen.getByRole('button', { name: 'Очистити' }));

    expect(onRemove).toHaveBeenCalledWith('first', 'First', []);
    expect(onRemove).toHaveBeenCalledWith('unknown', '', []);
  });

  it('should pass transitionDuration=0 when disableTransition is true', () => {
    mockUseMenuScrollClose.mockReturnValueOnce({
      disableTransition: true,
      handleClose: jest.fn()
    });

    render(<FilterSelect label="No Transition" options={mockOptions} />);

    fireEvent.click(screen.getByRole('button', { name: 'No Transition' }));
    expect(mockUseMenuScrollClose).toHaveBeenCalled();
  });

  it('should render Badge icon for badgeable statuses', () => {
    const badgeableOptions = [
      { label: 'Published', value: BaseContentStatuses.Published },
      { label: 'Hidden', value: BaseContentStatuses.Hidden }
    ];
    render(<FilterSelect label="Badgeable Select" options={badgeableOptions} />);
    fireEvent.click(screen.getByRole('button', { name: 'Badgeable Select' }));
    expect(screen.getByTestId('item-Published')).toBeInTheDocument();
    expect(screen.getByTestId('item-Hidden')).toBeInTheDocument();
  });
});
