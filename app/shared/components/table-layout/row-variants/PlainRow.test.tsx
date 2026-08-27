import { Box } from '@mui/material';
import { render, screen } from '@testing-library/react';
import React from 'react';

import { PlainRow } from './PlainRow';
import { ColumnDef } from './Row.types';

type MockPlainData = { title: string; genre: string };

describe('PlainRow', () => {
  const mockData: MockPlainData = {
    title: 'Musical Masterpiece',
    genre: 'Classical'
  };

  const mockGridTemplate = '1fr 2fr';

  it('should render cells and typography for string content', () => {
    const columns: ColumnDef<unknown, unknown, MockPlainData>[] = [
      {
        id: 'title',
        renderPlain: (d) => d.title
      }
    ];

    render(<PlainRow plainData={mockData} columns={columns} gridTemplate={mockGridTemplate} />);
    expect(screen.getByText(mockData.title)).toBeInTheDocument();
  });

  it('should render custom React nodes directly without Typography', () => {
    const columns: ColumnDef<unknown, unknown, MockPlainData>[] = [
      {
        id: 'title',
        renderPlain: () => <Box data-testid="custom-node">Custom Badge</Box>
      }
    ];

    render(<PlainRow plainData={mockData} columns={columns} gridTemplate={mockGridTemplate} />);

    expect(screen.getByTestId('custom-node')).toBeInTheDocument();
  });

  it('should skip rendering a column if renderPlain is missing', () => {
    const columns: ColumnDef<unknown, unknown, MockPlainData>[] = [
      {
        id: 'group',
        renderGroup: () => 'Group content'
      }
    ];

    const { container } = render(<PlainRow plainData={mockData} columns={columns} gridTemplate={mockGridTemplate} />);

    expect(container.firstChild?.childNodes).toHaveLength(0);
  });

  it('should execute title logic successfully when table has groups', () => {
    const columns: ColumnDef<unknown, unknown, MockPlainData>[] = [
      {
        id: 'opus',
        renderGroup: () => 'op. 1'
      },
      {
        id: 'title',
        renderPlain: (d) => d.title,
        align: 'left'
      }
    ];

    render(<PlainRow plainData={mockData} columns={columns} gridTemplate={mockGridTemplate} />);

    expect(screen.getByText(mockData.title)).toBeInTheDocument();
  });
});