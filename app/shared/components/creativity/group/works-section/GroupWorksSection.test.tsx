import { fireEvent, render, screen } from '@testing-library/react';
import React, { ReactNode } from 'react';

import { GroupWorksSection, WorkItem } from './GroupWorksSection';

Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: () => 'mock-uuid-1234'
  }
});

type MockCollapsibleBlockProps = {
  children: ReactNode;
  title?: string;
};

type MockDeleteModalProps = {
  open: boolean;
  onClose: () => void;
  onDelete: () => void;
};

jest.mock('@mui/material', () => {
  const originalModule = jest.requireActual('@mui/material');
  return {
    ...originalModule,
    Autocomplete: ({ options, value, onChange, onInputChange, PaperComponent, disabled }: any) => (
      <div data-testid={`mock-autocomplete-${value?.id}`} data-disabled={disabled}>
        <button 
          data-testid={`trigger-select-${value?.id}`} 
          onClick={() => onChange(null, options[0])} 
        />
        <button 
          data-testid={`trigger-clear-${value?.id}`} 
          onClick={() => onChange(null, null)} 
        />
        <input 
          data-testid={`trigger-input-${value?.id}`} 
          onChange={(e) => onInputChange(null, e.target.value)} 
        />
        
        {PaperComponent && !disabled && (
          <PaperComponent>
            <div data-testid="paper-children">Options</div>
          </PaperComponent>
        )}
      </div>
    )
  };
});

jest.mock('~/shared/components/design-system/collapsible-block/CollapsibleBlock', () => ({
  __esModule: true,
  default: ({ children }: MockCollapsibleBlockProps) => (
    <div data-testid="mock-collapsible-block">{children}</div>
  )
}));

jest.mock('~/shared/components/design-system/button/Button', () => ({
  __esModule: true,
  default: ({ children, onClick }: any) => (
    <button data-testid="mock-button-add" onClick={onClick}>{children}</button>
  )
}));

jest.mock('~/shared/components/delete-card-modal/DeleteCardModal', () => ({
  __esModule: true,
  default: ({ open, onClose, onDelete }: MockDeleteModalProps) => {
    if (!open) return null;
    return (
      <div data-testid="mock-delete-modal">
        <button data-testid="modal-confirm" onClick={onDelete}>Confirm</button>
        <button data-testid="modal-cancel" onClick={onClose}>Cancel</button>
      </div>
    );
  }
}));

jest.mock('~/public/icons/pencil.svg', () => ({
  __esModule: true,
  default: () => <span data-testid="icon-pencil" />
}));
jest.mock('~/public/icons/trash.svg', () => ({
  __esModule: true,
  default: () => <span data-testid="icon-trash" />
}));
jest.mock('~/public/icons/plus.svg', () => ({
  __esModule: true,
  default: () => <span data-testid="icon-plus" />
}));

const mockOnChange = jest.fn();

const defaultWorks: WorkItem[] = [
  { id: '1', title: 'Симфонія №1' },
  { id: '2', title: 'Соната' }
];

const availableWorks: WorkItem[] = [
  { id: '3', title: 'Доступний твір 1', genre: { uk: 'Жанр', en: 'Genre' } }
];

describe('GroupWorksSection Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the list of works successfully', () => {
    render(<GroupWorksSection works={defaultWorks} availableWorks={availableWorks} onChange={mockOnChange} />);

    expect(screen.getByTestId('mock-autocomplete-1')).toBeInTheDocument();
    expect(screen.getByTestId('mock-autocomplete-2')).toBeInTheDocument();
  });

  it('should add a new work and enable edit mode for it', () => {
    render(<GroupWorksSection works={defaultWorks} availableWorks={availableWorks} onChange={mockOnChange} />);

    const addButton = screen.getByTestId('mock-button-add');
    fireEvent.click(addButton);

    expect(mockOnChange).toHaveBeenCalledTimes(1);
    const newWorksArray = mockOnChange.mock.calls[0][0];
    
    expect(newWorksArray).toHaveLength(3);
    expect(newWorksArray[2].id).toBe('mock-uuid-1234');
    expect(newWorksArray[2].title).toBe('');
  });

  it('should update the work when an existing option is selected from Autocomplete', () => {
    render(<GroupWorksSection works={defaultWorks} availableWorks={availableWorks} onChange={mockOnChange} />);

    fireEvent.click(screen.getByTestId('trigger-select-1'));

    expect(mockOnChange).toHaveBeenCalledTimes(1);
    const updatedWorks = mockOnChange.mock.calls[0][0];
    
    expect(updatedWorks[0].id).toBe('3');
    expect(updatedWorks[0].title).toBe('Доступний твір 1');
    expect(updatedWorks[0].genre).toEqual({ uk: 'Жанр', en: 'Genre' });
  });

  it('should clear the work title if the selection is cleared', () => {
    render(<GroupWorksSection works={defaultWorks} availableWorks={availableWorks} onChange={mockOnChange} />);

    fireEvent.click(screen.getByTestId('trigger-clear-1'));

    expect(mockOnChange).toHaveBeenCalledTimes(1);
    const updatedWorks = mockOnChange.mock.calls[0][0];
    
    expect(updatedWorks[0].title).toBe('');
  });

  it('should toggle edit mode when the pencil icon is clicked', () => {
    render(<GroupWorksSection works={defaultWorks} availableWorks={availableWorks} onChange={mockOnChange} />);

    expect(screen.getByTestId('mock-autocomplete-1')).toHaveAttribute('data-disabled', 'true');

    const editButtons = screen.getAllByTestId('edit-work-btn');
    fireEvent.click(editButtons[0]);

    expect(screen.getByTestId('mock-autocomplete-1')).toHaveAttribute('data-disabled', 'false');
  });

  it('should open delete modal and delete work when confirmed', () => {
    render(<GroupWorksSection works={defaultWorks} availableWorks={availableWorks} onChange={mockOnChange} />);

    const deleteButtons = screen.getAllByTestId('delete-work-btn');
    fireEvent.click(deleteButtons[1]);

    expect(screen.getByTestId('mock-delete-modal')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('modal-confirm'));

    expect(mockOnChange).toHaveBeenCalledTimes(1);
    const updatedWorks = mockOnChange.mock.calls[0][0];
    
    expect(updatedWorks).toHaveLength(1);
    expect(updatedWorks[0].id).toBe('1');
  });

  it('should update local searchValues when typing in Autocomplete', () => {
    render(<GroupWorksSection works={defaultWorks} availableWorks={availableWorks} onChange={mockOnChange} />);

    const editButtons = screen.getAllByTestId('edit-work-btn');
    fireEvent.click(editButtons[0]);

    const input = screen.getByTestId('trigger-input-1');
    fireEvent.change(input, { target: { value: 'Трохи ввів текст' } });

    expect(mockOnChange).not.toHaveBeenCalled();
    expect(screen.getByText('Створити новий твір')).toBeInTheDocument();
  });

  it('should exit edit mode when "Створити новий твір" is clicked', () => {
    render(<GroupWorksSection works={defaultWorks} availableWorks={availableWorks} onChange={mockOnChange} />);
    const editButtons = screen.getAllByTestId('edit-work-btn');
    fireEvent.click(editButtons[0]);
    const createNewBtn = screen.getByText('Створити новий твір');
    fireEvent.click(createNewBtn);

    expect(screen.getByTestId('mock-autocomplete-1')).toHaveAttribute('data-disabled', 'true');
    expect(mockOnChange).not.toHaveBeenCalled();
  });
});
