import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ComponentProps, type ReactNode, type SVGProps, useEffect, useRef } from 'react';

import type {
  CropRendererProps,
  GalleryRendererProps,
  MediaModalRenderers,
  UploadRendererProps,
  UsedRendererProps
} from '../MediaModal.renderers';
import type {
  MediaModalOpenState,
  MediaModalTab,
} from '../MediaModal.types';
import { MockDsButton } from '../test-utils/mockDsButton';
import { MediaModalFlow } from './MediaModalFlow';
import type { CropResult } from '~/types/common';

jest.mock('~/hooks/use-upload/useUpload', () => ({
  useUpload: () => ({
    uploadFile: jest.fn().mockResolvedValue({ id: 'upload-pdf-1', fileName: 'doc.pdf' })
  })
}));

jest.mock('../MediaModal.utils', () => ({
  isImageUploadFile: (file: File) => file.type.startsWith('image/')
}));

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
  default: MockDsButton
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

jest.mock('../components/container/MediaModalContainer', () => ({
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
  value: MediaModalTab;
  onChange: (v: MediaModalTab) => void;
};

jest.mock('../components/switcher/MediaModalSwitcher', () => ({
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

const initialCrop: CropResult = { rect: { x: 0, y: 0, width: 200, height: 200 } };
const resizedCrop: CropResult = { rect: { x: 24, y: 18, width: 160, height: 220 } };

function CropRenderer({ selected, crop, resetSeq, onBaseline, onChange }: Readonly<CropRendererProps>) {
  const didInitForSelectedRef = useRef<string | null>(null);

  useEffect(() => {
    if (didInitForSelectedRef.current === selected.id) return;
    didInitForSelectedRef.current = selected.id;
    onBaseline(initialCrop);
  }, [onBaseline, selected.id]);

  return (
    <div data-testid="CropView" data-reset-seq={resetSeq} data-crop={crop ? JSON.stringify(crop) : 'null'}>
      <button type="button" data-testid="CropView-resize" onClick={() => onChange(resizedCrop)}>
        resize
      </button>
    </div>
  );
}

function GalleryRenderer({ selected, onPick }: Readonly<GalleryRendererProps>) {
  return (
    <div data-testid="GalleryView" data-selected={selected ? selected.id : 'none'}>
      <button
        type="button"
        data-testid="GalleryView-pick"
        onClick={() =>
          onPick({
            kind: 'gallery',
            id: 'gallery-1-uk',
            fileName: 'gallery-1.png',
            src: '/demo/gallery-1.png',
            locale: 'uk'
          })
        }
      >
        pick
      </button>
    </div>
  );
}

function UploadRenderer({ selected, onPick }: Readonly<UploadRendererProps>) {
  return (
    <div data-testid="UploadView" data-selected={selected ? selected.fileName : 'none'}>
      <button
        type="button"
        data-testid="UploadView-pick"
        onClick={() =>
          onPick({
            kind: 'upload',
            id: 'upload-1',
            fileName: 'a.png',
            file: new File(['x'], 'a.png', { type: 'image/png' })
          })
        }
      >
        pick
      </button>
    </div>
  );
}

function UsedRenderer({ selected, onPick }: Readonly<UsedRendererProps>) {
  return (
    <div data-testid="UsedView" data-selected={selected ? selected.id : 'none'}>
      <button
        type="button"
        data-testid="UsedView-pick"
        onClick={() =>
          onPick({
            kind: 'used',
            id: 'used-1-en',
            fileName: 'used-1.png',
            src: '/demo/used-1.png',
            locale: 'en'
          })
        }
      >
        pick
      </button>
    </div>
  );
}

const createRenderers = (): MediaModalRenderers => ({
  gallery: (props) => <GalleryRenderer {...props} />,
  upload: (props) => <UploadRenderer {...props} />,
  used: (props) => <UsedRenderer {...props} />,
  crop: (props) => <CropRenderer {...props} />
});

function renderOpen(initial?: MediaModalOpenState, overrides?: Partial<ComponentProps<typeof MediaModalFlow>>) {
  const props: ComponentProps<typeof MediaModalFlow> = {
    open: true,
    onClose: jest.fn(),
    onApply: jest.fn(),
    initial,
    renderers: createRenderers(),
    ...overrides
  };

  return render(<MediaModalFlow {...props} />);
}

async function pickAndEnterCrop(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByTestId('GalleryView-pick'));
  expect(screen.getByTestId('CropView')).toBeInTheDocument();

  await waitFor(() => expect(screen.getByTestId('CropView')).toHaveAttribute('data-crop', JSON.stringify(initialCrop)));
}

describe('MediaModalFlow', () => {
  const user = userEvent.setup();

  it('should render select step without footer', () => {
    renderOpen({ tab: 'GALLERY' });

    expect(screen.getByTestId('MediaModalSwitcher')).toBeInTheDocument();
    expect(screen.getByTestId('GalleryView')).toBeInTheDocument();
    expect(screen.queryByTestId('MediaModal-footer')).not.toBeInTheDocument();
  });

  it('should ignore initial CROP when selected is missing', () => {
    renderOpen({ tab: 'GALLERY', step: 'CROP', selected: null, crop: null });

    expect(screen.getByTestId('MediaModalSwitcher')).toBeInTheDocument();
    expect(screen.getByTestId('GalleryView')).toBeInTheDocument();
    expect(screen.queryByTestId('CropView')).not.toBeInTheDocument();
  });

  it('should derive tab from initial selected (upload -> UPLOAD tab)', () => {
    renderOpen({
      selected: {
        kind: 'upload',
        id: 'upload-1',
        fileName: 'a.png',
        file: new File(['x'], 'a.png', { type: 'image/png' })
      }
    });

    expect(screen.getByTestId('MediaModalSwitcher')).toHaveAttribute('data-value', 'UPLOAD');
    expect(screen.getByTestId('UploadView')).toBeInTheDocument();
    expect(screen.getByTestId('UploadView')).toHaveAttribute('data-selected', 'a.png');
  });

  it('should switch tabs in select step', async () => {
    renderOpen({ tab: 'GALLERY' });

    await user.click(screen.getByTestId('MediaModalSwitcher-usedTab'));
    expect(screen.getByTestId('UsedView')).toBeInTheDocument();

    await user.click(screen.getByTestId('MediaModalSwitcher-uploadTab'));
    expect(screen.getByTestId('UploadView')).toBeInTheDocument();
  });

  it('should apply non-image upload without crop step', async () => {
    const onClose = jest.fn();
    const onApply = jest.fn().mockResolvedValue(undefined);

    const renderers = createRenderers();
    renderers.upload = ({ selected, onPick }: Readonly<UploadRendererProps>) => (
      <div data-testid="UploadView" data-selected={selected ? selected.fileName : 'none'}>
        <button
          type="button"
          data-testid="UploadView-pickPdf"
          onClick={() =>
            onPick({
              kind: 'upload',
              id: 'upload-pdf-1',
              fileName: 'doc.pdf',
              file: new File(['x'], 'doc.pdf', { type: 'application/pdf' })
            })
          }
        >
          pick
        </button>
      </div>
    );

    renderOpen({ tab: 'UPLOAD' }, { onClose, onApply, renderers });

    await user.click(screen.getByTestId('UploadView-pickPdf'));

    const applyButton = await screen.findByTestId('MediaModal-applyButton');
    await waitFor(() => expect(applyButton).not.toBeDisabled());

    await user.click(applyButton);

    await waitFor(() => {
      expect(onApply).toHaveBeenCalledWith(expect.objectContaining({
        selected: expect.objectContaining({
          kind: 'upload',
          id: 'upload-pdf-1',
          fileName: 'doc.pdf'
        }),
        crop: null
      }));
    });

    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
  });

  it('should enter crop after pick and show crop actions', async () => {
    renderOpen({ tab: 'GALLERY' });

    await pickAndEnterCrop(user);

    expect(screen.queryByTestId('MediaModalSwitcher')).not.toBeInTheDocument();
    expect(screen.getByTestId('MediaModal-footer')).toBeInTheDocument();
    expect(screen.getByTestId('MediaModal-backButton')).toBeInTheDocument();
    expect(screen.getByTestId('MediaModal-resetButton')).toBeDisabled();
  });

  it('should enable reset after resize and reset back to initial crop', async () => {
    renderOpen({ tab: 'GALLERY' });

    await pickAndEnterCrop(user);

    const reset = screen.getByTestId('MediaModal-resetButton');
    const cropView = screen.getByTestId('CropView');

    await user.click(screen.getByTestId('CropView-resize'));
    await waitFor(() => expect(reset).not.toBeDisabled());

    await user.click(reset);

    await waitFor(() => expect(cropView).toHaveAttribute('data-crop', JSON.stringify(initialCrop)));
    expect(reset).toBeDisabled();
  });

  it('should apply resized crop and close on success', async () => {
    const onApply = jest.fn(() => Promise.resolve());
    const onClose = jest.fn();

    renderOpen({ tab: 'GALLERY' }, { onClose, onApply });

    await pickAndEnterCrop(user);

    await user.click(screen.getByTestId('CropView-resize'));

    await user.click(screen.getByTestId('MediaModal-applyButton'));

    await waitFor(() => expect(onApply).toHaveBeenCalled());
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
  });

  it('should render apply error in footer when apply fails', async () => {
    const onApply = jest.fn(() => Promise.reject(new Error('apply failed')));

    renderOpen({ tab: 'GALLERY' }, { onApply });

    await pickAndEnterCrop(user);

    await user.click(screen.getByTestId('MediaModal-applyButton'));

    expect(await screen.findByTestId('MediaModal-applyError')).toHaveTextContent('apply failed');
  });
});
