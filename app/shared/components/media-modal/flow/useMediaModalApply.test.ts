import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React, { type ReactElement } from 'react';

import type { MediaModalResult } from '../MediaModal.types';
import { useMediaModalApply } from './useMediaModalApply';

type Deferred<T> = {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (reason: unknown) => void;
};

const createDeferred = <T>(): Deferred<T> => {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;

  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, resolve, reject };
};

const demoResult: MediaModalResult = {
  selected: {
    kind: 'gallery',
    id: 'gallery-1-uk',
    fileName: 'gallery-1.png',
    src: '/demo/gallery-1.png',
    locale: 'uk'
  },
  crop: null
};

const createMockFile = (name: string, type: string): File => {
  const blob = new Blob([''], { type });
  return Object.assign(blob, { name, lastModified: 0, webkitRelativePath: '' }) as File;
};

type HarnessProps = {
  open: boolean;
  onClose: jest.Mock<void, []>;
  onApply: jest.Mock<Promise<void> | void, [MediaModalResult]>;
  directory?: string;
  persistUploadAsAsset?: boolean;
  customResult?: MediaModalResult;
};

function Harness({
  open,
  onClose,
  onApply,
  directory,
  persistUploadAsAsset,
  customResult
}: Readonly<HarnessProps>): ReactElement {
  const { isApplying, applyError, clearApplyError, cancelInFlightApply, handleClose, runApply, clearApplyState } =
    useMediaModalApply({
      open,
      onClose,
      onApply,
      directory,
      persistUploadAsAsset
    });

  return React.createElement('div', {}, [
    React.createElement('div', { key: 'isApplying', 'data-testid': 'isApplying' }, String(isApplying)),
    React.createElement('div', { key: 'applyError', 'data-testid': 'applyError' }, applyError ?? ''),
    React.createElement(
      'button',
      {
        key: 'apply',
        type: 'button',
        'data-testid': 'apply',
        onClick: () => {
          void runApply(customResult ?? demoResult);
        }
      },
      'apply'
    ),
    React.createElement(
      'button',
      { key: 'close', type: 'button', 'data-testid': 'close', onClick: handleClose },
      'close'
    ),
    React.createElement(
      'button',
      { key: 'cancel', type: 'button', 'data-testid': 'cancel', onClick: cancelInFlightApply },
      'cancel'
    ),
    React.createElement(
      'button',
      { key: 'clearError', type: 'button', 'data-testid': 'clearError', onClick: clearApplyError },
      'clearError'
    ),
    React.createElement(
      'button',
      { key: 'clearState', type: 'button', 'data-testid': 'clearState', onClick: clearApplyState },
      'clearState'
    )
  ]);
}

const mockUploadFile = jest.fn();
jest.mock('~/hooks/use-upload/useUpload', () => ({
  useUpload: () => ({
    uploadFile: mockUploadFile
  })
}));

