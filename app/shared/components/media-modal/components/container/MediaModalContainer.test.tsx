import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode, SVGProps } from 'react';

import { MediaModalContainer } from './MediaModalContainer';

jest.mock('~/public/icons/close.svg', () => ({
  __esModule: true,
  default: (props: SVGProps<SVGSVGElement>) => <svg {...props} />
}));

jest.mock('@mui/material', () => {
  const actual = jest.requireActual('@mui/material') as Record<string, unknown>;

  type DialogProps = {
    open: boolean;
    children: ReactNode;
    onClose?: (event: unknown, reason: 'backdropClick' | 'escapeKeyDown') => void;
    dataTestId?: string;
  };

  return {
    ...actual,
    Dialog: ({ open, children, onClose, dataTestId }: DialogProps) => {
      if (!open) return null;
      return (
        <div data-testid="Dialog" data-custom-id={dataTestId}>
          <button data-testid="mock-backdrop" onClick={(e) => onClose?.(e, 'backdropClick')}>
            Click Backdrop
          </button>
          <button data-testid="mock-escape" onClick={(e) => onClose?.(e, 'escapeKeyDown')}>
            Press Escape
          </button>
          {children}
        </div>
      );
    }
  };
});

describe('MediaModalContainer', () => {
  it('should render header slots and body', () => {
    render(
      <MediaModalContainer
        open
        onClose={() => {}}
        dataTestId="MediaModal"
        headerLeft={<div data-testid="left" />}
        headerCenter={<div data-testid="center" />}
        headerRight={<div data-testid="right" />}
      >
        <div data-testid="body" />
      </MediaModalContainer>
    );

    expect(screen.getByTestId('Dialog')).toBeInTheDocument();
    expect(screen.getByTestId('MediaModal-headerLeft')).toContainElement(screen.getByTestId('left'));
    expect(screen.getByTestId('MediaModal-headerCenter')).toContainElement(screen.getByTestId('center'));
    expect(screen.getByTestId('MediaModal-headerRight')).toContainElement(screen.getByTestId('right'));
    expect(screen.getByTestId('MediaModal-body')).toContainElement(screen.getByTestId('body'));
    expect(screen.getByTestId('MediaModal-closeButton')).toBeInTheDocument();
  });

  it('should use default dataTestId when not provided', () => {
    render(
      <MediaModalContainer open onClose={() => {}}>
        <div />
      </MediaModalContainer>
    );

    expect(screen.getByTestId('MediaModalContainer-header')).toBeInTheDocument();
  });

  it('should not render footer when footer slots are missing', () => {
    render(
      <MediaModalContainer open onClose={() => {}} dataTestId="MediaModal">
        <div />
      </MediaModalContainer>
    );

    expect(screen.queryByTestId('MediaModal-footer')).not.toBeInTheDocument();
  });

  it('should render full footer including top, left and right slots', () => {
    render(
      <MediaModalContainer
        open
        onClose={() => {}}
        dataTestId="MediaModal"
        footerTop={<div data-testid="ft" />}
        footerLeft={<div data-testid="fl" />}
        footerRight={<div data-testid="fr" />}
      >
        <div />
      </MediaModalContainer>
    );

    expect(screen.getByTestId('MediaModal-footer')).toBeInTheDocument();
    expect(screen.getByTestId('MediaModal-footerTop')).toContainElement(screen.getByTestId('ft'));
    expect(screen.getByTestId('MediaModal-footerLeft')).toContainElement(screen.getByTestId('fl'));
    expect(screen.getByTestId('MediaModal-footerRight')).toContainElement(screen.getByTestId('fr'));
  });

  it('should call onClose when close button is clicked', async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();

    render(
      <MediaModalContainer open onClose={onClose} dataTestId="MediaModal">
        <div />
      </MediaModalContainer>
    );

    await user.click(screen.getByTestId('MediaModal-closeButton'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should ignore onClose event if the reason is backdropClick', async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();

    render(
      <MediaModalContainer open onClose={onClose} dataTestId="MediaModal">
        <div />
      </MediaModalContainer>
    );

    await user.click(screen.getByTestId('mock-backdrop'));
    expect(onClose).not.toHaveBeenCalled();
  });

  it('should call onClose event if the reason is escapeKeyDown', async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();

    render(
      <MediaModalContainer open onClose={onClose} dataTestId="MediaModal">
        <div />
      </MediaModalContainer>
    );

    await user.click(screen.getByTestId('mock-escape'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should render only footerTop when provided alone', () => {
    render(
      <MediaModalContainer open onClose={() => {}} dataTestId="MediaModal" footerTop={<div data-testid="ft" />}>
        <div />
      </MediaModalContainer>
    );

    expect(screen.getByTestId('MediaModal-footerTop')).toBeInTheDocument();
    expect(screen.getByTestId('MediaModal-footerLeft')).toBeInTheDocument();
    expect(screen.queryByTestId('MediaModal-footerRight')).toBeEmptyDOMElement();
  });

  it('should render only footerLeft when provided alone', () => {
    render(
      <MediaModalContainer open onClose={() => {}} dataTestId="MediaModal" footerLeft={<div data-testid="fl" />}>
        <div />
      </MediaModalContainer>
    );

    expect(screen.queryByTestId('MediaModal-footerTop')).not.toBeInTheDocument();
    expect(screen.getByTestId('MediaModal-footerLeft')).toContainElement(screen.getByTestId('fl'));
    expect(screen.queryByTestId('MediaModal-footerRight')).toBeEmptyDOMElement();
  });

  it('should render only footerRight when provided alone', () => {
    render(
      <MediaModalContainer open onClose={() => {}} dataTestId="MediaModal" footerRight={<div data-testid="fr" />}>
        <div />
      </MediaModalContainer>
    );

    expect(screen.queryByTestId('MediaModal-footerTop')).not.toBeInTheDocument();
    expect(screen.getByTestId('MediaModal-footerLeft')).toBeInTheDocument();
    expect(screen.getByTestId('MediaModal-footerRight')).toContainElement(screen.getByTestId('fr'));
  });
});
