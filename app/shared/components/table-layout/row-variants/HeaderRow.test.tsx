import { render, screen } from '@testing-library/react';
import React from 'react';

import { HeaderRow } from './HeaderRow';

describe('HeaderRow Component', () => {
  const mockColumns = [
    { id: 'col-1', headerLabel: 'First Name', width: '120px' },
    { id: 'col-2', headerLabel: 'Last Name', width: '1fr' },
    { id: 'col-3', headerLabel: 'Status', width: '80px' }
  ];
  const mockGridTemplate = `${mockColumns.map((col) => col.width).join(' ')}`;

  it('should render all column header labels', () => {
    render(<HeaderRow columns={mockColumns} gridTemplate={mockGridTemplate} />);

    expect(screen.getByText('First Name')).toBeInTheDocument();
    expect(screen.getByText('Last Name')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
  });

  it('should apply the provided grid template without expand gutter by default', () => {
    render(<HeaderRow columns={mockColumns} gridTemplate={mockGridTemplate} />);

    const headerRoot = screen.getByText('First Name').parentElement;
    expect(headerRoot).toBeInTheDocument();

    if (headerRoot) {
      const computedStyle = globalThis.getComputedStyle(headerRoot);

      expect(computedStyle.display).toBe('grid');
      expect(computedStyle.gridTemplateColumns).toContain(mockColumns[0].width);
      expect(computedStyle.gridTemplateColumns).toContain(mockColumns[1].width);
      expect(computedStyle.gridTemplateColumns).toContain(mockColumns[2].width);
      expect(computedStyle.gridTemplateColumns).not.toContain('26px');
    }
  });

  it('should widen the first column when includeExpandGutter is true', () => {
    render(<HeaderRow columns={mockColumns} gridTemplate={mockGridTemplate} includeExpandGutter />);

    const headerRoot = screen.getByText('First Name').parentElement;
    expect(headerRoot).toBeInTheDocument();

    if (headerRoot) {
      const computedStyle = globalThis.getComputedStyle(headerRoot);

      expect(computedStyle.gridTemplateColumns).toContain('26px');
      expect(computedStyle.gridTemplateColumns).toContain(mockColumns[0].width);
    }
  });

  it('should handle spaces inside minmax columns', () => {
    const columns = [
      { id: 'description', headerLabel: 'Description', width: 'minmax(300px, 1fr)' },
      { id: 'year', headerLabel: 'Year', width: '120px' }
    ];

    render(<HeaderRow columns={columns} gridTemplate="minmax(300px, 1fr) 120px" />);

    const headerRoot = screen.getByText('Description').parentElement;
    expect(headerRoot).toBeInTheDocument();

    if (headerRoot) {
      expect(globalThis.getComputedStyle(headerRoot).gridTemplateColumns).toContain('minmax(300px, 1fr)');
    }
  });

  it('should handle an empty columns array gracefully without crashing', () => {
    const { container } = render(<HeaderRow columns={[]} gridTemplate="" />);

    expect(container.firstChild).toBeInTheDocument();
  });
});
