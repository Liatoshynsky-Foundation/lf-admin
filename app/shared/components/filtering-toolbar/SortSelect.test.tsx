import { Box, Button } from '@mui/material';
import { act, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

import { SortSelect } from './SortSelect';
import { styles } from './SortSelect.styles';

interface MockMenuItemText {
  name: string;
}

interface MockMenuItem {
  id: string;
  text: MockMenuItemText;
  selected: boolean;
  onClick: () => void;
}

interface MockMenuGroup {
  title: string;
  items: MockMenuItem[];
}

interface MockActionMenuProps {
  anchorEl: HTMLElement | null;
  onClose: () => void;
  menuItems: MockMenuGroup[];
}

jest.mock('../dropdown-menu/ActionMenu', () => ({
  __esModule: true,
  default: ({ anchorEl, onClose, menuItems }: MockActionMenuProps) => {
    if (!anchorEl) return null;
    return (
      <Box data-testid="action-menu">
        {menuItems.map((group) => (
          <Box key={group.title}>
            <Box>{group.title}</Box>
            {group.items.map((item) => (
              <Button
                key={item.id}
                type="button"
                data-testid={`sort-option-${item.text.name}`}
                data-selected={item.selected}
                onClick={item.onClick}
              >
                {item.text.name}
              </Button>
            ))}
          </Box>
        ))}
        <Button data-testid="close-menu" onClick={onClose}>
          close
        </Button>
      </Box>
    );
  }
}));

describe('SortSelect', () => {
  const fieldOptions = [
    { value: 'date', label: 'Дата додавання' },
    { value: 'name', label: 'Назва файлу' }
  ] as const;

  const orderOptions = {
    date: [
      { value: 'date_desc', label: 'Новіші-старіші' },
      { value: 'date_asc', label: 'Старіші-новіші' }
    ],
    name: [
      { value: 'name_asc', label: 'А-Я' },
      { value: 'name_desc', label: 'Я-А' }
    ]
  } as const;

  const defaultProps = {
    fieldOptions,
    orderOptions,
    fieldValue: 'date' as const,
    value: 'date_desc' as const,
    triggerLabel: 'Нові спочатку',
    onFieldChange: jest.fn(),
    onValueChange: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders trigger label', () => {
    render(<SortSelect {...defaultProps} />);
    expect(screen.getByText('Нові спочатку')).toBeInTheDocument();
    expect(screen.queryByTestId('action-menu')).not.toBeInTheDocument();
  });

  it('opens the menu on trigger click and marks aria-expanded', () => {
    render(<SortSelect {...defaultProps} />);
    const trigger = screen.getByTestId('sort-select');

    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(trigger);

    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByTestId('action-menu')).toBeInTheDocument();
  });

  it('toggles the menu closed when the trigger is clicked again', () => {
    render(<SortSelect {...defaultProps} />);
    const trigger = screen.getByTestId('sort-select');

    fireEvent.click(trigger);
    expect(screen.getByTestId('action-menu')).toBeInTheDocument();

    fireEvent.click(trigger);
    expect(screen.queryByTestId('action-menu')).not.toBeInTheDocument();
  });

  it('does not open the menu when disabled', () => {
    render(<SortSelect {...defaultProps} disabled />);
    const trigger = screen.getByTestId('sort-select');

    expect(trigger).toHaveAttribute('tabIndex', '-1');
    fireEvent.click(trigger);

    expect(screen.queryByTestId('action-menu')).not.toBeInTheDocument();
  });

  it('closes the menu and restores focus to the trigger via onClose', () => {
    render(<SortSelect {...defaultProps} />);
    const trigger = screen.getByTestId('sort-select');

    trigger.focus();
    expect(trigger).toHaveFocus();

    fireEvent.click(trigger);
    expect(screen.getByTestId('action-menu')).toBeInTheDocument();

    act(() => {
      fireEvent.click(screen.getByTestId('close-menu'));
      trigger.focus();
    });

    expect(screen.queryByTestId('action-menu')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it('closes the menu via onClose', () => {
    render(<SortSelect {...defaultProps} />);
    const trigger = screen.getByTestId('sort-select');

    fireEvent.click(trigger);
    expect(screen.getByTestId('action-menu')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('close-menu'));

    expect(screen.queryByTestId('action-menu')).not.toBeInTheDocument();
  });

  it('marks the active field option as selected and calls onFieldChange', () => {
    const onFieldChange = jest.fn();
    render(<SortSelect {...defaultProps} onFieldChange={onFieldChange} />);

    fireEvent.click(screen.getByTestId('sort-select'));

    expect(screen.getByTestId('sort-option-Дата додавання')).toHaveAttribute('data-selected', 'true');
    expect(screen.getByTestId('sort-option-Назва файлу')).toHaveAttribute('data-selected', 'false');

    fireEvent.click(screen.getByTestId('sort-option-Назва файлу'));
    expect(onFieldChange).toHaveBeenCalledWith('name');
  });

  it('marks the active order option as selected, calls onValueChange, and closes the menu', () => {
    const onValueChange = jest.fn();
    render(<SortSelect {...defaultProps} fieldValue="name" value="name_desc" onValueChange={onValueChange} />);

    fireEvent.click(screen.getByTestId('sort-select'));

    expect(screen.getByTestId('sort-option-Я-А')).toHaveAttribute('data-selected', 'true');
    expect(screen.getByTestId('sort-option-А-Я')).toHaveAttribute('data-selected', 'false');

    act(() => {
      fireEvent.click(screen.getByTestId('sort-option-А-Я'));
    });

    expect(onValueChange).toHaveBeenCalledWith('name_asc');
    expect(screen.queryByTestId('action-menu')).not.toBeInTheDocument();
  });

  it('applies default section labels when not overridden', () => {
    render(<SortSelect {...defaultProps} />);
    fireEvent.click(screen.getByTestId('sort-select'));

    expect(screen.getByText('Сортувати за')).toBeInTheDocument();
    expect(screen.getByText('Порядок')).toBeInTheDocument();
  });

  it('applies custom section labels and dataTestId when provided', () => {
    render(
      <SortSelect
        {...defaultProps}
        fieldSectionLabel="Custom field"
        orderSectionLabel="Custom order"
        dataTestId="custom-sort-select"
      />
    );

    expect(screen.getByTestId('custom-sort-select')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('custom-sort-select'));

    expect(screen.getByText('Custom field')).toBeInTheDocument();
    expect(screen.getByText('Custom order')).toBeInTheDocument();
  });

  describe('SortSelect.styles isolated tests', () => {
    it('should cover all code paths in root style function', () => {
      const outlinedStyle = styles.root('outlined', false);
      expect(outlinedStyle).toHaveProperty('backgroundColor', 'transparent');
      expect(outlinedStyle).toHaveProperty('border', 1);

      const fallbackWidthStyle = styles.root('filled', false);
      expect(fallbackWidthStyle).toHaveProperty('minWidth', '136px');

      const customWidthStyle = styles.root('filled', false, 300);
      expect(customWidthStyle).toHaveProperty('minWidth', '300px');
    });

    it('should cover code paths in dropdownMenu style function', () => {
      const menuWithWidth = styles.dropdownMenu(250);
      const paperRootWithWidth = Object(menuWithWidth)['& .MuiPaper-root'];
      expect(paperRootWithWidth).toHaveProperty('minWidth', '250px');

      const menuWithoutWidth = styles.dropdownMenu();
      const paperRootWithoutWidth = Object(menuWithoutWidth)['& .MuiPaper-root'];
      expect(paperRootWithoutWidth).toHaveProperty('minWidth', undefined);
    });
  });
});
