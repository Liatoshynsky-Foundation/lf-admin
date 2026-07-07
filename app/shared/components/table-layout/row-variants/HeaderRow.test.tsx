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

  it('should apply the provided grid template and column configurations to the root box', () => {
    render(<HeaderRow columns={mockColumns} gridTemplate={mockGridTemplate} />);

    const headerRoot = screen.getByText('First Name').parentElement;
    expect(headerRoot).toBeInTheDocument();

    if (headerRoot) {
      const computedStyle = globalThis.getComputedStyle(headerRoot);

      expect(computedStyle.display).toBe('grid');

      expect(computedStyle.gridTemplateColumns).toContain(mockColumns[0].width);
      expect(computedStyle.gridTemplateColumns).toContain(mockColumns[1].width);
      expect(computedStyle.gridTemplateColumns).toContain(mockColumns[2].width);
    }
  });

  it('should handle an empty columns array gracefully without crashing', () => {
    const { container } = render(<HeaderRow columns={[]} gridTemplate="" />);

    expect(container.firstChild).toBeInTheDocument();
  });
});
