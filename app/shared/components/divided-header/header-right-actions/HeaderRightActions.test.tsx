import { fireEvent, render, screen } from '@testing-library/react';

import HeaderRightActions from './HeaderRightActions';

jest.mock('./HeaderRightActions.style', () => ({
  styles: {
    container: {},
    pill: jest.fn(() => ({})),
    group: {},
    groupLeft: {},
    groupRight: {},
    groupSingle: {}
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

    it('should render custom editLabel when provided', () => {
      render(<HeaderRightActions mode="create" onEdit={mockOnEdit} editLabel="Перейти до редагування" />);

      expect(screen.getByRole('button', { name: 'Перейти до редагування' })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Редагувати' })).not.toBeInTheDocument();
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

    it('should disable publish and menu buttons when disabled prop is true', () => {
      render(<HeaderRightActions mode="edit" disabled={true} onPublish={mockOnPublish} onMenuOpen={mockOnMenuOpen} />);

      expect(screen.getByRole('button', { name: 'Опублікувати' })).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Відкрити меню параметрів' })).toBeDisabled();
    });

    it('should hide only the publish button when showPublish is false', () => {
      render(<HeaderRightActions mode="edit" showPublish={false} onMenuOpen={mockOnMenuOpen} />);

      expect(screen.queryByRole('button', { name: 'Опублікувати' })).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Відкрити меню параметрів' })).toBeInTheDocument();
    });
  });

  describe('Mode: "seo"', () => {
    describe('when isPageSeo (pages)', () => {
      it('should render cancel and save buttons', () => {
        render(<HeaderRightActions mode="seo" isPageSeo onCancel={jest.fn()} onPublish={jest.fn()} />);

        expect(screen.getByRole('button', { name: 'Скасувати' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Зберегти' })).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Відкрити меню параметрів' })).not.toBeInTheDocument();
      });

      it('should trigger onCancel and onPublish correctly', () => {
        const mockOnCancel = jest.fn();
        const mockOnPublish = jest.fn();

        render(<HeaderRightActions mode="seo" isPageSeo onCancel={mockOnCancel} onPublish={mockOnPublish} />);

        fireEvent.click(screen.getByRole('button', { name: 'Скасувати' }));
        expect(mockOnCancel).toHaveBeenCalledTimes(1);

        fireEvent.click(screen.getByRole('button', { name: 'Зберегти' }));
        expect(mockOnPublish).toHaveBeenCalledTimes(1);
      });

      it('should disable save and cancel buttons when disabled prop is true', () => {
        render(<HeaderRightActions mode="seo" isPageSeo disabled onCancel={jest.fn()} onPublish={jest.fn()} />);

        expect(screen.getByRole('button', { name: 'Зберегти' })).toBeDisabled();
        expect(screen.getByRole('button', { name: 'Скасувати' })).toBeDisabled();
      });
    });

    describe('when publication seo', () => {
      it('should render cancel, publish, and menu buttons', () => {
        render(<HeaderRightActions mode="seo" onCancel={jest.fn()} onPublish={jest.fn()} onMenuOpen={jest.fn()} />);

        expect(screen.getByRole('button', { name: 'Скасувати' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Опублікувати' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Відкрити меню параметрів' })).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Зберегти' })).not.toBeInTheDocument();
      });

      it('should trigger onCancel, onPublish, and onMenuOpen correctly', () => {
        const mockOnCancel = jest.fn();
        const mockOnPublish = jest.fn();
        const mockOnMenuOpen = jest.fn();

        render(
          <HeaderRightActions
            mode="seo"
            onCancel={mockOnCancel}
            onPublish={mockOnPublish}
            onMenuOpen={mockOnMenuOpen}
          />
        );

        fireEvent.click(screen.getByRole('button', { name: 'Скасувати' }));
        expect(mockOnCancel).toHaveBeenCalledTimes(1);

        fireEvent.click(screen.getByRole('button', { name: 'Опублікувати' }));
        expect(mockOnPublish).toHaveBeenCalledTimes(1);

        fireEvent.click(screen.getByRole('button', { name: 'Відкрити меню параметрів' }));
        expect(mockOnMenuOpen).toHaveBeenCalledTimes(1);
      });
    });

    describe('when media edit without cancel', () => {
      it('should render publish and menu buttons only', () => {
        render(<HeaderRightActions mode="seo" onPublish={jest.fn()} onMenuOpen={jest.fn()} />);

        expect(screen.getByRole('button', { name: 'Опублікувати' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Відкрити меню параметрів' })).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Скасувати' })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Зберегти' })).not.toBeInTheDocument();
      });

      it('should trigger onPublish and onMenuOpen correctly', () => {
        render(<HeaderRightActions mode="seo" onPublish={mockOnPublish} onMenuOpen={mockOnMenuOpen} />);

        fireEvent.click(screen.getByRole('button', { name: 'Опублікувати' }));
        expect(mockOnPublish).toHaveBeenCalledTimes(1);

        fireEvent.click(screen.getByRole('button', { name: 'Відкрити меню параметрів' }));
        expect(mockOnMenuOpen).toHaveBeenCalledTimes(1);
      });
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
