import { act, renderHook } from '@testing-library/react';
import toast from 'react-hot-toast';

import { FundErrors } from '~/constants/errors';
import { BaseContentStatuses } from '~/types/enums/common.enums';

const mockUseParams = jest.fn();
jest.mock('next/navigation', () => ({
  __esModule: true,
  useParams: () => mockUseParams()
}));

jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: { success: jest.fn(), error: jest.fn() }
}));

const mockResolveLocalizedText = jest.fn();
const mockTextToProse = jest.fn();
jest.mock('~/lib/utils/prose', () => ({
  __esModule: true,
  resolveLocalizedText: (...args: unknown[]) => mockResolveLocalizedText(...args),
  textToProse: (...args: unknown[]) => mockTextToProse(...args)
}));

const mockCreateFund = jest.fn();
const mockUpdateFund = jest.fn();
const mockUseFundById = jest.fn();

jest.mock('~/shared/hooks/use-funds/useFunds', () => ({
  __esModule: true,
  useCreateFund: () => [mockCreateFund, { loading: false }],
  useUpdateFund: () => [mockUpdateFund, { loading: false }],
  useFundById: (...args: unknown[]) => mockUseFundById(...args)
}));

import { useUpsertFund } from './useUpsertFund';

const emptyDoc = { type: 'doc', content: [] };

