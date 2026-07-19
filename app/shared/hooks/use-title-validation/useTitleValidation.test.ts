import { act, renderHook } from '@testing-library/react';

import { useTitleValidation } from './useTitleValidation';
import { createDocNode } from '~/__mocks__/utils';

const mockSetFieldValidity = jest.fn();

jest.mock('~/store', () => ({
  useStore: (selector: (state: { setFieldValidity: typeof mockSetFieldValidity }) => unknown) =>
    selector({ setFieldValidity: mockSetFieldValidity })
}));

const KEY = 'privacy-policy:Cookies:title';
const emptyDoc = { type: 'doc', content: [] };

describe('useTitleValidation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should report no error before the field is touched, even when the value is empty', () => {
    const { result } = renderHook(() => useTitleValidation(KEY, emptyDoc));

    expect(result.current.error).toBe(false);
    expect(result.current.helperText).toBeUndefined();
    expect(mockSetFieldValidity).toHaveBeenLastCalledWith(KEY, false);
  });

  it('should report an error after blur when the value is empty', () => {
    const { result, rerender } = renderHook(({ value }) => useTitleValidation(KEY, value), {
      initialProps: { value: emptyDoc }
    });

    act(() => {
      result.current.onBlur();
    });
    rerender({ value: emptyDoc });

    expect(result.current.error).toBe(true);
    expect(result.current.helperText).toBe('Заголовок не може бути порожнім');
    expect(mockSetFieldValidity).toHaveBeenLastCalledWith(KEY, true);
  });

  it('should clear the error once the value becomes non-empty after being touched', () => {
    const { result, rerender } = renderHook(({ value }) => useTitleValidation(KEY, value), {
      initialProps: { value: emptyDoc }
    });

    act(() => {
      result.current.onBlur();
    });
    rerender({ value: emptyDoc });
    expect(result.current.error).toBe(true);

    rerender({ value: createDocNode('Some title') });
    expect(result.current.error).toBe(false);
    expect(mockSetFieldValidity).toHaveBeenLastCalledWith(KEY, false);
  });

  it('should clear the invalid flag in the store on unmount', () => {
    const { result, rerender, unmount } = renderHook(({ value }) => useTitleValidation(KEY, value), {
      initialProps: { value: emptyDoc }
    });

    act(() => {
      result.current.onBlur();
    });
    rerender({ value: emptyDoc });
    expect(mockSetFieldValidity).toHaveBeenLastCalledWith(KEY, true);

    unmount();

    expect(mockSetFieldValidity).toHaveBeenLastCalledWith(KEY, false);
  });

  it('should treat an undefined value as empty', () => {
    const { result } = renderHook(() => useTitleValidation(KEY, undefined));

    act(() => {
      result.current.onBlur();
    });

    expect(result.current.error).toBe(true);
  });
});
