import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { UploadView } from './UploadView';

jest.mock('~/shared/components/design-system/button/Button', () => ({
  __esModule: true,
  default: ({ label, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>
      {label}
    </button>
  )
}));

describe('UploadView', () => {
  const mockOnPick = jest.fn();

  beforeEach(() => {
    mockOnPick.mockClear();
  });

  it('should render upload view component', () => {
    render(<UploadView selected={null} onPick={mockOnPick} />);

    expect(screen.getByTestId('UploadView')).toBeInTheDocument();
  });

  it('should render choose file button', () => {
    render(<UploadView selected={null} onPick={mockOnPick} />);

    expect(screen.getByText('Обрати файл')).toBeInTheDocument();
  });

  it('should render hidden file input', () => {
    render(<UploadView selected={null} onPick={mockOnPick} />);

    const input = screen.getByTestId('UploadView-fileInput');
    expect(input).toHaveAttribute('type', 'file');
    expect(input).toHaveAttribute('accept', 'image/*');
  });

  it('should trigger file input click when button clicked', async () => {
    const user = userEvent.setup();
    render(<UploadView selected={null} onPick={mockOnPick} />);

    const button = screen.getByTestId('UploadView-chooseFileButton');
    const input = screen.getByTestId('UploadView-fileInput') as HTMLInputElement;

    const clickSpy = jest.spyOn(input, 'click');
    await user.click(button);

    expect(clickSpy).toHaveBeenCalled();
  });

  it('should call onPick when file selected', async () => {
    const user = userEvent.setup();
    render(<UploadView selected={null} onPick={mockOnPick} />);

    const input = screen.getByTestId('UploadView-fileInput') as HTMLInputElement;
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

    await user.upload(input, file);

    expect(mockOnPick).toHaveBeenCalledWith(
      expect.objectContaining({
        kind: 'upload',
        fileName: 'test.jpg',
        file
      })
    );
  });
});
