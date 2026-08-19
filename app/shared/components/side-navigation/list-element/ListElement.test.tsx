import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ListElement } from './ListElement';

const TEST_PATHS = {
  default: '/test',
  nestedFiles: '/files/image',
  partialFiles: '/files-other',
  unconfiguredOpus: '/creativity/opus'
} as const;

const DEFAULT_ELEMENT = {
  title: 'TestTitle',
  iconSrc: 'icon.svg',
  href: TEST_PATHS.default
} as const;

const FILES_ELEMENT = {
  title: 'Файли',
  iconSrc: 'folder-open',
  href: '/files'
} as const;

const CREATIVITY_ELEMENT = {
  title: 'Твори',
  href: '/creativity'
} as const;

let mockedPathname: string = TEST_PATHS.default;

jest.mock('next/navigation', () => ({
  usePathname: () => mockedPathname
}));

describe('List Element', () => {
  beforeEach(() => {
    mockedPathname = TEST_PATHS.default;
  });

  it('should render the element', () => {
    render(<ListElement element={DEFAULT_ELEMENT} open />);
    expect(screen.getByText(DEFAULT_ELEMENT.title)).toBeInTheDocument();
    expect(screen.getByAltText(DEFAULT_ELEMENT.title)).toBeInTheDocument();
  });

  it('should render the element without the icon', () => {
    const testElement = { ...DEFAULT_ELEMENT, iconSrc: undefined };
    render(<ListElement element={testElement} open />);
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });
  it('should work with handleClick', () => {
    const mockClick = jest.fn();
    render(<ListElement element={DEFAULT_ELEMENT} open handleClick={mockClick} />);
    fireEvent.click(screen.getByRole('button'));
    expect(mockClick).toHaveBeenCalled();
  });
  it('should be selected if the path matches', () => {
    render(<ListElement element={DEFAULT_ELEMENT} open />);
    expect(screen.getByRole('button')).toHaveClass('Mui-selected');
  });

  it('should be selected for nested routes', () => {
    mockedPathname = TEST_PATHS.nestedFiles;

    render(<ListElement element={FILES_ELEMENT} open />);

    expect(screen.getByRole('button')).toHaveClass('Mui-selected');
  });

  it('should not be selected for partial prefix matches', () => {
    mockedPathname = TEST_PATHS.partialFiles;

    render(<ListElement element={FILES_ELEMENT} open />);

    expect(screen.getByRole('button')).not.toHaveClass('Mui-selected');
  });

  it('should select the parent route when the deeper route is not configured', () => {
    mockedPathname = TEST_PATHS.unconfiguredOpus;

    render(<ListElement element={CREATIVITY_ELEMENT} open />);

    expect(screen.getByRole('button')).toHaveClass('Mui-selected');
  });

  it('should render children', () => {
    render(
      <ListElement element={DEFAULT_ELEMENT} open>
        <div>TestChildren</div>
      </ListElement>
    );
    expect(screen.getByText('TestChildren')).toBeInTheDocument();
  });

  it('should work with default handleClick fallback', async () => {
    const user = userEvent.setup();
    render(<ListElement element={DEFAULT_ELEMENT} open />);
    await user.click(screen.getByRole('button'));

    expect(screen.getByRole('button')).toHaveClass('Mui-selected');
  });

  it('should apply disabled styles and accept sxItem as an array', () => {
    const disabledElement = { ...DEFAULT_ELEMENT, disabled: true };
    render(<ListElement element={disabledElement} open sxItem={[{ margin: '10px' }]} />);

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-disabled', 'true');
  });
});
