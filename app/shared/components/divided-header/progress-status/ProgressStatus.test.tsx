import { render, screen } from '@testing-library/react';

import ProgressStatus from './ProgressStatus';

jest.mock('lucide-react', () => ({
  CircleCheck: () => <span data-testid="icon-circle-check" />,
  RefreshCcwDot: () => <span data-testid="icon-refresh" />
}));

jest.mock('./ProgressStatus.styles', () => ({
  styles: {
    blinkThenFade: 'mockBlinkThenFade',
    blinkStay: 'mockBlinkStay'
  }
}));

describe('ProgressStatus Component', () => {
  it('should default to the "saved" state when no props are passed', () => {
    render(<ProgressStatus />);

    const textElement = screen.getByText('Зміни збережено');
    expect(textElement).toBeInTheDocument();

    expect(screen.getByTestId('icon-circle-check')).toBeInTheDocument();

    expect(screen.queryByTestId('icon-refresh')).not.toBeInTheDocument();

    expect(textElement).toHaveStyle({ opacity: '0' });
  });

  it('should render the "saved" state correctly when isSaved is true', () => {
    render(<ProgressStatus isSaved={true} />);

    const textElement = screen.getByText('Зміни збережено');
    expect(textElement).toBeInTheDocument();

    expect(screen.getByTestId('icon-circle-check')).toBeInTheDocument();

    expect(textElement).toHaveStyle({ opacity: '0' });
    expect(textElement).toHaveStyle({ animation: 'mockBlinkThenFade 4s ease forwards' });
  });

  it('should render the "editing" state correctly when isSaved is false', () => {
    render(<ProgressStatus isSaved={false} />);

    const textElement = screen.getByText('Редагування');
    expect(textElement).toBeInTheDocument();

    expect(screen.getByTestId('icon-refresh')).toBeInTheDocument();

    expect(screen.queryByTestId('icon-circle-check')).not.toBeInTheDocument();

    expect(textElement).toHaveStyle({ opacity: '1' });
    expect(textElement).toHaveStyle({ animation: 'mockBlinkStay 0.4s ease' });
  });

  it('should update the UI when the isSaved prop changes', () => {
    const { rerender } = render(<ProgressStatus isSaved={false} />);

    expect(screen.getByText('Редагування')).toBeInTheDocument();
    expect(screen.getByTestId('icon-refresh')).toBeInTheDocument();

    rerender(<ProgressStatus isSaved={true} />);

    expect(screen.getByText('Зміни збережено')).toBeInTheDocument();
    expect(screen.getByTestId('icon-circle-check')).toBeInTheDocument();

    expect(screen.queryByText('Редагування')).not.toBeInTheDocument();
    expect(screen.queryByTestId('icon-refresh')).not.toBeInTheDocument();
  });
});