const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('useMediaModalApply', () => {
  it('should call onApply and onClose on success', async () => {
    const user = userEvent.setup();
    const deferred = createDeferred<void>();

    const onClose = jest.fn<void, []>();
    const onApply = jest.fn<Promise<void>, [MediaModalResult]>(() => deferred.promise);

    render(React.createElement(Harness, { open: true, onClose, onApply }));

    await user.click(screen.getByTestId('apply'));

    expect(onApply).toHaveBeenCalledTimes(1);
    expect(onApply).toHaveBeenCalledWith(demoResult);

    await waitFor(() => expect(screen.getByTestId('isApplying')).toHaveTextContent('true'));

    deferred.resolve(undefined);

    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(screen.getByTestId('isApplying')).toHaveTextContent('false'));
  });

  it('should set applyError and keep open when onApply rejects', async () => {
    const user = userEvent.setup();

    const onClose = jest.fn<void, []>();
    const onApply = jest.fn<Promise<void>, [MediaModalResult]>(() => Promise.reject(new Error('apply failed')));

    render(React.createElement(Harness, { open: true, onClose, onApply }));

    await user.click(screen.getByTestId('apply'));

    expect(await screen.findByTestId('applyError')).toHaveTextContent('apply failed');
    expect(onClose).not.toHaveBeenCalled();
  });

  it('should ignore resolved apply after cancelInFlightApply', async () => {
    const user = userEvent.setup();
    const deferred = createDeferred<void>();

    const onClose = jest.fn<void, []>();
    const onApply = jest.fn<Promise<void>, [MediaModalResult]>(() => deferred.promise);

    render(React.createElement(Harness, { open: true, onClose, onApply }));

    await user.click(screen.getByTestId('apply'));
    await waitFor(() => expect(screen.getByTestId('isApplying')).toHaveTextContent('true'));

    await user.click(screen.getByTestId('cancel'));
    expect(screen.getByTestId('isApplying')).toHaveTextContent('false');

    deferred.resolve(undefined);

    await waitFor(() => expect(onClose).not.toHaveBeenCalled());
    expect(screen.getByTestId('applyError')).toHaveTextContent('');
  });

  it('should not close when open becomes false during apply', async () => {
    const user = userEvent.setup();
    const deferred = createDeferred<void>();

    const onClose = jest.fn<void, []>();
    const onApply = jest.fn<Promise<void>, [MediaModalResult]>(() => deferred.promise);

    const { rerender } = render(React.createElement(Harness, { open: true, onClose, onApply }));

    await user.click(screen.getByTestId('apply'));
    await waitFor(() => expect(screen.getByTestId('isApplying')).toHaveTextContent('true'));

    rerender(React.createElement(Harness, { open: false, onClose, onApply }));

    deferred.resolve(undefined);

    await waitFor(() => expect(onClose).not.toHaveBeenCalled());
  });

  describe('File Upload Backend Types & Asset Persistence', () => {
    beforeEach(() => {
      mockUploadFile.mockResolvedValue({
        filename: 'uploaded.file',
        originalName: 'original.file',
        url: 'http://store.com',
        mimeType: 'application/octet-stream',
        size: 100
      });
    });

    it.each([
      ['audio.mp3', 'audio/mpeg', 'compositions'],
      ['audio-raw.wav', '', 'compositions'],
      ['data.xlsx', 'application/vnd.ms-excel', 'uploads'],
      ['document.pdf', 'application/pdf', 'uploads'],
      ['archive.zip', 'application/zip', 'uploads'],
      ['text.txt', 'text/plain', 'uploads']
    ])('should resolve correct backend file type and folder for %s', async (filename, mimeType, expectedDir) => {
      const user = userEvent.setup();
      const onClose = jest.fn<void, []>();
      const onApply = jest.fn<void, [MediaModalResult]>(() => {});
      const uploadResult: MediaModalResult = {
        selected: {
          kind: 'upload',
          id: 'test-id',
          fileName: filename,
          file: createMockFile(filename, mimeType)
        },
        crop: null
      };

      render(React.createElement(Harness, { open: true, onClose, onApply, customResult: uploadResult }));
      await user.click(screen.getByTestId('apply'));

      expect(mockUploadFile).toHaveBeenCalledWith(
        expect.any(Blob),
        expect.objectContaining({ directory: expectedDir })
      );
    });

    it('should directly use explicit directory prop when provided', async () => {
      const user = userEvent.setup();
      const onClose = jest.fn<void, []>();
      const onApply = jest.fn<void, [MediaModalResult]>(() => {});
      const uploadResult: MediaModalResult = {
        selected: {
          kind: 'upload',
          id: 'test-id',
          fileName: 'img.png',
          file: createMockFile('img.png', 'image/png')
        },
        crop: null
      };

      render(
        React.createElement(Harness, {
          open: true,
          onClose,
          onApply,
          directory: 'custom-folder',
          customResult: uploadResult
        })
      );
      await user.click(screen.getByTestId('apply'));

      expect(mockUploadFile).toHaveBeenCalledWith(
        expect.any(Blob),
        expect.objectContaining({ directory: 'custom-folder' })
      );
    });

    it('should invoke asset database persistence on upload success', async () => {
      const user = userEvent.setup();
      const onClose = jest.fn<void, []>();
      const onApply = jest.fn<void, [MediaModalResult]>(() => {});
      const uploadResult: MediaModalResult = {
        selected: {
          kind: 'upload',
          id: 'test-id',
          fileName: 'doc.pdf',
          file: createMockFile('doc.pdf', 'application/pdf')
        },
        crop: null
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: { createAsset: { id: 'asset-123' } } })
      });

      render(
        React.createElement(Harness, {
          open: true,
          onClose,
          onApply,
          persistUploadAsAsset: true,
          customResult: uploadResult
        })
      );
      await user.click(screen.getByTestId('apply'));

      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should throw an application error and set state if asset persistence fails', async () => {
      const user = userEvent.setup();
      const onClose = jest.fn<void, []>();
      const onApply = jest.fn<void, [MediaModalResult]>(() => {});
      const uploadResult: MediaModalResult = {
        selected: {
          kind: 'upload',
          id: 'test-id',
          fileName: 'doc.pdf',
          file: createMockFile('doc.pdf', 'application/pdf')
        },
        crop: null
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ errors: [{ message: 'GraphQL error' }] })
      });

      render(
        React.createElement(Harness, {
          open: true,
          onClose,
          onApply,
          persistUploadAsAsset: true,
          customResult: uploadResult
        })
      );
      await user.click(screen.getByTestId('apply'));

      expect(await screen.findByTestId('applyError')).toHaveTextContent(
        'Не вдалося створити запис файлу в базі даних.'
      );
    });

    it('should handle alternative error types on runtime exception catch', async () => {
      const user = userEvent.setup();
      const onClose = jest.fn<void, []>();
      const onApply = jest.fn<Promise<void>, [MediaModalResult]>(() => Promise.reject('String error raw'));

      render(React.createElement(Harness, { open: true, onClose, onApply }));
      await user.click(screen.getByTestId('apply'));

      expect(await screen.findByTestId('applyError')).toHaveTextContent(
        'Не вдалося застосувати зміни. Спробуйте ще раз.'
      );
    });

    it('should correctly clean application state via state callbacks', async () => {
      const user = userEvent.setup();
      const onClose = jest.fn<void, []>();
      const onApply = jest.fn<Promise<void>, [MediaModalResult]>(() => Promise.reject(new Error('error')));

      render(React.createElement(Harness, { open: true, onClose, onApply }));
      await user.click(screen.getByTestId('apply'));

      expect(await screen.findByTestId('applyError')).toHaveTextContent('error');

      await user.click(screen.getByTestId('clearError'));
      expect(screen.getByTestId('applyError')).toHaveTextContent('');

      await user.click(screen.getByTestId('clearState'));
      expect(screen.getByTestId('isApplying')).toHaveTextContent('false');
    });
  });

  it('should resolve correct folder for image type and fallback to empty string when file extension is missing', async () => {
    const user = userEvent.setup();
    const onClose = jest.fn<void, []>();
    const onApply = jest.fn<void, [MediaModalResult]>(() => {});
    const uploadResult: MediaModalResult = {
      selected: {
        kind: 'upload',
        id: 'test-id',
        fileName: '',
        file: createMockFile('', 'image/png')
      },
      crop: null
    };

    render(React.createElement(Harness, { open: true, onClose, onApply, customResult: uploadResult }));
    await user.click(screen.getByTestId('apply'));

    expect(mockUploadFile).toHaveBeenCalledWith(expect.any(Blob), expect.objectContaining({ directory: 'photos' }));
    await waitFor(() => expect(screen.getByTestId('isApplying')).toHaveTextContent('false'));
  });

  it('should reject redundant executions early if already in applying state', async () => {
    const user = userEvent.setup();
    const deferred = createDeferred<void>();
    const onClose = jest.fn<void, []>();
    const onApply = jest.fn<Promise<void>, [MediaModalResult]>(() => deferred.promise);

    render(React.createElement(Harness, { open: true, onClose, onApply }));

    await user.click(screen.getByTestId('apply'));
    await user.click(screen.getByTestId('apply'));

    expect(onApply).toHaveBeenCalledTimes(1);
    deferred.resolve(undefined);
    await waitFor(() => expect(screen.getByTestId('isApplying')).toHaveTextContent('false'));
  });

  it('should interrupt ongoing flow operations safely if request becomes stale mid-flight', async () => {
    const user = userEvent.setup();
    const deferred =
      createDeferred<
        Partial<{ filename: string; originalName: string; url: string; mimeType: string; size: number }>
      >();

    mockUploadFile.mockReturnValueOnce(deferred.promise);

    const onClose = jest.fn<void, []>();
    const onApply = jest.fn<void, [MediaModalResult]>(() => {});
    const uploadResult: MediaModalResult = {
      selected: {
        kind: 'upload',
        id: 'test-id',
        fileName: 'doc.pdf',
        file: createMockFile('doc.pdf', 'application/pdf')
      },
      crop: null
    };

    render(React.createElement(Harness, { open: true, onClose, onApply, customResult: uploadResult }));

    await user.click(screen.getByTestId('apply'));
    await user.click(screen.getByTestId('cancel'));

    deferred.resolve({ filename: 'stale.file' });
    expect(onApply).not.toHaveBeenCalled();
    await waitFor(() => expect(screen.getByTestId('isApplying')).toHaveTextContent('false'));
  });
});
