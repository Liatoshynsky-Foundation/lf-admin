import { act, renderHook } from '@testing-library/react';

import { useAutosavedDescription } from './useAutosavedDescription';

type Props = {
  fileId?: string;
  onSave?: (fileId: string, value: string) => Promise<void> | void;
};

describe('useAutosavedDescription', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });
  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('initializes draft/lastCommitted from initialValue', () => {
    const { result } = renderHook(() =>
      useAutosavedDescription({
        fileId: 'f1',
        initialValue: 'hello',
        debounceMs: 1800,
        onSave: jest.fn()
      })
    );

    expect(result.current.draft).toBe('hello');
    expect(result.current.lastCommitted).toBe('hello');
  });

  it('resets draft/lastCommitted when fileId or initialValue changes', () => {
    const onSave = jest.fn();

    const { result, rerender } = renderHook(
      ({ fileId, initialValue }) => useAutosavedDescription({ fileId, initialValue, debounceMs: 1800, onSave }),
      { initialProps: { fileId: 'f1', initialValue: 'a' } }
    );

    act(() => result.current.setDraft('changed'));
    expect(result.current.draft).toBe('changed');

    rerender({ fileId: 'f2', initialValue: 'b' });
    expect(result.current.draft).toBe('b');
    expect(result.current.lastCommitted).toBe('b');
  });

  it('does not autosave when fileId or onSave missing', () => {
    const onSave = jest.fn<void, [string, string]>();

    const initialProps: Props = { fileId: undefined, onSave };

    const { result, rerender } = renderHook(
      (props: Props) =>
        useAutosavedDescription({
          fileId: props.fileId,
          initialValue: 'x',
          debounceMs: 1800,
          onSave: props.onSave
        }),
      { initialProps: initialProps satisfies Props }
    );

    act(() => result.current.setDraft('y'));
    act(() => jest.advanceTimersByTime(2000));
    expect(onSave).not.toHaveBeenCalled();

    rerender({ fileId: 'f1', onSave: undefined });
    act(() => result.current.setDraft('z'));
    act(() => jest.advanceTimersByTime(2000));
    expect(onSave).not.toHaveBeenCalled();
  });

  it('autosaves after debounce if draft differs from lastCommitted', async () => {
    const onSave = jest.fn().mockResolvedValue(undefined);

    const { result } = renderHook(() =>
      useAutosavedDescription({
        fileId: 'f1',
        initialValue: 'old',
        debounceMs: 1800,
        onSave
      })
    );

    act(() => result.current.setDraft('new'));
    expect(onSave).not.toHaveBeenCalled();

    act(() => jest.advanceTimersByTime(1799));
    expect(onSave).not.toHaveBeenCalled();

    await act(async () => {
      jest.advanceTimersByTime(2);
      await Promise.resolve();
    });

    expect(onSave).toHaveBeenCalledWith('f1', 'new');
    expect(result.current.lastCommitted).toBe('new');
  });

  it('does not autosave when draft equals lastCommitted', () => {
    const onSave = jest.fn();

    const { result } = renderHook(() =>
      useAutosavedDescription({
        fileId: 'f1',
        initialValue: 'same',
        debounceMs: 1800,
        onSave
      })
    );

    act(() => result.current.setDraft('same'));
    act(() => jest.advanceTimersByTime(2000));
    expect(onSave).not.toHaveBeenCalled();
  });

  it('commit saves immediately (and updates lastCommitted)', async () => {
    const onSave = jest.fn().mockResolvedValue(undefined);

    const { result } = renderHook(() =>
      useAutosavedDescription({
        fileId: 'f1',
        initialValue: 'a',
        debounceMs: 1800,
        onSave
      })
    );

    await act(async () => {
      await result.current.commit('b');
    });

    expect(onSave).toHaveBeenCalledWith('f1', 'b');
    expect(result.current.lastCommitted).toBe('b');
  });

  it('commit does nothing when value equals lastCommitted', async () => {
    const onSave = jest.fn().mockResolvedValue(undefined);

    const { result } = renderHook(() =>
      useAutosavedDescription({
        fileId: 'f1',
        initialValue: 'a',
        debounceMs: 1800,
        onSave
      })
    );

    await act(async () => {
      await result.current.commit('a');
    });

    expect(onSave).not.toHaveBeenCalled();
  });

  it('handles onSave errors without throwing', async () => {
    const onSave = jest.fn().mockRejectedValue(new Error('fail'));

    const { result } = renderHook(() =>
      useAutosavedDescription({
        fileId: 'f1',
        initialValue: 'a',
        debounceMs: 1800,
        onSave
      })
    );

    await act(async () => {
      await result.current.commit('b');
    });

    expect(onSave).toHaveBeenCalledWith('f1', 'b');
    expect(result.current.lastCommitted).toBe('a');
  });
});
