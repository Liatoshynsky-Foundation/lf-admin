import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReactNode, SVGProps } from 'react';

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
  } & Record<string, unknown>;

  return {
    ...actual,
    Dialog: ({ open, children, ...rest }: DialogProps) => (open ? <div {...rest}>{children}</div> : null)
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

    expect(screen.getByTestId('MediaModal-headerLeft')).toContainElement(screen.getByTestId('left'));
    expect(screen.getByTestId('MediaModal-headerCenter')).toContainElement(screen.getByTestId('center'));
    expect(screen.getByTestId('MediaModal-headerRight')).toContainElement(screen.getByTestId('right'));
    expect(screen.getByTestId('MediaModal-body')).toContainElement(screen.getByTestId('body'));
    expect(screen.getByTestId('MediaModal-closeButton')).toBeInTheDocument();
  });

  it('should not render footer when footer props are missing', () => {
    render(
      <MediaModalContainer open onClose={() => {}} dataTestId="MediaModal">
        <div />
      </MediaModalContainer>
    );

    expect(screen.queryByTestId('MediaModal-footer')).not.toBeInTheDocument();
  });

  it('should render footer when any footer slot is provided', () => {
    render(
      <MediaModalContainer open onClose={() => {}} dataTestId="MediaModal" footerRight={<div data-testid="fr" />}>
        <div />
      </MediaModalContainer>
    );

    expect(screen.getByTestId('MediaModal-footer')).toBeInTheDocument();
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
});
