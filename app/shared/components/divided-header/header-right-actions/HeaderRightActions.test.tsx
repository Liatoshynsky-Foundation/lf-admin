import { fireEvent, render, screen } from '@testing-library/react';

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
  const mockOnPreview = jest.fn();
  const mockOnPublish = jest.fn();
  const mockOnMenuOpen = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Mode: "create"', () => {
    it('should render the preview icon and edit button', () => {
      render(<HeaderRightActions mode="create" onEdit={mockOnEdit} onPreview={mockOnPreview} />);

      expect(screen.getByRole('button', { name: 'Передогляд' })).toBeInTheDocument();
      const editButton = screen.getByRole('button', { name: 'Редагувати' });
      expect(editButton).toBeInTheDocument();
      expect(editButton).not.toBeDisabled();
    });

    it('should trigger onEdit and onPreview when their respective buttons are clicked', () => {
      render(<HeaderRightActions mode="create" onEdit={mockOnEdit} onPreview={mockOnPreview} />);

      fireEvent.click(screen.getByRole('button', { name: 'Передогляд' }));
      expect(mockOnPreview).toHaveBeenCalledTimes(1);

      fireEvent.click(screen.getByRole('button', { name: 'Редагувати' }));
      expect(mockOnEdit).toHaveBeenCalledTimes(1);
    });

    it('should disable the edit button when disabled prop is true', () => {
      render(<HeaderRightActions mode="create" disabled={true} onEdit={mockOnEdit} />);

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

    it('should trigger onPreview, onPublish, and onMenuOpen correctly', () => {
      render(
        <HeaderRightActions
          mode="edit"
          onPreview={mockOnPreview}
          onPublish={mockOnPublish}
          onMenuOpen={mockOnMenuOpen}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: 'Передогляд' }));
      expect(mockOnPreview).toHaveBeenCalledTimes(1);

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

      expect(screen.getByRole('button', { name: 'Опублікувати' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Відкрити меню параметрів' })).toBeInTheDocument();
    });

    it('should trigger onCancel and onSave correctly', () => {
      render(<HeaderRightActions mode="seo" onPublish={mockOnPublish} onMenuOpen={mockOnMenuOpen} />);

      fireEvent.click(screen.getByRole('button', { name: 'Опублікувати' }));
      expect(mockOnPublish).toHaveBeenCalledTimes(1);

      fireEvent.click(screen.getByRole('button', { name: 'Відкрити меню параметрів' }));
      expect(mockOnMenuOpen).toHaveBeenCalledTimes(1);
    });

    it('should disable only the save button when disabled prop is true', () => {
      render(<HeaderRightActions mode="seo" disabled={true} />);

      expect(screen.getByRole('button', { name: 'Опублікувати' })).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Відкрити меню параметрів' })).toBeDisabled();
    });
  });

  describe('Unhandled mode', () => {
    it('should throw an error when an invalid mode is provided', () => {
      const invalidProps = {
        mode: 'invalid-mode'
      } as unknown as import('./HeaderRightActions').HeaderRightActionsProps;

      expect(() => render(<HeaderRightActions {...invalidProps} />)).toThrow('Unhandled mode: invalid-mode');
    });
  });
});
