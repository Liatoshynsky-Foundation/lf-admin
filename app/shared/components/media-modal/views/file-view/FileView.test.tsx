import { render, screen } from '@testing-library/react';
import React from 'react';

import { FileView } from './FileView';

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    return <img {...props} />;
  }
}));

const createFile = (name: string, type: string) => new File(['dummy content'], name, { type });

describe('FileView', () => {
  it('should render file name correctly', () => {
    const file = createFile('document.pdf', 'application/pdf');
    render(<FileView file={file} />);

    expect(screen.getByText('document.pdf')).toBeInTheDocument();
  });

  it('should display PDF icon for pdf files', () => {
    const file = createFile('test.pdf', 'application/pdf');
    render(<FileView file={file} />);

    const img = screen.getByAltText('pdf icon');
    expect(img).toHaveAttribute('src', '/icons/pdf.svg');
  });

  it('should display XLS icon for spreadsheet files', () => {
    const file = createFile('budget.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    render(<FileView file={file} />);

    const img = screen.getByAltText('xls icon');
    expect(img).toHaveAttribute('src', '/icons/xls.svg');
  });

  it('should display AUDIO icon for mp3 files', () => {
    const file = createFile('song.mp3', 'audio/mpeg');
    render(<FileView file={file} />);

    const img = screen.getByAltText('audio icon');
    expect(img).toHaveAttribute('src', '/icons/audio.svg');
  });

  it('should display ZIP icon for archives', () => {
    const file = createFile('archive.zip', 'application/zip');
    render(<FileView file={file} />);

    const img = screen.getByAltText('zip icon');
    expect(img).toHaveAttribute('src', '/icons/zip.svg');
  });

  it('should display default DOC icon for unknown file types', () => {
    const file = createFile('unknown.txt', 'text/plain');
    render(<FileView file={file} />);

    const img = screen.getByAltText('doc icon');
    expect(img).toHaveAttribute('src', '/icons/doc.svg');
  });

  it('should correctly identify file type by extension if MIME type is missing', () => {
    const file = createFile('manual.pdf', '');
    render(<FileView file={file} />);

    const img = screen.getByAltText('pdf icon');
    expect(img).toHaveAttribute('src', '/icons/pdf.svg');
  });
});
