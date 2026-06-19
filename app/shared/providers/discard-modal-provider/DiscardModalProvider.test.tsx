import { fireEvent, render, screen } from '@testing-library/react';

import DiscardModalProvider from './DiscardModalProvider';

const pushMock = jest.fn();
const setPendingNavigation = jest.fn();
const setDiscardModalOpen = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: pushMock
  })
}));

jest.mock('~/store', () => ({
  useStore: jest.fn((selector) =>
    selector({
      pendingNavigation: '/target-page',
      isDiscardModalOpen: true,
      setPendingNavigation,
      setDiscardModalOpen
    })
  )
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
  });

  it('should render children', () => {
    render(
      <DiscardModalProvider>
        <div data-testid="child">Hello</div>
      </DiscardModalProvider>
    );

    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('should open modal when discard modal state is true', () => {
    render(
      <DiscardModalProvider>
        <div>child</div>
      </DiscardModalProvider>
    );
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Confirm')).toBeInTheDocument();
  });

  it('should clear navigation state when cancel is clicked', () => {
    render(
      <DiscardModalProvider>
        <div>child</div>
      </DiscardModalProvider>
    );

    fireEvent.click(screen.getByText('Cancel'));

    expect(setPendingNavigation).toHaveBeenCalledWith(null);
    expect(setDiscardModalOpen).toHaveBeenCalledWith(false);
  });

  it('should navigate to pending path when confirm is clicked', () => {
    render(
      <DiscardModalProvider>
        <div>child</div>
      </DiscardModalProvider>
    );

    fireEvent.click(screen.getByText('Confirm'));

    expect(pushMock).toHaveBeenCalledWith('/target-page');
    expect(setPendingNavigation).toHaveBeenCalledWith(null);
    expect(setDiscardModalOpen).toHaveBeenCalledWith(false);
  });
});
