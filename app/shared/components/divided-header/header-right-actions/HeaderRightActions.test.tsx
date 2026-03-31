import { fireEvent,render, screen } from '@testing-library/react';

import HeaderRightActions from './HeaderRightActions';

jest.mock('lucide-react', () => ({
  EyeIcon: () => <svg data-testid="icon-eye" />,
  ChevronDown: () => <svg data-testid="icon-chevron" />
}));

describe('HeaderRightActions Component', () => {
  let mockOnEdit: jest.Mock;
  let mockOnPublish: jest.Mock;
  let mockOnSave: jest.Mock;
  let mockOnCancel: jest.Mock;
  let mockOnMenuOpen: jest.Mock;

  beforeEach(() => {
    mockOnEdit = jest.fn();
    mockOnPublish = jest.fn();
    mockOnSave = jest.fn();
    mockOnCancel = jest.fn();
    mockOnMenuOpen = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Mode: Create (Default)', () => {
    it('should render the Create mode correctly by default', () => {
      render(<HeaderRightActions onEdit={mockOnEdit} />);

      expect(screen.getByRole('button', { name: 'Передогляд' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Редагувати' })).toBeInTheDocument();
      
      expect(screen.queryByRole('button', { name: 'Опублікувати' })).not.toBeInTheDocument();
    });

    it('should call onEdit when "Редагувати" is clicked', () => {
      render(<HeaderRightActions mode="create" onEdit={mockOnEdit} />);

      const editButton = screen.getByRole('button', { name: 'Редагувати' });
      fireEvent.click(editButton);

      expect(mockOnEdit).toHaveBeenCalledTimes(1);
    });
  });

  describe('Mode: Edit', () => {
    it('should render the Edit mode correctly', () => {
      render(<HeaderRightActions mode="edit" />);

      expect(screen.getByRole('button', { name: 'Передогляд' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Опублікувати' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Відкрити меню параметрів' })).toBeInTheDocument();

      expect(screen.getByRole('group', { name: 'Дії публікації' })).toBeInTheDocument();

      expect(screen.queryByRole('button', { name: 'Редагувати' })).not.toBeInTheDocument();
    });

    it('should call onPublish and onMenuOpen when buttons are clicked', () => {
      render(
        <HeaderRightActions 
          mode="edit" 
          onPublish={mockOnPublish} 
          onMenuOpen={mockOnMenuOpen} 
        />
      );

      fireEvent.click(screen.getByRole('button', { name: 'Опублікувати' }));
      expect(mockOnPublish).toHaveBeenCalledTimes(1);

      fireEvent.click(screen.getByRole('button', { name: 'Відкрити меню параметрів' }));
      expect(mockOnMenuOpen).toHaveBeenCalledTimes(1);
    });
  });

  describe('Mode: SEO', () => {
    it('should render the SEO mode correctly and handle clicks', () => {
      render(
        <HeaderRightActions 
          mode="seo" 
          onCancel={mockOnCancel} 
          onSave={mockOnSave} 
        />
      );

      const cancelButton = screen.getByRole('button', { name: 'Скасувати' });
      const saveButton = screen.getByRole('button', { name: 'Зберегти' });
      
      expect(cancelButton).toBeInTheDocument();
      expect(saveButton).toBeInTheDocument();

      expect(screen.getByRole('group', { name: 'Дії збереження' })).toBeInTheDocument();
      
      expect(screen.queryByRole('button', { name: 'Передогляд' })).not.toBeInTheDocument();

      fireEvent.click(cancelButton);
      fireEvent.click(saveButton);

      expect(mockOnCancel).toHaveBeenCalledTimes(1);
      expect(mockOnSave).toHaveBeenCalledTimes(1);
    });
  });

  describe('Edge Cases', () => {
    it('should return null (empty DOM) if an unknown mode is passed', () => {
      const badMode = 'unknown' as unknown as 'create';
      
      const { container } = render(
        <HeaderRightActions mode={badMode} />
      );

      expect(container.firstChild).toBeEmptyDOMElement();
    });
  });
});

