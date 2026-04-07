import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ListElement } from './ListElement';

let mockedPathname = '/test';

jest.mock('next/navigation', () => ({
  usePathname: () => mockedPathname
}));

describe('List Element', () => {
  const element = { title: 'TestTitle', iconSrc: 'icon.svg', href: '/test' };

  beforeEach(() => {
    mockedPathname = '/test';
  });

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

  it('should be selected for nested routes', () => {
    mockedPathname = '/files/image';

    render(<ListElement element={{ title: 'Файли', iconSrc: 'folder-open', href: '/files' }} open={true} />);

    expect(screen.getByRole('button')).toHaveClass('Mui-selected');
  });

  it('should not be selected for partial prefix matches', () => {
    mockedPathname = '/files-other';

    render(<ListElement element={{ title: 'Файли', iconSrc: 'folder-open', href: '/files' }} open={true} />);

    expect(screen.getByRole('button')).not.toHaveClass('Mui-selected');
  });

  it('should render children', () => {
    render(
      <ListElement element={element} open={true}>
        <div>TestChildren</div>
      </ListElement>
    );
    expect(screen.getByText('TestChildren')).toBeInTheDocument();
  });
  it('should work with default handleClick fallback', async () => {
    const user = userEvent.setup();
    render(<ListElement element={element} open />);
    await user.click(screen.getByRole('button'));
  });
});
