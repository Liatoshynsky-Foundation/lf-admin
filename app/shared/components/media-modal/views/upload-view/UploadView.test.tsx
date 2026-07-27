import { fireEvent, render, screen } from '@testing-library/react';
import type { MouseEventHandler, SVGProps } from 'react';

import { UploadView } from './UploadView';

jest.mock('~/public/icons/cloud-upload.svg', () => ({
  __esModule: true,
  default: (props: SVGProps<SVGSVGElement>) => <svg {...props} />
}));

jest.mock('~/shared/components/design-system/button/Button', () => ({
  __esModule: true,
  default: (props: { label?: string; onClick?: MouseEventHandler<HTMLButtonElement>; 'data-testid'?: string }) => (
    <button type="button" onClick={props.onClick} data-testid={props['data-testid']}>
      {props.label}
    </button>
  )
}));

const renderView = (overrides?: Partial<React.ComponentProps<typeof UploadView>>) => {
  const props: React.ComponentProps<typeof UploadView> = {
    selected: null,
    onPick: jest.fn(),
    ...overrides
  };

  render(<UploadView {...props} />);
  return props;
};

const createFile = (name: string, type: string) => new File(['dummy'], name, { type });

const createSizedFile = (name: string, type: string, size: number): File => {
  const file = createFile(name, type);
  Object.defineProperty(file, 'size', { value: size });

  return file;
};

describe('UploadView', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should render idle state', () => {
    renderView();

    expect(screen.getByTestId('UploadView')).toBeInTheDocument();
    expect(screen.getByTestId('UploadView-dropzone')).toBeInTheDocument();

    const input = screen.getByTestId('UploadView-fileInput');
    expect(input).toHaveAttribute('type', 'file');
    expect(input).toHaveAttribute('accept', 'image/*');

    expect(screen.getByTestId('UploadView-text')).toHaveTextContent(/перетягніть файл сюди або оберіть вручну/i);
  });

  it('should open file picker on choose button click', () => {
    renderView();

    const input = screen.getByTestId('UploadView-fileInput') as HTMLInputElement;
    const clickSpy = jest.spyOn(input, 'click').mockImplementation(() => undefined);

    fireEvent.click(screen.getByTestId('UploadView-chooseFileButton'));

    expect(clickSpy).toHaveBeenCalledTimes(1);
  });

  it('should open file picker on dropzone click', () => {
    renderView();

    const input = screen.getByTestId('UploadView-fileInput') as HTMLInputElement;
    const clickSpy = jest.spyOn(input, 'click').mockImplementation(() => undefined);

    fireEvent.click(screen.getByTestId('UploadView-dropzone'));

    expect(clickSpy).toHaveBeenCalledTimes(1);
  });

  it('should call onPick for image selected via input', () => {
    const onPick = jest.fn();
    renderView({ onPick });

    const input = screen.getByTestId('UploadView-fileInput');
    const file = createFile('test.png', 'image/png');

    fireEvent.change(input, { target: { files: [file] } });

    expect(onPick).toHaveBeenCalledTimes(1);
    expect(onPick).toHaveBeenCalledWith(
      expect.objectContaining({
        kind: 'upload',
        fileName: 'test.png',
        file,
        id: expect.any(String)
      })
    );
  });

  it('should handle empty file selection', () => {
    const onPick = jest.fn();
    renderView({ onPick });

    const input = screen.getByTestId('UploadView-fileInput');
    fireEvent.change(input, { target: { files: [] } });

    expect(onPick).not.toHaveBeenCalled();
  });

  it('should show error and not call onPick for non-image selected via input', () => {
    const onPick = jest.fn();
    renderView({ onPick });

    const input = screen.getByTestId('UploadView-fileInput');
    const file = createFile('doc.pdf', 'application/pdf');

    fireEvent.change(input, { target: { files: [file] } });

    expect(onPick).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent(/підтримуються лише зображення/i);
  });

  it('should call onPick for image file drop', () => {
    const onPick = jest.fn();
    renderView({ onPick });

    const dropzone = screen.getByTestId('UploadView-dropzone');
    const file = createFile('dropped.jpg', 'image/jpeg');

    fireEvent.drop(dropzone, { dataTransfer: { files: [file] } });

    expect(onPick).toHaveBeenCalledTimes(1);
  });

  it('should support keyboard open on Enter and Space', () => {
    renderView();

    const input = screen.getByTestId('UploadView-fileInput') as HTMLInputElement;
    const clickSpy = jest.spyOn(input, 'click').mockImplementation(() => undefined);
    const dropzone = screen.getByTestId('UploadView-dropzone');

    fireEvent.keyDown(dropzone, { key: 'Enter' });
    expect(clickSpy).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(dropzone, { key: ' ' });
    expect(clickSpy).toHaveBeenCalledTimes(2);
  });

  it('should handle drag interactions and set dropEffect', () => {
    renderView();
    const dropzone = screen.getByTestId('UploadView-dropzone');

    fireEvent.dragEnter(dropzone);

    const mockDataTransfer = { dropEffect: '' };
    fireEvent.dragOver(dropzone, {
      dataTransfer: mockDataTransfer
    });
    expect(mockDataTransfer.dropEffect).toBe('copy');

    fireEvent.dragLeave(dropzone, { relatedTarget: null });

    fireEvent.dragLeave(dropzone, { relatedTarget: document.body });

    const child = document.createElement('div');
    dropzone.appendChild(child);
    fireEvent.dragLeave(dropzone, { relatedTarget: child });
  });

  it('should handle drop with no files', () => {
    const onPick = jest.fn();
    renderView({ onPick });
    const dropzone = screen.getByTestId('UploadView-dropzone');

    fireEvent.drop(dropzone, { dataTransfer: { files: [] } });
    expect(onPick).not.toHaveBeenCalled();
  });

  it('should reject a file exceeding maxSizeBytes', () => {
    const onPick = jest.fn();
    renderView({
      onPick,
      isAllowedFile: () => true,
      maxSizeBytes: 100
    });

    const input = screen.getByTestId('UploadView-fileInput');
    const file = createSizedFile('big.pdf', 'application/pdf', 200);

    fireEvent.change(input, { target: { files: [file] } });

    expect(onPick).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('should handle custom validation and accept image by extension', () => {
    const onPick = jest.fn();
    renderView({ onPick });

    const input = screen.getByTestId('UploadView-fileInput');
    const file = createFile('test.png', '');

    fireEvent.change(input, { target: { files: [file] } });

    expect(onPick).toHaveBeenCalledTimes(1);
    expect(onPick.mock.calls[0]?.[0]).toMatchObject({ fileName: 'test.png' });
  });
});
