import { act, render } from '@testing-library/react';
import React, { useRef } from 'react';

import { useNonPassiveWheel } from './useNonPassiveWheel';

type HarnessProps = Readonly<{
  enabled: boolean;
  onWheel: (e: WheelEvent) => void;
}>;

function Harness({ enabled, onWheel }: HarnessProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  useNonPassiveWheel(ref, { enabled, onWheel });

  return <div data-testid="target" ref={ref} />;
}

describe('useNonPassiveWheel', () => {
  test('adds wheel listener with passive:false when enabled', () => {
    const addSpy = jest.spyOn(HTMLElement.prototype, 'addEventListener');
    const onWheel = jest.fn();

    const { getByTestId, unmount } = render(<Harness enabled={true} onWheel={onWheel} />);

    const el = getByTestId('target') as HTMLDivElement;

    const calls = addSpy.mock.calls.filter(([type]) => type === 'wheel');

    expect(calls.length).toBeGreaterThan(0);

    const hasPassiveFalse = calls.some(([, , options]) => {
      if (!options) return false;
      if (typeof options === 'boolean') return false;
      return (options as AddEventListenerOptions).passive === false;
    });

    expect(hasPassiveFalse).toBe(true);

    const evt = new WheelEvent('wheel', { deltaY: 100 });
    act(() => el.dispatchEvent(evt));
    expect(onWheel).toHaveBeenCalledTimes(1);
    expect(onWheel.mock.calls[0][0]).toBe(evt);

    unmount();
    addSpy.mockRestore();
  });

  test('does not add listener when disabled', () => {
    type AddCall = {
      target: EventTarget;
      type: string;
      listener: EventListenerOrEventListenerObject;
      options?: boolean | AddEventListenerOptions;
    };

    const calls: AddCall[] = [];

    const original = HTMLElement.prototype.addEventListener;

    const addSpy = jest.spyOn(HTMLElement.prototype, 'addEventListener').mockImplementation(function (
      this: HTMLElement,
      type: string,
      listener: EventListenerOrEventListenerObject,
      options?: boolean | AddEventListenerOptions
    ) {
      calls.push({ target: this, type, listener, options });
      return original.call(this, type, listener, options);
    });

    const onWheel = jest.fn();

    const { getByTestId } = render(<Harness enabled={false} onWheel={onWheel} />);
    const el = getByTestId('target') as HTMLDivElement;

    const wheelCallsForOurEl = calls.filter((c) => c.target === el && c.type === 'wheel');

    expect(wheelCallsForOurEl).toHaveLength(0);

    addSpy.mockRestore();
  });

  test('removes listener on unmount', () => {
    const removeSpy = jest.spyOn(HTMLElement.prototype, 'removeEventListener');
    const onWheel = jest.fn();

    const { unmount } = render(<Harness enabled={true} onWheel={onWheel} />);
    unmount();

    const calls = removeSpy.mock.calls.filter(([type]) => type === 'wheel');
    expect(calls.length).toBeGreaterThan(0);

    removeSpy.mockRestore();
  });

  test('removes listener when enabled becomes false', () => {
    const removeSpy = jest.spyOn(HTMLElement.prototype, 'removeEventListener');
    const onWheel = jest.fn();

    const { rerender } = render(<Harness enabled={true} onWheel={onWheel} />);
    rerender(<Harness enabled={false} onWheel={onWheel} />);

    const calls = removeSpy.mock.calls.filter(([type]) => type === 'wheel');
    expect(calls.length).toBeGreaterThan(0);

    removeSpy.mockRestore();
  });

  test('re-subscribes when onWheel changes (old removed, new added)', () => {
    const addSpy = jest.spyOn(HTMLElement.prototype, 'addEventListener');
    const removeSpy = jest.spyOn(HTMLElement.prototype, 'removeEventListener');

    const onWheel1 = jest.fn();
    const onWheel2 = jest.fn();

    const { getByTestId, rerender } = render(<Harness enabled={true} onWheel={onWheel1} />);

    const el = getByTestId('target') as HTMLDivElement;

    rerender(<Harness enabled={true} onWheel={onWheel2} />);

    const evt = new WheelEvent('wheel', { deltaY: 1 });
    act(() => el.dispatchEvent(evt));

    expect(onWheel1).toHaveBeenCalledTimes(0);
    expect(onWheel2).toHaveBeenCalledTimes(1);

    const removedWheel = removeSpy.mock.calls.some(([type]) => type === 'wheel');
    expect(removedWheel).toBe(true);

    const addedWheel = addSpy.mock.calls.some(([type]) => type === 'wheel');
    expect(addedWheel).toBe(true);

    addSpy.mockRestore();
    removeSpy.mockRestore();
  });
});
