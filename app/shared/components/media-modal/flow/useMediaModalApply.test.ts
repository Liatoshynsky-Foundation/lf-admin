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

type HarnessProps = {
  open: boolean;
  onClose: jest.Mock<void, []>;
  onApply: jest.Mock<Promise<void> | void, [MediaModalResult]>;
};

function Harness({ open, onClose, onApply }: HarnessProps): ReactElement {
  const { isApplying, applyError, clearApplyError, cancelInFlightApply, handleClose, runApply } = useMediaModalApply({
    open,
    onClose,
    onApply
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
          void runApply(demoResult);
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
    )
  ]);
}

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

  it('should set applyError and keep open when onApply rejects with Error', async () => {
    const user = userEvent.setup();

    const onClose = jest.fn<void, []>();
    const onApply = jest.fn<Promise<void>, [MediaModalResult]>(() => Promise.reject(new Error('apply failed')));

    render(React.createElement(Harness, { open: true, onClose, onApply }));

    await user.click(screen.getByTestId('apply'));

    expect(await screen.findByTestId('applyError')).toHaveTextContent('apply failed');
    expect(onClose).not.toHaveBeenCalled();
  });

  it('should set fallback applyError when onApply rejects with non-Error', async () => {
    const user = userEvent.setup();

    const onClose = jest.fn<void, []>();
    const onApply = jest.fn<Promise<void>, [MediaModalResult]>(() => Promise.reject('boom'));

    render(React.createElement(Harness, { open: true, onClose, onApply }));

    await user.click(screen.getByTestId('apply'));

    expect(await screen.findByTestId('applyError')).toHaveTextContent(
      'Не вдалося застосувати зміни. Спробуйте ще раз.'
    );
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

    // if the old promise resolves, it must not close
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
});
