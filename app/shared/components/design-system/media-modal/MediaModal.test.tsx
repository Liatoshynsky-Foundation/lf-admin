import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MouseEventHandler, ReactNode, SVGProps } from 'react';

import { MediaModal } from './MediaModal';
import type { MediaModalResult, SelectedMedia } from './MediaModal.types';

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
  'data-testid'?: string;
  'aria-label'?: string;
  'aria-selected'?: boolean;
  'aria-pressed'?: boolean;
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
    const { label, children, onClick, disabled, role, tabIndex, 'data-testid': dataTestId } = props;

    return (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        role={role}
        tabIndex={tabIndex}
        data-testid={dataTestId}
      >
        {label ?? children}
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

type GallerySelected = Extract<SelectedMedia, { kind: 'gallery' }>;
type UsedSelected = Extract<SelectedMedia, { kind: 'used' }>;

type GalleryViewProps = {
  selected: GallerySelected | null;
  onPick: (selected: SelectedMedia) => void;
};

type UsedViewProps = {
  selected: UsedSelected | null;
  onPick: (selected: SelectedMedia) => void;
};

type UploadViewProps = {
  onPick: (selected: SelectedMedia) => void;
};

type CropViewProps = {
  cropState: 'INITIAL' | 'RESIZED';
  onSimulateResize: () => void;
};

jest.mock('./views/gallery-view/GalleryView', () => ({
  __esModule: true,
  GalleryView: ({ selected, onPick }: GalleryViewProps) => (
    <div data-testid="GalleryView">
      <div data-testid="GalleryView-selected">{selected ? `${selected.name}:${selected.locale}` : 'null'}</div>
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
  UsedView: ({ selected, onPick }: UsedViewProps) => (
    <div data-testid="UsedView">
      <div data-testid="UsedView-selected">{selected ? `${selected.name}:${selected.locale}` : 'null'}</div>
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
  CropView: ({ cropState, onSimulateResize }: CropViewProps) => (
    <div data-testid="CropView">
      <div data-testid="CropView-state">{cropState}</div>
      <button type="button" data-testid="CropView-simulateResize" onClick={onSimulateResize}>
        resize
      </button>
    </div>
  )
}));

describe('MediaModal', () => {
  it('should render switcher and no footer in select step', () => {
    render(<MediaModal open onClose={jest.fn()} onApply={jest.fn()} initial={{ tab: 'GALLERY' }} />);

    expect(screen.getByTestId('MediaModalSwitcher')).toBeInTheDocument();
    expect(screen.queryByTestId('MediaModal-footer')).not.toBeInTheDocument();
    expect(screen.queryByTestId('MediaModal-cropHeader')).not.toBeInTheDocument();
  });

  it('should go to crop after pick and show crop header and actions', async () => {
    const user = userEvent.setup();
    render(<MediaModal open onClose={jest.fn()} onApply={jest.fn()} initial={{ tab: 'GALLERY' }} />);

    await user.click(screen.getByTestId('GalleryView-pick'));

    expect(screen.getByTestId('CropView')).toBeInTheDocument();
    expect(screen.getByTestId('MediaModal-cropHeader')).toBeInTheDocument();
    expect(screen.getByTestId('MediaModal-cropHeaderFileName')).toHaveTextContent('gallery-1.png');
    expect(screen.getByTestId('MediaModal-reverseButton')).toBeInTheDocument();
    expect(screen.getByTestId('MediaModal-backButton')).toBeInTheDocument();
    expect(screen.getByTestId('MediaModal-cancelButton')).toBeInTheDocument();
    expect(screen.getByTestId('MediaModal-applyButton')).toBeInTheDocument();
    expect(screen.getByTestId('MediaModal-footer')).toBeInTheDocument();
  });

  it('should keep selected after back so view can highlight previously selected', async () => {
    const user = userEvent.setup();
    render(<MediaModal open onClose={jest.fn()} onApply={jest.fn()} initial={{ tab: 'GALLERY' }} />);

    await user.click(screen.getByTestId('GalleryView-pick'));
    await user.click(screen.getByTestId('MediaModal-backButton'));

    expect(screen.getByTestId('GalleryView')).toBeInTheDocument();
    expect(screen.getByTestId('GalleryView-selected')).toHaveTextContent('gallery-1.png:UA');
    expect(screen.queryByTestId('MediaModal-footer')).not.toBeInTheDocument();
  });

  it('should reset crop state when reverse is clicked', async () => {
    const user = userEvent.setup();
    render(<MediaModal open onClose={jest.fn()} onApply={jest.fn()} initial={{ tab: 'GALLERY' }} />);

    await user.click(screen.getByTestId('GalleryView-pick'));
    expect(screen.getByTestId('CropView-state')).toHaveTextContent('INITIAL');

    await user.click(screen.getByTestId('CropView-simulateResize'));
    expect(screen.getByTestId('CropView-state')).toHaveTextContent('RESIZED');

    await user.click(screen.getByTestId('MediaModal-reverseButton'));
    expect(screen.getByTestId('CropView-state')).toHaveTextContent('INITIAL');
  });

  it('should call onApply with selected and then close', async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();
    const onApply = jest.fn((_: MediaModalResult) => Promise.resolve());

    render(<MediaModal open onClose={onClose} onApply={onApply} initial={{ tab: 'GALLERY' }} />);

    await user.click(screen.getByTestId('GalleryView-pick'));
    await user.click(screen.getByTestId('MediaModal-applyButton'));

    expect(onApply).toHaveBeenCalledTimes(1);

    const payload = (onApply as jest.Mock).mock.calls[0]?.[0];
    expect(payload).toEqual({
      selected: { kind: 'gallery', name: 'gallery-1.png', locale: 'UA' }
    });

    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
  });

  it('should call onClose on cancel', async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();
    render(<MediaModal open onClose={onClose} onApply={jest.fn()} initial={{ tab: 'GALLERY' }} />);

    await user.click(screen.getByTestId('GalleryView-pick'));
    await user.click(screen.getByTestId('MediaModal-cancelButton'));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should fallback to select when initial requests crop without selected', () => {
    render(
      <MediaModal
        open
        onClose={jest.fn()}
        onApply={jest.fn()}
        initial={{ tab: 'GALLERY', step: 'CROP', selected: null }}
      />
    );

    expect(screen.getByTestId('GalleryView')).toBeInTheDocument();
    expect(screen.queryByTestId('CropView')).not.toBeInTheDocument();
  });

  it('should prevent double apply while promise is pending', async () => {
    const user = userEvent.setup();

    let resolveApply!: () => void;
    const pending = new Promise<void>((res) => {
      resolveApply = res;
    });

    const onApply = jest.fn(() => pending);
    const onClose = jest.fn();

    render(<MediaModal open onClose={onClose} onApply={onApply} initial={{ tab: 'GALLERY' }} />);

    await user.click(screen.getByTestId('GalleryView-pick'));

    await user.click(screen.getByTestId('MediaModal-applyButton'));
    await user.click(screen.getByTestId('MediaModal-applyButton'));
    await user.click(screen.getByTestId('MediaModal-applyButton'));

    expect(onApply).toHaveBeenCalledTimes(1);

    resolveApply();
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
  });

  it('should ignore back and reverse while applying', async () => {
    const user = userEvent.setup();

    let resolveApply!: () => void;
    const pending = new Promise<void>((res) => {
      resolveApply = res;
    });

    const onApply = jest.fn(() => pending);
    const onClose = jest.fn();

    render(<MediaModal open onClose={onClose} onApply={onApply} initial={{ tab: 'GALLERY' }} />);

    await user.click(screen.getByTestId('GalleryView-pick'));
    await user.click(screen.getByTestId('CropView-simulateResize'));
    expect(screen.getByTestId('CropView-state')).toHaveTextContent('RESIZED');

    await user.click(screen.getByTestId('MediaModal-applyButton'));

    await user.click(screen.getByTestId('MediaModal-backButton'));
    await user.click(screen.getByTestId('MediaModal-reverseButton'));

    expect(screen.getByTestId('CropView')).toBeInTheDocument();
    expect(screen.getByTestId('CropView-state')).toHaveTextContent('RESIZED');

    resolveApply();
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
  });

  it('should show error and not close when onApply rejects', async () => {
    const user = userEvent.setup();

    const onApply = jest.fn(async () => {
      throw new Error('apply failed');
    });
    const onClose = jest.fn();

    render(<MediaModal open onClose={onClose} onApply={onApply} initial={{ tab: 'GALLERY' }} />);

    await user.click(screen.getByTestId('GalleryView-pick'));
    await user.click(screen.getByTestId('MediaModal-applyButton'));

    expect(await screen.findByTestId('MediaModal-applyError')).toHaveTextContent('apply failed');
    expect(onClose).toHaveBeenCalledTimes(0);
  });

  it('should not call onClose again if user closes while apply is pending', async () => {
    const user = userEvent.setup();

    let resolveApply!: () => void;
    const pending = new Promise<void>((res) => {
      resolveApply = res;
    });

    const onApply = jest.fn(() => pending);
    const onClose = jest.fn();

    const { rerender } = render(<MediaModal open onClose={onClose} onApply={onApply} initial={{ tab: 'GALLERY' }} />);

    await user.click(screen.getByTestId('GalleryView-pick'));
    await user.click(screen.getByTestId('MediaModal-applyButton'));

    await user.click(screen.getByTestId('MediaModal-closeButton'));
    expect(onClose).toHaveBeenCalledTimes(1);

    rerender(<MediaModal open={false} onClose={onClose} onApply={onApply} initial={{ tab: 'GALLERY' }} />);

    resolveApply();

    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
  });

  it('should reset state from latest initial when reopened', async () => {
    const user = userEvent.setup();

    const onClose = jest.fn();
    const onApply = jest.fn((_: MediaModalResult) => Promise.resolve());

    const { rerender } = render(<MediaModal open onClose={onClose} onApply={onApply} initial={{ tab: 'GALLERY' }} />);

    await user.click(screen.getByTestId('GalleryView-pick'));
    expect(screen.getByTestId('CropView')).toBeInTheDocument();

    rerender(<MediaModal open={false} onClose={onClose} onApply={onApply} initial={{ tab: 'GALLERY' }} />);
    rerender(<MediaModal open onClose={onClose} onApply={onApply} initial={{ tab: 'USED' }} />);

    expect(screen.getByTestId('UsedView')).toBeInTheDocument();
    expect(screen.queryByTestId('CropView')).not.toBeInTheDocument();
  });
});
