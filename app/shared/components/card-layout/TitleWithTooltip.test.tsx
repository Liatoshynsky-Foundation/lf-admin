import { act, render, screen, waitFor } from '@testing-library/react';
import React, { ReactNode } from 'react';

import TitleWithTooltip from './TitleWithTooltip';

let triggerResize: () => void = () => {};

globalThis.ResizeObserver = jest.fn().mockImplementation((callback) => {
  triggerResize = callback;
  return {
    observe: jest.fn((element) => {
      if (element) {
        callback();
      }
    }),
    unobserve: jest.fn(),
    disconnect: jest.fn()
  };
});

interface MockTooltipProps {
  title: string;
  children: ReactNode;
}

jest.mock('~/ds-components/tooltip/Tooltip', () => {
  return function MockTooltip({ title, children }: MockTooltipProps) {
    return (
      <div data-testid="tooltip" data-title={title}>
        {children}
      </div>
    );
  };
});

describe('TitleWithTooltip', () => {
  const longText = 'This is a very long text that should be truncated';
  const shortText = 'Short text';

  const mockOffset = (scrollHeight: number, clientHeight: number) => {
    Object.defineProperty(HTMLElement.prototype, 'scrollHeight', {
      configurable: true,
      value: scrollHeight
    });

    Object.defineProperty(HTMLElement.prototype, 'clientHeight', {
      configurable: true,
      value: clientHeight
    });
  };

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders text correctly', () => {
    mockOffset(100, 50);

    render(<TitleWithTooltip text={shortText} />);

    expect(screen.getByText(shortText)).toBeInTheDocument();
  });

  it('shows tooltip when text is truncated', async () => {
    mockOffset(100, 50);

    render(<TitleWithTooltip text={longText} />);

    await waitFor(() => {
      const tooltip = screen.getByTestId('tooltip');
      expect(tooltip).toHaveAttribute('data-title', longText);
    });
  });

  it('does not show tooltip when text is not truncated', async () => {
    mockOffset(50, 100);

    render(<TitleWithTooltip text={shortText} />);

    await waitFor(() => {
      const tooltip = screen.getByTestId('tooltip');
      expect(tooltip).toHaveAttribute('data-title', '');
    });
  });

  it('covers state optimization path when prev state equals hasOverflow', async () => {
    mockOffset(100, 50);
    render(<TitleWithTooltip text={longText} />);

    await act(async () => {
      triggerResize();
    });

    await waitFor(() => {
      const tooltip = screen.getByTestId('tooltip');
      expect(tooltip).toHaveAttribute('data-title', longText);
    });
  });

  it('handles early return in useEffect when element reference is missing', async () => {
    const refObject = { current: document.createElement('h3') };
    jest.spyOn(React, 'useRef').mockReturnValue(refObject);

    const { rerender } = render(<TitleWithTooltip text={shortText} />);

    refObject.current = null as unknown as HTMLHeadingElement;

    await act(async () => {
      rerender(<TitleWithTooltip text="Trigger Effect Reset" />);
    });

    expect(screen.getByTestId('tooltip')).toBeInTheDocument();
  });
});
