import { fireEvent, render, screen } from '@testing-library/react';

import { DeleteCompositionModal } from './DeleteCompositionModal';
import { OPUS_DELETE_MODAL } from '~/constants/opus';

describe('DeleteCompositionModal', () => {
  const mockProps = {
    open: true,
    onClose: jest.fn(),
    onConfirm: jest.fn(),
    title: 'Тестовий заголовок',
    description: 'Тестовий опис'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render correctly when open', () => {
    render(<DeleteCompositionModal {...mockProps} />);
    expect(screen.getByText('Тестовий заголовок')).toBeInTheDocument();
    expect(screen.getByText('Тестовий опис')).toBeInTheDocument();
  });

  it('should call onConfirm when confirm button is clicked', () => {
    render(<DeleteCompositionModal {...mockProps} />);
    const confirmBtn = screen.getByRole('button', { name: /Видалити/i }); 
    fireEvent.click(confirmBtn);
    expect(mockProps.onConfirm).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when close button is clicked', () => {
    render(<DeleteCompositionModal {...mockProps} />);
    const closeBtn = screen.getByRole('button', { name: /Закрити/i });
    fireEvent.click(closeBtn);
    expect(mockProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('should not render anything when open is false', () => {
    const { container } = render(<DeleteCompositionModal {...mockProps} open={false} />);
    expect(container).toBeEmptyDOMElement();
  });
  
  it('should use default title and description when props are not provided', () => {
    render(
      <DeleteCompositionModal 
        open={true} 
        onClose={jest.fn()} 
        onConfirm={jest.fn()} 
      />
    );

    expect(screen.getByText(OPUS_DELETE_MODAL.title)).toBeInTheDocument();
    expect(screen.getByText(OPUS_DELETE_MODAL.description)).toBeInTheDocument();
  });
});
