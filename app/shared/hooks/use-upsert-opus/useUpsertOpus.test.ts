import { act, renderHook } from '@testing-library/react';

import { useUpsertOpus } from './useUpsertOpus';
import { BaseContentStatuses } from '~/types/enums/common.enums';

const mockCreateOpus = jest.fn();
const mockUpdateOpus = jest.fn();

jest.mock('~/shared/hooks/use-opuses/useOpuses', () => ({
  useCreateOpus: () => [mockCreateOpus],
  useUpdateOpus: () => [mockUpdateOpus],
  useOpusById: () => ({ data: undefined, loading: false })
}));

describe('useUpsertOpus', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('initialises with empty details and no errors', () => {
    const { result } = renderHook(() => useUpsertOpus());

    expect(result.current.details.name).toBe('');
    expect(result.current.detailsErrors).toEqual({ number: '', name: '', creationYear: '' });
    expect(result.current.isEditing).toBe(false);
  });

  it('does not submit and sets errors when required fields are missing', async () => {
    const { result } = renderHook(() => useUpsertOpus());

    let returnedId: string | undefined;
    await act(async () => {
      returnedId = await result.current.handleSave(BaseContentStatuses.Draft);
    });

    expect(returnedId).toBeUndefined();
    expect(mockCreateOpus).not.toHaveBeenCalled();
    expect(result.current.detailsErrors.number).toBeTruthy();
    expect(result.current.detailsErrors.name).toBeTruthy();
    expect(result.current.forceShowErrors).toBe(true);
  });

  it('creates an opus with mapped input when valid', async () => {
    mockCreateOpus.mockResolvedValue({ data: { createOpus: { id: 'opus-99' } } });

    const { result } = renderHook(() => useUpsertOpus());

    act(() => {
      result.current.setDetails((prev) => ({
        ...prev,
        number: '42',
        name: 'Соната',
        creationYear: '1922',
        genre: 'Соната',
        compositions: [
          { id: 'c1', title: 'Перший твір', genre: 'Соната', year: '1920', audios: [], notes: [] }
        ]
      }));
    });

    let returnedId: string | undefined;
    await act(async () => {
      returnedId = await result.current.handleSave(BaseContentStatuses.Draft);
    });

    expect(returnedId).toBe('opus-99');
    expect(mockCreateOpus).toHaveBeenCalledTimes(1);

    const payload = mockCreateOpus.mock.calls[0][0];
    expect(payload).toEqual(
      expect.objectContaining({
        numberKind: 'op',
        number: '42',
        name: 'Соната',
        adminTitle: 'Соната'
      })
    );
    expect(payload.compositions[0]).toEqual(
      expect.objectContaining({ title: 'Перший твір', genre: 'Соната', year: '1920' })
    );
    expect(result.current.isSaved).toBe(true);
  });
});
