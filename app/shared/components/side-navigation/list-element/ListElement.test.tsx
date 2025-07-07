import { fireEvent, render, screen } from '@testing-library/react';

import { ListElement } from './ListElement';

jest.mock('next/navigation', () => ({
  usePathname: () => '/test'
}));
describe('List Element', () => {
  const element = { title: 'TestTitle', iconSrc: 'icon.svg', href: '/test' };

  it('should render the element', () => {
    render(<ListElement element={element} open />);
    expect(screen.getByText('TestTitle')).toBeInTheDocument();
    expect(screen.getByAltText('TestTitle')).toBeInTheDocument();
  });

  it('should render the element without the icon', () => {
    const testElement = { ...element, iconSrc: undefined };
    render(<ListElement element={testElement} open />);
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });
  it('should work with handleClick', () => {
    const mockClick = jest.fn();
    render(<ListElement element={element} open handleClick={mockClick} />);
    fireEvent.click(screen.getByRole('button'));
    expect(mockClick).toHaveBeenCalled();
  });
  it('should be selected if the path matches', () => {
    render(<ListElement element={element} open={true} />);
    expect(screen.getByRole('button')).toHaveClass('Mui-selected');
  });
  it('should render children', () => {
    render(
      <ListElement element={element} open={true}>
        <div>TestChildren</div>
      </ListElement>
    );
    expect(screen.getByText('TestChildren')).toBeInTheDocument();
  });
});
