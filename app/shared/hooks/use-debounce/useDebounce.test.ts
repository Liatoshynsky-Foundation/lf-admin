import { describe, expect, it, jest } from '@jest/globals';
import { act, renderHook, waitFor } from '@testing-library/react';

import { useDebounce } from './useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 300));
    expect(result.current).toBe('initial');
  });

  it('should debounce value changes', async () => {
    const { result, rerender } = renderHook(({ value, delay }) => useDebounce(value, delay), {
      initialProps: { value: 'initial', delay: 300 }
    });

    expect(result.current).toBe('initial');

    rerender({ value: 'updated', delay: 300 });
    expect(result.current).toBe('initial');

    act(() => {
      jest.advanceTimersByTime(300);
    });

    await waitFor(() => {
      expect(result.current).toBe('updated');
    });
  });

  it('should cancel previous timeout on rapid changes', async () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
      initialProps: { value: 'initial' }
    });

    rerender({ value: 'first' });
    act(() => {
      jest.advanceTimersByTime(100);
    });

    rerender({ value: 'second' });
    act(() => {
      jest.advanceTimersByTime(100);
    });

    rerender({ value: 'final' });
    act(() => {
      jest.advanceTimersByTime(300);
    });

    await waitFor(() => {
      expect(result.current).toBe('final');
    });
  });

  it('should handle different delay values', async () => {
    const { result, rerender } = renderHook(({ value, delay }) => useDebounce(value, delay), {
      initialProps: { value: 'initial', delay: 500 }
    });

    rerender({ value: 'updated', delay: 500 });
    act(() => {
      jest.advanceTimersByTime(500);
    });

    await waitFor(() => {
      expect(result.current).toBe('updated');
    });
  });

  it('should work with non-string values', async () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), { initialProps: { value: 0 } });

    expect(result.current).toBe(0);

    rerender({ value: 42 });
    act(() => {
      jest.advanceTimersByTime(300);
    });

    await waitFor(() => {
      expect(result.current).toBe(42);
    });
  });

  it('should use default delay of 200ms when not provided', async () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value), { initialProps: { value: 'initial' } });

    rerender({ value: 'updated' });
    act(() => {
      jest.advanceTimersByTime(200);
    });

    await waitFor(() => {
      expect(result.current).toBe('updated');
    });
  });
});
