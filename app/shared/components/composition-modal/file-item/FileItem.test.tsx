import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

import FileItem from './FileItem';
import { COMPOSITION_FILE_TYPES, CompositionFileType } from '~/constants/creativity';
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, width, height }: { src: string; alt: string; width: number; height: number }) => (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img src={src} alt={alt} data-testid="file-icon" width={width} height={height} />
  )
}));

jest.mock('~/constants/files', () => ({
  FILE_TYPES: {
    pdf: 'pdf-icon-file',
    audio: 'audio-icon-file'
  }
}));

describe('FileItem', () => {
  const MOCK_FILE_NAME = 'project-specification.pdf';
  const MOCK_FILE_TYPE: CompositionFileType = 'pdf';
  let onDeleteMock: jest.Mock;

  beforeEach(() => {
    onDeleteMock = jest.fn();
  });

  const renderComponent = (overrides = {}) => {
    return render(
      <FileItem fileName={MOCK_FILE_NAME} fileType={MOCK_FILE_TYPE} onDelete={onDeleteMock} {...overrides} />
    );
  };

  it('should render the filename and dynamic asset icon matching the file type config paths', () => {
    renderComponent();

    expect(screen.getByText(MOCK_FILE_NAME)).toBeInTheDocument();

    const iconElement = screen.getByTestId('file-icon') as HTMLImageElement;
    expect(iconElement).toBeInTheDocument();
    expect(iconElement.src).toContain(`/icons/${COMPOSITION_FILE_TYPES[MOCK_FILE_TYPE]}.svg`);
    expect(iconElement.alt).toBe(`${MOCK_FILE_TYPE} file icon`);
  });

  it('should pass correct dimension parameters to the underlying layout icon component', () => {
    renderComponent();

    const iconElement = screen.getByTestId('file-icon');
    expect(iconElement).toHaveAttribute('width', '21');
    expect(iconElement).toHaveAttribute('height', '21');
  });

  it('should dispatch the onDelete callback exactly once when the remove target button is triggered', () => {
    renderComponent();

    const deleteButton = screen.getByRole('button', { name: 'delete file' });
    fireEvent.click(deleteButton);

    expect(onDeleteMock).toHaveBeenCalledTimes(1);
  });

  it('should use fallback icon when file type is not found in configuration maps', () => {
    renderComponent({ fileType: 'unknown-type' as CompositionFileType });

    const iconElement = screen.getByTestId('file-icon') as HTMLImageElement;
    expect(iconElement.src).toContain('/icons/file-text.svg');
  });
});
