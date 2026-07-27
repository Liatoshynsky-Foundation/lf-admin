import { fireEvent, render, screen } from '@testing-library/react';

import DiscardModalProvider from './DiscardModalProvider';
import { BACK_NAVIGATION } from '~/constants/navigation';
import { useStore } from '~/store';

const pushMock = jest.fn();
const backMock = jest.fn();
const setPendingNavigation = jest.fn();
const setDiscardModalOpen = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: pushMock,
    back: backMock
  })
}));

jest.mock('~/store', () => ({
  useStore: jest.fn()
}));

interface MockModalProps {
  readonly open: boolean;
  readonly handleClose: () => void;
  readonly handleSubmit: () => void;
}

jest.mock('~/shared/components/design-system/discard-changes-modal/DiscardChangesModal', () => ({
  __esModule: true,
  default: ({ open, handleClose, handleSubmit }: MockModalProps) =>
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

  const setupStoreMock = (pendingNavigation: string | null, isDiscardModalOpen: boolean) => {
    (useStore as unknown as jest.Mock).mockImplementation((selector: (state: unknown) => unknown) =>
      selector({
        pendingNavigation,
        isDiscardModalOpen,
        setPendingNavigation,
        setDiscardModalOpen
      })
    );
  };

  it('should render children', () => {
    setupStoreMock('/target-page', false);

    render(
      <DiscardModalProvider>
        <div data-testid="child">Hello</div>
      </DiscardModalProvider>
    );

    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('should open modal when discard modal state is true', () => {
    setupStoreMock('/target-page', true);

    render(
      <DiscardModalProvider>
        <div>child</div>
      </DiscardModalProvider>
    );

    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Confirm')).toBeInTheDocument();
  });

  it('should clear navigation state when cancel is clicked', () => {
    setupStoreMock('/target-page', true);

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
    setupStoreMock('/target-page', true);

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

  it('should call router.back() when pendingNavigation is BACK_NAVIGATION', () => {
    setupStoreMock(BACK_NAVIGATION, true);

    render(
      <DiscardModalProvider>
        <div>child</div>
      </DiscardModalProvider>
    );

    fireEvent.click(screen.getByText('Confirm'));

    expect(backMock).toHaveBeenCalledTimes(1);
    expect(setPendingNavigation).toHaveBeenCalledWith(null);
    expect(setDiscardModalOpen).toHaveBeenCalledWith(false);
  });

  it('should only close modal on confirm if pendingNavigation is missing', () => {
    setupStoreMock(null, true);

    render(
      <DiscardModalProvider>
        <div>child</div>
      </DiscardModalProvider>
    );

    fireEvent.click(screen.getByText('Confirm'));

    expect(pushMock).not.toHaveBeenCalled();
    expect(backMock).not.toHaveBeenCalled();
    expect(setPendingNavigation).not.toHaveBeenCalledWith(null);
    expect(setDiscardModalOpen).not.toHaveBeenCalledWith(false);
    expect(screen.queryByText('Confirm')).not.toBeInTheDocument();
  });
});
