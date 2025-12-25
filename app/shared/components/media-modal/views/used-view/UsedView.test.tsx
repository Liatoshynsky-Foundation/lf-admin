import { render, screen } from '@testing-library/react';

import { UsedView } from './UsedView';

jest.mock('../MediaPickList', () => ({
  MediaPickList: ({ items, testIdPrefix }: any) => (
    <div data-testid="MediaPickList">
      {items.map((item: any) => (
        <div key={item.id} data-testid={`${testIdPrefix}-${item.id}`}>
          {item.fileName}
        </div>
      ))}
    </div>
  )
}));

describe('UsedView', () => {
  const mockOnPick = jest.fn();

  beforeEach(() => {
    mockOnPick.mockClear();
  });

  it('should render used view component', () => {
    render(<UsedView selected={null} onPick={mockOnPick} />);

    expect(screen.getByTestId('UsedView')).toBeInTheDocument();
  });

  it('should render MediaPickList', () => {
    render(<UsedView selected={null} onPick={mockOnPick} />);

    expect(screen.getByTestId('MediaPickList')).toBeInTheDocument();
  });

  it('should render demo items', () => {
    render(<UsedView selected={null} onPick={mockOnPick} />);

    expect(screen.getByTestId('UsedView-item-used-1-uk')).toBeInTheDocument();
    expect(screen.getByTestId('UsedView-item-used-1-en')).toBeInTheDocument();
  });

  it('should pass selected item to MediaPickList', () => {
    const selected = {
      kind: 'used' as const,
      id: 'used-1-uk',
      fileName: 'test.png',
      src: '/test.png',
      locale: 'uk' as const
    };
    render(<UsedView selected={selected} onPick={mockOnPick} />);

    expect(screen.getByTestId('UsedView')).toBeInTheDocument();
  });
});
