import { render, screen } from '@testing-library/react';
import React from 'react';

import { FileView } from './FileView';

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img alt="" {...props} />
}));

const createFile = (name: string, type: string) => new File(['dummy content'], name, { type });

describe('FileView', () => {
  it('should render file name correctly', () => {
    const file = createFile('document.pdf', 'application/pdf');
    render(<FileView file={file} />);
    expect(screen.getByText('document.pdf')).toBeInTheDocument();
  });

  const iconTestCases = [
    { name: 'test.pdf', type: 'application/pdf', icon: 'pdf' },
    { name: 'budget.xlsx', type: 'application/vnd.ms-excel', icon: 'xls' },
    { name: 'song.mp3', type: 'audio/mpeg', icon: 'audio' },
    { name: 'archive.zip', type: 'application/zip', icon: 'zip' },
    { name: 'unknown.txt', type: 'text/plain', icon: 'doc' },
    { name: 'manual.pdf', type: '', icon: 'pdf' }
  ];

  test.each(iconTestCases)('should display $icon icon for $name', ({ name, type, icon }) => {
    const file = createFile(name, type);
    render(<FileView file={file} />);
    const img = screen.getByAltText(`${icon} icon`);
    expect(img).toHaveAttribute('src', `/icons/${icon}.svg`);
  });
});