describe('useUpsertFund', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseParams.mockReturnValue({});
    mockUseFundById.mockReturnValue({ data: undefined });
    mockResolveLocalizedText.mockImplementation((value: unknown) => (typeof value === 'string' ? value : ''));
    mockTextToProse.mockReturnValue(emptyDoc);
  });

  const validDetails = {
    fundNumber: '5',
    name: { uk: 'Назва', en: 'Name' },
    documentCreationDate: '1900',
    chronologicalBoundaries: '',
    organizationForm: { uk: '', en: '' },
    description: { uk: emptyDoc, en: emptyDoc },
    casesCount: 0,
    descriptionsCount: 0
  };

  const setValidDetails = (result: { current: ReturnType<typeof useUpsertFund> }) => {
    act(() => {
      result.current.setDetails(() => validDetails);
    });
  };

  describe('mode', () => {
    it('is create mode when there is no id param', () => {
      mockUseParams.mockReturnValue({});
      const { result } = renderHook(() => useUpsertFund());
      expect(result.current.details).toEqual(expect.objectContaining({ fundNumber: '' }));
    });

    it('populates details from the fetched fund when an id param is present', () => {
      mockUseParams.mockReturnValue({ id: 'abc123' });
      mockUseFundById.mockReturnValue({
        data: {
          findFundById: {
            fundNumber: 7,
            name: { uk: 'Архів', en: 'Archive' },
            documentCreationDate: { uk: '1905' },
            chronologicalBoundaries: { uk: '1905-1910' },
            organizationForm: { uk: 'Форма', en: 'Form' },
            description: { uk: null, en: null },
            casesCount: 2,
            descriptionsCount: 4
          }
        }
      });

      const { result } = renderHook(() => useUpsertFund());

      expect(result.current.details.fundNumber).toBe('7');
      expect(result.current.details.name).toEqual({ uk: 'Архів', en: 'Archive' });
      expect(result.current.details.documentCreationDate).toBe('1905');
      expect(result.current.details.chronologicalBoundaries).toBe('1905-1910');
      expect(result.current.details.casesCount).toBe(2);
      expect(result.current.details.descriptionsCount).toBe(4);
    });
    it('parses description correctly when it is a valid JSON doc string', () => {
      mockUseParams.mockReturnValue({ id: 'valid-json' });
      mockUseFundById.mockReturnValue({
        data: {
          findFundById: {
            description: { uk: '{"type":"doc","content":[]}', en: null }
          }
        }
      });

      const { result } = renderHook(() => useUpsertFund());

      expect(result.current.details.description.uk).toEqual({ type: 'doc', content: [] });
    });

    it('falls back to textToProse when description is an invalid JSON string', () => {
      mockUseParams.mockReturnValue({ id: 'invalid-json' });
      mockUseFundById.mockReturnValue({
        data: {
          findFundById: {
            description: { uk: 'just some plain text', en: null }
          }
        }
      });

      renderHook(() => useUpsertFund());

      expect(mockTextToProse).toHaveBeenCalledWith('just some plain text');
    });

    it('falls back to textToProse when description is valid JSON but not a doc object', () => {
      mockUseParams.mockReturnValue({ id: 'not-doc' });
      mockUseFundById.mockReturnValue({
        data: {
          findFundById: {
            description: { uk: '{"type":"paragraph"}', en: null }
          }
        }
      });

      renderHook(() => useUpsertFund());

      expect(mockTextToProse).toHaveBeenCalledWith('{"type":"paragraph"}');
    });
  });

  describe('validation', () => {
    it('fails when fundNumber is empty', async () => {
      const { result } = renderHook(() => useUpsertFund());
      setValidDetails(result);
      act(() => {
        result.current.setDetails((prev) => ({ ...prev, fundNumber: '' }));
      });

      let saved: string | null = 'unset';
      await act(async () => {
        saved = await result.current.handleSave(BaseContentStatuses.Draft);
      });

      expect(saved).toBeNull();
      expect(result.current.errors.fundNumber).toBeDefined();
      expect(mockCreateFund).not.toHaveBeenCalled();
    });

    it('fails when fundNumber is not a positive integer', async () => {
      const { result } = renderHook(() => useUpsertFund());
      setValidDetails(result);
      act(() => {
        result.current.setDetails((prev) => ({ ...prev, fundNumber: '-3' }));
      });

      await act(async () => {
        await result.current.handleSave(BaseContentStatuses.Draft);
      });

      expect(result.current.errors.fundNumber).toBeDefined();
    });

    it('fails when name.uk is empty', async () => {
      const { result } = renderHook(() => useUpsertFund());
      setValidDetails(result);
      act(() => {
        result.current.setDetails((prev) => ({ ...prev, name: { uk: '', en: 'Name' } }));
      });

      await act(async () => {
        await result.current.handleSave(BaseContentStatuses.Draft);
      });

      expect(result.current.errors.name).toBeDefined();
    });

    it('fails when name.uk exceeds 40 characters', async () => {
      const { result } = renderHook(() => useUpsertFund());
      setValidDetails(result);
      act(() => {
        result.current.setDetails((prev) => ({ ...prev, name: { uk: 'a'.repeat(41), en: 'Name' } }));
      });

      await act(async () => {
        await result.current.handleSave(BaseContentStatuses.Draft);
      });

      expect(result.current.errors.name).toBeDefined();
    });

    it('fails when documentCreationDate is empty', async () => {
      const { result } = renderHook(() => useUpsertFund());
      setValidDetails(result);
      act(() => {
        result.current.setDetails((prev) => ({ ...prev, documentCreationDate: '' }));
      });

      await act(async () => {
        await result.current.handleSave(BaseContentStatuses.Draft);
      });

      expect(result.current.errors.documentCreationDate).toBeDefined();
    });

    it('fails when documentCreationDate exceeds 150 characters', async () => {
      const { result } = renderHook(() => useUpsertFund());
      setValidDetails(result);
      act(() => {
        result.current.setDetails((prev) => ({ ...prev, documentCreationDate: 'a'.repeat(151) }));
      });

      await act(async () => {
        await result.current.handleSave(BaseContentStatuses.Draft);
      });

      expect(result.current.errors.documentCreationDate).toBeDefined();
    });

    it('fails when chronologicalBoundaries exceeds 150 characters', async () => {
      const { result } = renderHook(() => useUpsertFund());
      setValidDetails(result);
      act(() => {
        result.current.setDetails((prev) => ({ ...prev, chronologicalBoundaries: 'a'.repeat(151) }));
      });

      await act(async () => {
        await result.current.handleSave(BaseContentStatuses.Draft);
      });

      expect(result.current.errors.chronologicalBoundaries).toBeDefined();
    });

    it('fails when organizationForm.uk exceeds 150 characters', async () => {
      const { result } = renderHook(() => useUpsertFund());
      setValidDetails(result);
      act(() => {
        result.current.setDetails((prev) => ({ ...prev, organizationForm: { uk: 'a'.repeat(151), en: '' } }));
      });

      await act(async () => {
        await result.current.handleSave(BaseContentStatuses.Draft);
      });

      expect(result.current.errors.organizationForm).toBeDefined();
    });

    it('fails when the description text exceeds 1000 characters', async () => {
      mockResolveLocalizedText.mockReturnValue('a'.repeat(1001));
      mockCreateFund.mockResolvedValue({ data: { createFund: { id: 'new-id' } } });

      const { result } = renderHook(() => useUpsertFund());
      setValidDetails(result);

      await act(async () => {
        await result.current.handleSave(BaseContentStatuses.Draft);
      });

      expect(result.current.errors.description).toBeDefined();
      expect(mockCreateFund).not.toHaveBeenCalled();
    });
    
    it('validates correctly when chronologicalBoundaries is an object (edge case)', async () => {
      const { result } = renderHook(() => useUpsertFund());
      setValidDetails(result);
      act(() => {
        result.current.setDetails((prev) => ({ 
          ...prev,
          chronologicalBoundaries: { uk: 'a'.repeat(151) } as any
        }));
      });

      await act(async () => {
        await result.current.handleSave(BaseContentStatuses.Draft);
      });

      expect(result.current.errors.chronologicalBoundaries).toBeDefined();
    });

    it('validates successfully when description resolves to null or empty', async () => {
      mockResolveLocalizedText.mockReturnValue(null);
      mockCreateFund.mockResolvedValue({ data: { createFund: { id: 'new-id' } } });
      
      const { result } = renderHook(() => useUpsertFund());
      setValidDetails(result);

      let saved: string | null = null;
      await act(async () => {
        saved = await result.current.handleSave(BaseContentStatuses.Draft);
      });

      expect(saved).toBe('new-id');
      expect(result.current.errors.description).toBeUndefined();
    });
  });

  describe('handleSave — create mode', () => {
    it('creates a fund, marks it saved, and returns the new id on success', async () => {
      mockCreateFund.mockResolvedValue({ data: { createFund: { id: 'new-id' } } });
      const { result } = renderHook(() => useUpsertFund());
      setValidDetails(result);

      let saved: string | null = null;
      await act(async () => {
        saved = await result.current.handleSave(BaseContentStatuses.Draft);
      });

      expect(saved).toBe('new-id');
      expect(mockCreateFund).toHaveBeenCalled();
      expect(result.current.isSaved).toBe(true);
      expect(toast.success).toHaveBeenCalled();
    });

    it('shows the published success toast when saving with Published status', async () => {
      mockCreateFund.mockResolvedValue({ data: { createFund: { id: 'new-id' } } });
      const { result } = renderHook(() => useUpsertFund());
      setValidDetails(result);

      await act(async () => {
        await result.current.handleSave(BaseContentStatuses.Published);
      });

      expect(toast.success).toHaveBeenCalledWith('Фонд опубліковано.');
    });

    it('returns null when the create mutation does not return an id', async () => {
      mockCreateFund.mockResolvedValue({ data: { createFund: null } });
      const { result } = renderHook(() => useUpsertFund());
      setValidDetails(result);

      let saved: string | null = 'unset';
      await act(async () => {
        saved = await result.current.handleSave(BaseContentStatuses.Draft);
      });

      expect(saved).toBeNull();
    });

    it('sets a duplicate-number field error when the backend reports a duplicate', async () => {
      mockCreateFund.mockRejectedValue(new Error('фонд з таким номером уже існує'));
      const { result } = renderHook(() => useUpsertFund());
      setValidDetails(result);

      await act(async () => {
        await result.current.handleSave(BaseContentStatuses.Draft);
      });

      expect(result.current.errors.fundNumber).toBeDefined();
      expect(toast.error).toHaveBeenCalled();
    });

    it('maps a backend zod validation error array onto field errors', async () => {
      const zodMessage = JSON.stringify([{ path: ['name'], message: 'Назва є обов’язковою' }]);
      mockCreateFund.mockRejectedValue(new Error(`Validation failed ${zodMessage}`));
      const { result } = renderHook(() => useUpsertFund());
      setValidDetails(result);

      await act(async () => {
        await result.current.handleSave(BaseContentStatuses.Draft);
      });

      expect(result.current.errors.name).toBe('Назва є обов’язковою');
      expect(toast.error).toHaveBeenCalled();
    });

    it('falls back to a generic error toast for unrecognised errors', async () => {
      mockCreateFund.mockRejectedValue(new Error('network exploded'));
      const { result } = renderHook(() => useUpsertFund());
      setValidDetails(result);

      await act(async () => {
        await result.current.handleSave(BaseContentStatuses.Draft);
      });

      expect(toast.error).toHaveBeenCalledWith(FundErrors.FAILED_TO_CREATE);
    });
    it('ignores backend errors that do not have a path array and falls back to generic error', async () => {
      const zodMessage = JSON.stringify([{ message: 'Some global validation error without path' }]);
      mockCreateFund.mockRejectedValue(new Error(`Validation failed ${zodMessage}`));
      
      const { result } = renderHook(() => useUpsertFund());
      setValidDetails(result);

      await act(async () => {
        await result.current.handleSave(BaseContentStatuses.Draft);
      });

      expect(toast.error).toHaveBeenCalledWith(FundErrors.FAILED_TO_CREATE);
    });

    it('handles JSON parsing errors silently when regex matches but content is invalid', async () => {
      const badJsonMatch = '[ { bad, json: } ]';
      mockCreateFund.mockRejectedValue(new Error(`Validation error ${badJsonMatch}`));
      
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      const { result } = renderHook(() => useUpsertFund());
      setValidDetails(result);

      await act(async () => {
        await result.current.handleSave(BaseContentStatuses.Draft);
      });

      expect(consoleSpy).toHaveBeenCalledWith('Failed to save fund:', expect.any(Error));
      expect(toast.error).toHaveBeenCalledWith(FundErrors.FAILED_TO_CREATE);
      
      consoleSpy.mockRestore();
    });
    
    it('ignores parsed errors if they are not an array', async () => {
      const zodMessage = JSON.stringify({ path: ['name'], message: 'Error' });
      mockCreateFund.mockRejectedValue(new Error(`Validation failed [ ${zodMessage} ]`));
      
      const { result } = renderHook(() => useUpsertFund());
      setValidDetails(result);

      await act(async () => {
        await result.current.handleSave(BaseContentStatuses.Draft);
      });

      expect(toast.error).toHaveBeenCalledWith(FundErrors.FAILED_TO_CREATE);
    });
  });

  describe('handleSave — edit mode', () => {
    beforeEach(() => {
      mockUseParams.mockReturnValue({ id: 'existing-id' });
      mockUseFundById.mockReturnValue({ data: undefined });
    });

    it('updates the fund and returns its id on success', async () => {
      mockUpdateFund.mockResolvedValue({ data: { updateFund: { id: 'existing-id' } } });
      const { result } = renderHook(() => useUpsertFund());
      setValidDetails(result);

      let saved: string | null = null;
      await act(async () => {
        saved = await result.current.handleSave(BaseContentStatuses.Draft);
      });

      expect(saved).toBe('existing-id');
      expect(mockUpdateFund).toHaveBeenCalledWith(expect.objectContaining({ id: 'existing-id' }));
      expect(result.current.isSaved).toBe(true);
    });

    it('returns null when the update mutation does not return an id', async () => {
      mockUpdateFund.mockResolvedValue({ data: { updateFund: null } });
      const { result } = renderHook(() => useUpsertFund());
      setValidDetails(result);

      let saved: string | null = 'unset';
      await act(async () => {
        saved = await result.current.handleSave(BaseContentStatuses.Draft);
      });

      expect(saved).toBeNull();
    });
  });

  it('includes optional fields (chronologicalBoundaries, organizationForm) in payload if provided', async () => {
    mockCreateFund.mockResolvedValue({ data: { createFund: { id: 'new-id' } } });
    const { result } = renderHook(() => useUpsertFund());
    setValidDetails(result);
      
    act(() => {
      result.current.setDetails((prev) => ({ 
        ...prev, 
        chronologicalBoundaries: '1900-1920',
        organizationForm: { uk: 'Організація', en: 'Organization' }
      }));
    });

    await act(async () => {
      await result.current.handleSave(BaseContentStatuses.Draft);
    });

    expect(mockCreateFund).toHaveBeenCalledWith(
      expect.objectContaining({
        chronologicalBoundaries: { uk: '1900-1920', en: '1900-1920' },
        organizationForm: { uk: 'Організація', en: 'Organization' }
      })
    );
  });

  it('handles exceptions thrown as strings instead of Error objects', async () => {
    mockCreateFund.mockRejectedValue('уже існує string error');
      
    const { result } = renderHook(() => useUpsertFund());
    setValidDetails(result);

    await act(async () => {
      await result.current.handleSave(BaseContentStatuses.Draft);
    });

    expect(result.current.errors.fundNumber).toBeDefined();
    expect(toast.error).toHaveBeenCalled();
  });
});