import { render, screen } from '@testing-library/react';

import { ControlPanel } from './ControlPanel';

describe('ControlPanel', () => {
  it('renders left and right content', () => {
    render(
      <ControlPanel
        leftContent={<div data-testid="left-content">left</div>}
        rightContent={<div data-testid="right-content">right</div>}
      />
    );

    expect(screen.getByTestId('ControlPanel')).toBeInTheDocument();
    expect(screen.getByTestId('left-content')).toBeInTheDocument();
    expect(screen.getByTestId('right-content')).toBeInTheDocument();
  });

  it('supports custom data-testid', () => {
    render(<ControlPanel dataTestId="CustomControlPanel" />);

    expect(screen.getByTestId('CustomControlPanel')).toBeInTheDocument();
  });
});
