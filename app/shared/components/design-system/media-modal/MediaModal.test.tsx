import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React, { MouseEventHandler, ReactNode, SVGProps } from 'react';

import { MediaModal } from './MediaModal';
import type { MediaModalOpenState, MediaModalResult, SelectedMedia } from './MediaModal.types';

type DsButtonProps = {
  label?: string;
  children?: ReactNode;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  loading?: boolean;
  role?: string;
  tabIndex?: number;
  sx?: unknown;
  'data-testid'?: string;
  'aria-label'?: string;
  'aria-selected'?: boolean;
  'aria-pressed'?: boolean;
  [key: string]: unknown;
};

jest.mock('~/public/icons/iteration.svg', () => ({
  __esModule: true,
  default: (props: SVGProps<SVGSVGElement>) => <svg {...props} />
}));

jest.mock('~/public/icons/arrowLeft.svg', () => ({
  __esModule: true,
  default: (props: SVGProps<SVGSVGElement>) => <svg {...props} />
}));

jest.mock('~/shared/components/design-system/button/Button', () => ({
  __esModule: true,
  default: (props: DsButtonProps) => {
    const {
      label,
      children,
      startIcon,
      endIcon,
      onClick,
      disabled,
      role,
      tabIndex,
      sx: _sx,
      'data-testid': dataTestId,
      'aria-label': ariaLabel,
      'aria-selected': ariaSelected,
      'aria-pressed': ariaPressed
    } = props;

    return (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        role={role}
        tabIndex={tabIndex}
        data-testid={dataTestId}
        aria-label={ariaLabel}
        aria-selected={ariaSelected}
        aria-pressed={ariaPressed}
      >
        {startIcon}
        {label ?? children}
        {endIcon}
      </button>
    );
  }
}));

type ContainerProps = {
  open: boolean;
  onClose: () => void;
  dataTestId?: string;
  headerLeft?: ReactNode;
  headerCenter?: ReactNode;
  headerRight?: ReactNode;
  footerTop?: ReactNode;
  footerLeft?: ReactNode;
  footerRight?: ReactNode;
  children: ReactNode;
};

jest.mock('./components/container/MediaModalContainer', () => ({
  __esModule: true,
  MediaModalContainer: (props: ContainerProps) => {
    const {
      open,
      onClose,
      dataTestId = 'MediaModal',
      headerLeft,
      headerCenter,
      headerRight,
      footerTop,
      footerLeft,
      footerRight,
      children
    } = props;

    if (!open) return null;

    const hasFooter = Boolean(footerTop || footerLeft || footerRight);

    return (
      <div data-testid={dataTestId}>
        <div data-testid={`${dataTestId}-header`}>
          <div data-testid={`${dataTestId}-headerLeft`}>{headerLeft ?? null}</div>
          <div data-testid={`${dataTestId}-headerCenter`}>{headerCenter ?? null}</div>
          <div data-testid={`${dataTestId}-headerRight`}>
            {headerRight ?? null}
            <button type="button" data-testid={`${dataTestId}-closeButton`} onClick={onClose}>
              close
            </button>
          </div>
        </div>

        <div data-testid={`${dataTestId}-body`}>{children}</div>

        {hasFooter ? (
          <div data-testid={`${dataTestId}-footer`}>
            {footerTop ? <div data-testid={`${dataTestId}-footerTop`}>{footerTop}</div> : null}
            <div data-testid={`${dataTestId}-footerLeft`}>{footerLeft ?? null}</div>
            <div data-testid={`${dataTestId}-footerRight`}>{footerRight ?? null}</div>
          </div>
        ) : null}
      </div>
    );
  }
}));

type SwitcherProps = {
  value: string;
  onChange: (v: string) => void;
};

jest.mock('./components/switcher/MediaModalSwitcher', () => ({
  __esModule: true,
  MediaModalSwitcher: ({ value, onChange }: SwitcherProps) => (
    <div data-testid="MediaModalSwitcher" data-value={value}>
      <button type="button" data-testid="MediaModalSwitcher-galleryTab" onClick={() => onChange('GALLERY')}>
        gallery
      </button>
      <button type="button" data-testid="MediaModalSwitcher-uploadTab" onClick={() => onChange('UPLOAD')}>
        upload
      </button>
      <button type="button" data-testid="MediaModalSwitcher-usedTab" onClick={() => onChange('USED')}>
        used
      </button>
    </div>
  )
}));

type GalleryViewProps = {
  selected: Extract<SelectedMedia, { kind: 'gallery' }> | null;
  onPick: (selected: SelectedMedia) => void;
};

type UsedViewProps = {
  selected: Extract<SelectedMedia, { kind: 'used' }> | null;
  onPick: (selected: SelectedMedia) => void;
};

type UploadViewProps = {
  onPick: (selected: SelectedMedia) => void;
};

type CropViewProps = {
  resetSeq: number;
  onCropChanges: (hasCropChanges: boolean) => void;
};

jest.mock('./views/gallery-view/GalleryView', () => ({
  __esModule: true,
  GalleryView: ({ onPick }: GalleryViewProps) => (
    <div data-testid="GalleryView">
      <button
        type="button"
        data-testid="GalleryView-pick"
        onClick={() => onPick({ kind: 'gallery', name: 'gallery-1.png', locale: 'UA' })}
      >
        pick
      </button>
    </div>
  )
}));

