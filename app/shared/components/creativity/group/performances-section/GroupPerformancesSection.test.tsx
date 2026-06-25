import { fireEvent, render, screen } from '@testing-library/react';
import React, { ChangeEvent, ReactNode } from 'react';

import { GroupPerformancesSection } from './GroupPerformancesSection';

type MockCustomTextFieldProps = {
  label: string;
  value?: unknown;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
};

jest.mock('~/shared/components/design-system/collapsible-block/CollapsibleBlock', () => ({
  __esModule: true,
  default: ({ children, title }: { children: ReactNode; title: string }) => (
    <div data-testid="mock-collapsible-block">
      <span>{title}</span>
      {children}
    </div>
  )
}));

jest.mock('~/shared/components/design-system/text-field/TextField', () => ({
  CustomTextField: ({ label, value, onChange }: MockCustomTextFieldProps) => (
    <div data-testid={`mock-field-wrapper-${label}`}>
      <label htmlFor={`input-${label}`}>{label}</label>
      <input
        id={`input-${label}`}
        data-testid={`mock-input-${label}`}
        value={(value as string) || ''}
        onChange={onChange}
      />
    </div>
  )
}));

jest.mock('~/shared/components/design-system/button/Button', () => ({
  __esModule: true,
  default: ({ children, onClick }: { children: ReactNode; onClick: () => void }) => (
    <button data-testid="mock-button-add" onClick={onClick}>
      {children}
    </button>
  )
}));

jest.mock('~/shared/components/delete-card-modal/DeleteCardModal', () => ({
  __esModule: true,
  default: ({ open, onClose, onDelete }: { open: boolean; onClose: () => void; onDelete: () => void }) =>
    open ? (
      <div data-testid="mock-delete-modal">
        <button data-testid="modal-cancel" onClick={onClose}>
          Скасувати
        </button>
        <button data-testid="modal-confirm" onClick={onDelete}>
          Підтвердити
        </button>
      </div>
    ) : null
}));

jest.mock('~/public/icons/plus.svg', () => ({
  __esModule: true,
  default: () => <span data-testid="icon-plus" />
}));

jest.mock('~/public/icons/trash.svg', () => ({
  __esModule: true,
  default: () => <span data-testid="icon-trash" />
}));

const mockOnChangeSectionTitle = jest.fn();
const mockOnChangePerformances = jest.fn();

const defaultProps = {
  sectionTitle: 'Тестовий заголовок виступів',
  performances: [
    { id: '1', url: 'https://youtube.com/watch?v=123', caption: 'Перший виступ' },
    { id: '2', url: 'https://example.com', caption: 'Другий виступ' }
  ],
  onChangeSectionTitle: mockOnChangeSectionTitle,
  onChangePerformances: mockOnChangePerformances
};

describe('GroupPerformancesSection Component', () => {
  beforeAll(() => {
    Object.defineProperty(window, 'crypto', {
      value: { randomUUID: () => 'mock-uuid-1234' }
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render correctly with initial props', () => {
    render(<GroupPerformancesSection {...defaultProps} />);

    expect(screen.getByTestId('mock-input-Заголовок секції')).toHaveValue('Тестовий заголовок виступів');

    const urlInputs = screen.getAllByTestId('mock-input-Canonical URL');
    const captionInputs = screen.getAllByTestId('mock-input-Підпис');

    expect(urlInputs).toHaveLength(2);
    expect(urlInputs[0]).toHaveValue('https://youtube.com/watch?v=123');
    expect(urlInputs[1]).toHaveValue('https://example.com');

    expect(captionInputs).toHaveLength(2);
    expect(captionInputs[0]).toHaveValue('Перший виступ');
    expect(captionInputs[1]).toHaveValue('Другий виступ');
  });

  it('should call onChangeSectionTitle when section title input changes', () => {
    render(<GroupPerformancesSection {...defaultProps} />);

    const titleInput = screen.getByTestId('mock-input-Заголовок секції');
    fireEvent.change(titleInput, { target: { value: 'Нова назва секції' } });

    expect(mockOnChangeSectionTitle).toHaveBeenCalledTimes(1);
    expect(mockOnChangeSectionTitle).toHaveBeenCalledWith('Нова назва секції');
  });

  it('should add a new performance when "Додати пункт" is clicked', () => {
    render(<GroupPerformancesSection {...defaultProps} />);

    const addButton = screen.getByTestId('mock-button-add');
    fireEvent.click(addButton);

    expect(mockOnChangePerformances).toHaveBeenCalledTimes(1);
    expect(mockOnChangePerformances).toHaveBeenCalledWith([
      ...defaultProps.performances,
      { id: 'mock-uuid-1234', url: '', caption: '' }
    ]);
  });

  it('should update performance URL correctly', () => {
    render(<GroupPerformancesSection {...defaultProps} />);

    const urlInputs = screen.getAllByTestId('mock-input-Canonical URL');
    fireEvent.change(urlInputs[0], { target: { value: 'https://new-link.com' } });

    expect(mockOnChangePerformances).toHaveBeenCalledTimes(1);
    expect(mockOnChangePerformances).toHaveBeenCalledWith([
      { id: '1', url: 'https://new-link.com', caption: 'Перший виступ' },
      defaultProps.performances[1]
    ]);
  });

  it('should update performance caption correctly', () => {
    render(<GroupPerformancesSection {...defaultProps} />);

    const captionInputs = screen.getAllByTestId('mock-input-Підпис');
    fireEvent.change(captionInputs[1], { target: { value: 'Оновлений підпис' } });

    expect(mockOnChangePerformances).toHaveBeenCalledTimes(1);
    expect(mockOnChangePerformances).toHaveBeenCalledWith([
      defaultProps.performances[0],
      { id: '2', url: 'https://example.com', caption: 'Оновлений підпис' }
    ]);
  });

  it('should open delete modal when trash icon is clicked', () => {
    render(<GroupPerformancesSection {...defaultProps} />);

    expect(screen.queryByTestId('mock-delete-modal')).not.toBeInTheDocument();

    const trashIcons = screen.getAllByTestId('icon-trash');
    fireEvent.click(trashIcons[1]);

    expect(screen.getByTestId('mock-delete-modal')).toBeInTheDocument();
  });

  it('should delete performance when confirmed in the modal', () => {
    render(<GroupPerformancesSection {...defaultProps} />);

    const trashIcons = screen.getAllByTestId('icon-trash');
    fireEvent.click(trashIcons[0]);

    const confirmButton = screen.getByTestId('modal-confirm');
    fireEvent.click(confirmButton);

    expect(mockOnChangePerformances).toHaveBeenCalledTimes(1);
    expect(mockOnChangePerformances).toHaveBeenCalledWith([defaultProps.performances[1]]);
  });

  it('should close delete modal without deleting when canceled', () => {
    render(<GroupPerformancesSection {...defaultProps} />);

    const trashIcons = screen.getAllByTestId('icon-trash');
    fireEvent.click(trashIcons[0]);

    const cancelButton = screen.getByTestId('modal-cancel');
    fireEvent.click(cancelButton);

    expect(mockOnChangePerformances).not.toHaveBeenCalled();
    expect(screen.queryByTestId('mock-delete-modal')).not.toBeInTheDocument();
  });
});
