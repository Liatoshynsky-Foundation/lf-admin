import { fireEvent,render, screen } from '@testing-library/react';
import { MouseEvent } from 'react';

import DividedHeader from './DividedHeader';
import type { HeaderRightActionsProps } from './header-right-actions/HeaderRightActions';

const mockPush = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

jest.mock('lucide-react', () => ({
  ChevronLeft: () => <span data-testid="icon-chevron-left" />
}));

jest.mock('./header-right-actions/HeaderRightActions', () => {
  return function MockHeaderRightActions(props: HeaderRightActionsProps) {
    return (
      <div data-testid="mock-header-right-actions">
        <span data-testid="passed-mode">{props.mode}</span>
        
        <button aria-label="Trigger Edit" onClick={props.onEdit}>Edit</button>
        <button aria-label="Trigger Publish" onClick={props.onPublish}>Publish</button>
        <button aria-label="Trigger Save" onClick={props.onSave}>Save</button>
        <button aria-label="Trigger Cancel" onClick={props.onCancel}>Cancel</button>
        <button 
          aria-label="Trigger Menu" 
          onClick={(e: MouseEvent<HTMLButtonElement>) => props.onMenuOpen?.(e)}
        >
          Menu
        </button>
      </div>
    );
  };
});

describe('DividedHeader Component', () => {

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('1. Visuals and Children Rendering', () => {
    it('should render the children passed into it', () => {
      render(
        <DividedHeader mode="create">
          <div data-testid="custom-child">My Custom Title</div>
        </DividedHeader>
      );

      expect(screen.getByTestId('custom-child')).toBeInTheDocument();
      expect(screen.getByText('My Custom Title')).toBeInTheDocument();
    });

    it('should render the return button icon', () => {
      render(<DividedHeader mode="create" />);
      expect(screen.getByTestId('icon-chevron-left')).toBeInTheDocument();
    });
  });

  describe('2. Routing Logic (The Return Button)', () => {
    it('should navigate to the default originUrl ("/") when no prop is provided', () => {
      render(<DividedHeader mode="create" />);

      const returnBtn = screen.getByRole('button', { name: 'Повернутись на сторінку /' });
      fireEvent.click(returnBtn);

      expect(mockPush).toHaveBeenCalledTimes(1);
      expect(mockPush).toHaveBeenCalledWith('/');
    });

    it('should navigate to a custom originUrl when provided', () => {
      render(<DividedHeader mode="create" originUrl="/admin/publications" />);

      const returnBtn = screen.getByRole('button', { name: 'Повернутись на сторінку /admin/publications' });
      fireEvent.click(returnBtn);

      expect(mockPush).toHaveBeenCalledTimes(1);
      expect(mockPush).toHaveBeenCalledWith('/admin/publications');
    });
  });

  describe('3. Prop Drilling to HeaderRightActions', () => {
    it('should pass the correct mode down to the child component', () => {
      render(<DividedHeader mode="seo" />);
      expect(screen.getByTestId('passed-mode')).toHaveTextContent('seo');
    });

    it('should pass all callback functions down to HeaderRightActions', () => {
      const mockOnEdit = jest.fn();
      const mockOnPublish = jest.fn();
      const mockOnSave = jest.fn();
      const mockOnCancel = jest.fn();
      const mockOnRightMenuOpen = jest.fn();

      render(
        <DividedHeader 
          mode="edit"
          onEdit={mockOnEdit}
          onPublish={mockOnPublish}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
          onRightMenuOpen={mockOnRightMenuOpen}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: 'Trigger Edit' }));
      fireEvent.click(screen.getByRole('button', { name: 'Trigger Publish' }));
      fireEvent.click(screen.getByRole('button', { name: 'Trigger Save' }));
      fireEvent.click(screen.getByRole('button', { name: 'Trigger Cancel' }));
      fireEvent.click(screen.getByRole('button', { name: 'Trigger Menu' }));

      expect(mockOnEdit).toHaveBeenCalledTimes(1);
      expect(mockOnPublish).toHaveBeenCalledTimes(1);
      expect(mockOnSave).toHaveBeenCalledTimes(1);
      expect(mockOnCancel).toHaveBeenCalledTimes(1);
      expect(mockOnRightMenuOpen).toHaveBeenCalledTimes(1);
    });
  });
});
