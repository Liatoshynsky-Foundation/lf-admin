import { fireEvent,render, screen } from '@testing-library/react';

import HeaderRightActions from './HeaderRightActions';

jest.mock('./HeaderRightActions.style', () => ({
  styles: {
    container: {},
    pill: jest.fn(() => ({})),
    group: {},
    groupLeft: {},
    groupRight: {}
  }
}));

describe('HeaderRightActions Component', () => {
  const mockOnEdit = jest.fn();
  const mockOnPublish = jest.fn();
  const mockOnSave = jest.fn();
  const mockOnCancel = jest.fn();
  const mockOnMenuOpen = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Mode: "create"', () => {
    it('should render the preview icon and edit button by default', () => {
      render(<HeaderRightActions onEdit={mockOnEdit} />);

      expect(screen.getByRole('button', { name: 'Передогляд' })).toBeInTheDocument();
      const editButton = screen.getByRole('button', { name: 'Редагувати' });
      expect(editButton).toBeInTheDocument();
      expect(editButton).not.toBeDisabled();
    });

    it('should trigger onEdit when the edit button is clicked', () => {
      render(<HeaderRightActions onEdit={mockOnEdit} />);

      fireEvent.click(screen.getByRole('button', { name: 'Редагувати' }));
      expect(mockOnEdit).toHaveBeenCalledTimes(1);
    });

    it('should disable the edit button when disabled prop is true', () => {
      render(<HeaderRightActions disabled={true} onEdit={mockOnEdit} />);

      const editButton = screen.getByRole('button', { name: 'Редагувати' });
      expect(editButton).toBeDisabled();

      fireEvent.click(editButton);
      expect(mockOnEdit).not.toHaveBeenCalled();
    });
  });

  describe('Mode: "edit"', () => {
    it('should render the preview icon, publish button, and menu button', () => {
      render(<HeaderRightActions mode="edit" />);

      expect(screen.getByRole('button', { name: 'Передогляд' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Опублікувати' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Відкрити меню параметрів' })).toBeInTheDocument();
    });

    it('should trigger onPublish and onMenuOpen correctly', () => {
      render(<HeaderRightActions mode="edit" onPublish={mockOnPublish} onMenuOpen={mockOnMenuOpen} />);

      fireEvent.click(screen.getByRole('button', { name: 'Опублікувати' }));
      expect(mockOnPublish).toHaveBeenCalledTimes(1);

      fireEvent.click(screen.getByRole('button', { name: 'Відкрити меню параметрів' }));
      expect(mockOnMenuOpen).toHaveBeenCalledTimes(1);
    });

    it('should disable the publish button when disabled prop is true', () => {
      render(<HeaderRightActions mode="edit" disabled={true} onPublish={mockOnPublish} />);

      const publishButton = screen.getByRole('button', { name: 'Опублікувати' });
      expect(publishButton).toBeDisabled();
    });
  });

  describe('Mode: "seo"', () => {
    it('should render cancel and save buttons', () => {
      render(<HeaderRightActions mode="seo" />);

      expect(screen.getByRole('button', { name: 'Скасувати' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Зберегти' })).toBeInTheDocument();
    });

    it('should trigger onCancel and onSave correctly', () => {
      render(<HeaderRightActions mode="seo" onCancel={mockOnCancel} onSave={mockOnSave} />);

      fireEvent.click(screen.getByRole('button', { name: 'Скасувати' }));
      expect(mockOnCancel).toHaveBeenCalledTimes(1);

      fireEvent.click(screen.getByRole('button', { name: 'Зберегти' }));
      expect(mockOnSave).toHaveBeenCalledTimes(1);
    });

    it('should disable only the save button when disabled prop is true', () => {
      render(<HeaderRightActions mode="seo" disabled={true} />);

      expect(screen.getByRole('button', { name: 'Скасувати' })).not.toBeDisabled();
      expect(screen.getByRole('button', { name: 'Зберегти' })).toBeDisabled();
    });
  });

  describe('Edge Cases', () => {
    it('should render nothing if an invalid mode is somehow passed', () => {
      const { container } = render(<HeaderRightActions mode={'invalid' as 'edit' } />);
      expect(container.firstChild).toBeEmptyDOMElement();
    });
  });
});
