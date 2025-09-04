import { act, fireEvent, render, screen } from '@testing-library/react';

import DiscardModalProvider from './DiscardModalProvider';

jest.mock('~/store', () => ({
  useStore: () => ({
    __esModule: true,
    default: jest.fn((selector) => selector({ isChanged: true, blocks: { page1: { block1: {} } } }))
  })
}));

const confirmNavigation = jest.fn();
const cancelNavigation = jest.fn();

jest.mock('~/shared/hooks/use-stay-page/useStayPage', () => ({
  useStayPage: () => ({
    pendingPath: '/new-path',
    confirmNavigation,
    cancelNavigation
  })
}));

let beforeRouteChangeCb: any = null;
jest.mock('~/shared/hooks/use-before-route-change/useBeforeRouteChange', () => ({
  useBeforeRouteChange: (cb: any) => {
    beforeRouteChangeCb = cb;
  }
}));

jest.mock('~/shared/components/design-system/discard-changes-modal/DiscardChangesModal', () => ({
  __esModule: true,
  default: ({ open, handleClose, handleSubmit }: any) =>
    open ? (
      <div>
        <button onClick={handleClose}>Cancel</button>
        <button onClick={handleSubmit}>Confirm</button>
      </div>
    ) : null
}));

describe('DiscardModalProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    beforeRouteChangeCb = null;
  });

  it('should render children', () => {
    render(
      <DiscardModalProvider>
        <div data-testid="child">Hello</div>
      </DiscardModalProvider>
    );

    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('should open modal when pendingPath exists and route change occurs', () => {
    render(
      <DiscardModalProvider>
        <div>child</div>
      </DiscardModalProvider>
    );
    expect(screen.queryByText('Cancel')).not.toBeInTheDocument();
    act(() => {
      beforeRouteChangeCb();
    });

    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Confirm')).toBeInTheDocument();
  });

  it('should call cancelNavigation when cancel is clicked', () => {
    render(
      <DiscardModalProvider>
        <div>child</div>
      </DiscardModalProvider>
    );
    act(() => {
      beforeRouteChangeCb();
    });
    fireEvent.click(screen.getByText('Cancel'));

    expect(cancelNavigation).toHaveBeenCalled();
    expect(screen.queryByText('Cancel')).not.toBeInTheDocument();
  });

  it('should call confirmNavigation when confirm is clicked', () => {
    render(
      <DiscardModalProvider>
        <div>child</div>
      </DiscardModalProvider>
    );
    act(() => {
      beforeRouteChangeCb();
    });
    fireEvent.click(screen.getByText('Confirm'));

    expect(confirmNavigation).toHaveBeenCalled();
    expect(screen.queryByText('Confirm')).not.toBeInTheDocument();
  });
});