jest.mock('./views/used-view/UsedView', () => ({
  __esModule: true,
  UsedView: ({ onPick }: UsedViewProps) => (
    <div data-testid="UsedView">
      <button
        type="button"
        data-testid="UsedView-pick"
        onClick={() => onPick({ kind: 'used', name: 'used-1.png', locale: 'EN' })}
      >
        pick
      </button>
    </div>
  )
}));

jest.mock('./views/upload-view/UploadView', () => ({
  __esModule: true,
  UploadView: ({ onPick }: UploadViewProps) => (
    <div data-testid="UploadView">
      <button type="button" data-testid="UploadView-pick" onClick={() => onPick({ kind: 'upload', name: 'a.png' })}>
        pick
      </button>
    </div>
  )
}));

jest.mock('./views/crop-view/CropView', () => ({
  __esModule: true,
  CropView: ({ resetSeq, onCropChanges }: CropViewProps) => (
    <div data-testid="CropView" data-reset-seq={resetSeq}>
      <button type="button" data-testid="CropView-makeChanged" onClick={() => onCropChanges(true)}>
        changed
      </button>
    </div>
  )
}));

function renderOpen(initial?: MediaModalOpenState, overrides?: Partial<React.ComponentProps<typeof MediaModal>>) {
  const props: React.ComponentProps<typeof MediaModal> = {
    open: true,
    onClose: jest.fn(),
    onApply: jest.fn(),
    initial,
    ...overrides
  };

  return render(<MediaModal {...props} />);
}

async function goToCrop(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByTestId('GalleryView-pick'));
  expect(screen.getByTestId('CropView')).toBeInTheDocument();
}

describe('MediaModal', () => {
  it('should render select step without footer', () => {
    renderOpen({ tab: 'GALLERY' });

    expect(screen.getByTestId('MediaModalSwitcher')).toBeInTheDocument();
    expect(screen.getByTestId('GalleryView')).toBeInTheDocument();
    expect(screen.queryByTestId('MediaModal-footer')).not.toBeInTheDocument();
    expect(screen.queryByTestId('MediaModal-resetButton')).not.toBeInTheDocument();
  });

  it('should switch tabs in select step', async () => {
    const user = userEvent.setup();

    renderOpen({ tab: 'GALLERY' });

    await user.click(screen.getByTestId('MediaModalSwitcher-usedTab'));
    expect(screen.getByTestId('UsedView')).toBeInTheDocument();

    await user.click(screen.getByTestId('MediaModalSwitcher-uploadTab'));
    expect(screen.getByTestId('UploadView')).toBeInTheDocument();
  });

  it('should enter crop after pick and show crop actions', async () => {
    const user = userEvent.setup();

    renderOpen({ tab: 'GALLERY' });

    await goToCrop(user);

    expect(screen.queryByTestId('MediaModalSwitcher')).not.toBeInTheDocument();
    expect(screen.getByTestId('MediaModal-footer')).toBeInTheDocument();
    expect(screen.getByTestId('MediaModal-backButton')).toBeInTheDocument();
    expect(screen.getByTestId('MediaModal-cancelButton')).toBeInTheDocument();
    expect(screen.getByTestId('MediaModal-applyButton')).toBeInTheDocument();
    expect(screen.getByTestId('MediaModal-resetButton')).toBeDisabled();
  });

  it('should go back from crop to select and hide footer', async () => {
    const user = userEvent.setup();

    renderOpen({ tab: 'GALLERY' });

    await goToCrop(user);
    await user.click(screen.getByTestId('MediaModal-backButton'));

    expect(screen.getByTestId('MediaModalSwitcher')).toBeInTheDocument();
    expect(screen.getByTestId('GalleryView')).toBeInTheDocument();
    expect(screen.queryByTestId('MediaModal-footer')).not.toBeInTheDocument();
  });

  it('should enable reset when crop becomes dirty and disable after reset', async () => {
    const user = userEvent.setup();

    renderOpen({ tab: 'GALLERY' });

    await goToCrop(user);

    const reset = screen.getByTestId('MediaModal-resetButton');
    expect(reset).toBeDisabled();

    await user.click(screen.getByTestId('CropView-makeChanged'));
    expect(reset).not.toBeDisabled();

    await user.click(reset);
    expect(reset).toBeDisabled();
  });

  it('should apply selected and close on success', async () => {
    const user = userEvent.setup();

    const onClose = jest.fn();
    const onApply = jest.fn((_: MediaModalResult) => Promise.resolve());

    renderOpen({ tab: 'GALLERY' }, { onClose, onApply });

    await goToCrop(user);
    await user.click(screen.getByTestId('MediaModal-applyButton'));

    expect(onApply).toHaveBeenCalledWith({ selected: { kind: 'gallery', name: 'gallery-1.png', locale: 'UA' } });
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
  });

  it('should show error and keep modal open when apply fails', async () => {
    const user = userEvent.setup();

    const onClose = jest.fn();
    const onApply = jest.fn(async () => {
      throw new Error('apply failed');
    });

    renderOpen({ tab: 'GALLERY' }, { onClose, onApply });

    await goToCrop(user);
    await user.click(screen.getByTestId('MediaModal-applyButton'));

    expect(await screen.findByTestId('MediaModal-applyError')).toHaveTextContent('apply failed');
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByTestId('CropView')).toBeInTheDocument();
  });
});
