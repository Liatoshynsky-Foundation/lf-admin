import { act, renderHook } from '@testing-library/react';
import toast from 'react-hot-toast';

import { FondErrors } from '~/constants/errors';
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

const mockCreateFond = jest.fn();
const mockUpdateFond = jest.fn();
const mockUseFondById = jest.fn();

jest.mock('~/shared/hooks/use-fonds/useFonds', () => ({
  __esModule: true,
  useCreateFond: () => [mockCreateFond, { loading: false }],
  useUpdateFond: () => [mockUpdateFond, { loading: false }],
  useFondById: (...args: unknown[]) => mockUseFondById(...args)
}));

import { useUpsertFond } from './useUpsertFond';

const emptyDoc = { type: 'doc', content: [] };

describe('useUpsertFond', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseParams.mockReturnValue({});
    mockUseFondById.mockReturnValue({ data: undefined });
    mockResolveLocalizedText.mockImplementation((value: unknown) => (typeof value === 'string' ? value : ''));
    mockTextToProse.mockReturnValue(emptyDoc);
  });

  const validDetails = {
    fondNumber: '5',
    name: { uk: 'Назва', en: 'Name' },
    documentCreationDate: '1900',
    chronologicalBoundaries: '',
    organizationForm: { uk: '', en: '' },
    description: { uk: emptyDoc, en: emptyDoc },
    casesCount: 0,
    descriptionsCount: 0
  };

  const setValidDetails = (result: { current: ReturnType<typeof useUpsertFond> }) => {
    act(() => {
      result.current.setDetails(() => validDetails);
    });
  };

  describe('mode', () => {
    it('is create mode when there is no id param', () => {
      mockUseParams.mockReturnValue({});
      const { result } = renderHook(() => useUpsertFond());
      expect(result.current.details).toEqual(expect.objectContaining({ fondNumber: '' }));
    });

    it('populates details from the fetched fond when an id param is present', () => {
      mockUseParams.mockReturnValue({ id: 'abc123' });
      mockUseFondById.mockReturnValue({
        data: {
          findFondById: {
            fondNumber: 7,
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

      const { result } = renderHook(() => useUpsertFond());

      expect(result.current.details.fondNumber).toBe('7');
      expect(result.current.details.name).toEqual({ uk: 'Архів', en: 'Archive' });
      expect(result.current.details.documentCreationDate).toBe('1905');
      expect(result.current.details.chronologicalBoundaries).toBe('1905-1910');
      expect(result.current.details.casesCount).toBe(2);
      expect(result.current.details.descriptionsCount).toBe(4);
    });
    it('parses description correctly when it is a valid JSON doc string', () => {
      mockUseParams.mockReturnValue({ id: 'valid-json' });
      mockUseFondById.mockReturnValue({
        data: {
          findFondById: {
            description: { uk: '{"type":"doc","content":[]}', en: null }
          }
        }
      });

      const { result } = renderHook(() => useUpsertFond());

      expect(result.current.details.description.uk).toEqual({ type: 'doc', content: [] });
    });

    it('falls back to textToProse when description is an invalid JSON string', () => {
      mockUseParams.mockReturnValue({ id: 'invalid-json' });
      mockUseFondById.mockReturnValue({
        data: {
          findFondById: {
            description: { uk: 'just some plain text', en: null }
          }
        }
      });

      renderHook(() => useUpsertFond());

      expect(mockTextToProse).toHaveBeenCalledWith('just some plain text');
    });

    it('falls back to textToProse when description is valid JSON but not a doc object', () => {
      mockUseParams.mockReturnValue({ id: 'not-doc' });
      mockUseFondById.mockReturnValue({
        data: {
          findFondById: {
            description: { uk: '{"type":"paragraph"}', en: null }
          }
        }
      });

      renderHook(() => useUpsertFond());

      expect(mockTextToProse).toHaveBeenCalledWith('{"type":"paragraph"}');
    });
  });

  describe('validation', () => {
    it('fails when fondNumber is empty', async () => {
      const { result } = renderHook(() => useUpsertFond());
      setValidDetails(result);
      act(() => {
        result.current.setDetails((prev) => ({ ...prev, fondNumber: '' }));
      });

      let saved: string | null = 'unset';
      await act(async () => {
        saved = await result.current.handleSave(BaseContentStatuses.Draft);
      });

      expect(saved).toBeNull();
      expect(result.current.errors.fondNumber).toBeDefined();
      expect(mockCreateFond).not.toHaveBeenCalled();
    });

    it('fails when fondNumber is not a positive integer', async () => {
      const { result } = renderHook(() => useUpsertFond());
      setValidDetails(result);
      act(() => {
        result.current.setDetails((prev) => ({ ...prev, fondNumber: '-3' }));
      });

      await act(async () => {
        await result.current.handleSave(BaseContentStatuses.Draft);
      });

      expect(result.current.errors.fondNumber).toBeDefined();
    });

    it('fails when name.uk is empty', async () => {
      const { result } = renderHook(() => useUpsertFond());
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
      const { result } = renderHook(() => useUpsertFond());
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
      const { result } = renderHook(() => useUpsertFond());
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
      const { result } = renderHook(() => useUpsertFond());
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
      const { result } = renderHook(() => useUpsertFond());
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
      const { result } = renderHook(() => useUpsertFond());
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
      mockCreateFond.mockResolvedValue({ data: { createFond: { id: 'new-id' } } });

      const { result } = renderHook(() => useUpsertFond());
      setValidDetails(result);

      await act(async () => {
        await result.current.handleSave(BaseContentStatuses.Draft);
      });

      expect(result.current.errors.description).toBeDefined();
      expect(mockCreateFond).not.toHaveBeenCalled();
    });
    
    it('validates correctly when chronologicalBoundaries is an object (edge case)', async () => {
      const { result } = renderHook(() => useUpsertFond());
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
      mockCreateFond.mockResolvedValue({ data: { createFond: { id: 'new-id' } } });
      
      const { result } = renderHook(() => useUpsertFond());
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
    it('creates a fond, marks it saved, and returns the new id on success', async () => {
      mockCreateFond.mockResolvedValue({ data: { createFond: { id: 'new-id' } } });
      const { result } = renderHook(() => useUpsertFond());
      setValidDetails(result);

      let saved: string | null = null;
      await act(async () => {
        saved = await result.current.handleSave(BaseContentStatuses.Draft);
      });

      expect(saved).toBe('new-id');
      expect(mockCreateFond).toHaveBeenCalled();
      expect(result.current.isSaved).toBe(true);
      expect(toast.success).toHaveBeenCalled();
    });

    it('shows the published success toast when saving with Published status', async () => {
      mockCreateFond.mockResolvedValue({ data: { createFond: { id: 'new-id' } } });
      const { result } = renderHook(() => useUpsertFond());
      setValidDetails(result);

      await act(async () => {
        await result.current.handleSave(BaseContentStatuses.Published);
      });

      expect(toast.success).toHaveBeenCalledWith('Фонд опубліковано.');
    });

    it('returns null when the create mutation does not return an id', async () => {
      mockCreateFond.mockResolvedValue({ data: { createFond: null } });
      const { result } = renderHook(() => useUpsertFond());
      setValidDetails(result);

      let saved: string | null = 'unset';
      await act(async () => {
        saved = await result.current.handleSave(BaseContentStatuses.Draft);
      });

      expect(saved).toBeNull();
    });

    it('sets a duplicate-number field error when the backend reports a duplicate', async () => {
      mockCreateFond.mockRejectedValue(new Error('фонд з таким номером уже існує'));
      const { result } = renderHook(() => useUpsertFond());
      setValidDetails(result);

      await act(async () => {
        await result.current.handleSave(BaseContentStatuses.Draft);
      });

      expect(result.current.errors.fondNumber).toBeDefined();
      expect(toast.error).toHaveBeenCalled();
    });

    it('maps a backend zod validation error array onto field errors', async () => {
      const zodMessage = JSON.stringify([{ path: ['name'], message: 'Назва є обов’язковою' }]);
      mockCreateFond.mockRejectedValue(new Error(`Validation failed ${zodMessage}`));
      const { result } = renderHook(() => useUpsertFond());
      setValidDetails(result);

      await act(async () => {
        await result.current.handleSave(BaseContentStatuses.Draft);
      });

      expect(result.current.errors.name).toBe('Назва є обов’язковою');
      expect(toast.error).toHaveBeenCalled();
    });

    it('falls back to a generic error toast for unrecognised errors', async () => {
      mockCreateFond.mockRejectedValue(new Error('network exploded'));
      const { result } = renderHook(() => useUpsertFond());
      setValidDetails(result);

      await act(async () => {
        await result.current.handleSave(BaseContentStatuses.Draft);
      });

      expect(toast.error).toHaveBeenCalledWith(FondErrors.FAILED_TO_CREATE);
    });
    it('ignores backend errors that do not have a path array and falls back to generic error', async () => {
      const zodMessage = JSON.stringify([{ message: 'Some global validation error without path' }]);
      mockCreateFond.mockRejectedValue(new Error(`Validation failed ${zodMessage}`));
      
      const { result } = renderHook(() => useUpsertFond());
      setValidDetails(result);

      await act(async () => {
        await result.current.handleSave(BaseContentStatuses.Draft);
      });

      expect(toast.error).toHaveBeenCalledWith(FondErrors.FAILED_TO_CREATE);
    });

    it('handles JSON parsing errors silently when regex matches but content is invalid', async () => {
      const badJsonMatch = '[ { bad, json: } ]';
      mockCreateFond.mockRejectedValue(new Error(`Validation error ${badJsonMatch}`));
      
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      const { result } = renderHook(() => useUpsertFond());
      setValidDetails(result);

      await act(async () => {
        await result.current.handleSave(BaseContentStatuses.Draft);
      });

      expect(consoleSpy).toHaveBeenCalledWith('Error parsing backend error response:', expect.any(Error));
      expect(toast.error).toHaveBeenCalledWith(FondErrors.FAILED_TO_CREATE);
      
      consoleSpy.mockRestore();
    });
    
    it('ignores parsed errors if they are not an array', async () => {
      const zodMessage = JSON.stringify({ path: ['name'], message: 'Error' });
      mockCreateFond.mockRejectedValue(new Error(`Validation failed [ ${zodMessage} ]`));
      
      const { result } = renderHook(() => useUpsertFond());
      setValidDetails(result);

      await act(async () => {
        await result.current.handleSave(BaseContentStatuses.Draft);
      });

      expect(toast.error).toHaveBeenCalledWith(FondErrors.FAILED_TO_CREATE);
    });
  });

  describe('handleSave — edit mode', () => {
    beforeEach(() => {
      mockUseParams.mockReturnValue({ id: 'existing-id' });
      mockUseFondById.mockReturnValue({ data: undefined });
    });

    it('updates the fond and returns its id on success', async () => {
      mockUpdateFond.mockResolvedValue({ data: { updateFond: { id: 'existing-id' } } });
      const { result } = renderHook(() => useUpsertFond());
      setValidDetails(result);

      let saved: string | null = null;
      await act(async () => {
        saved = await result.current.handleSave(BaseContentStatuses.Draft);
      });

      expect(saved).toBe('existing-id');
      expect(mockUpdateFond).toHaveBeenCalledWith(expect.objectContaining({ id: 'existing-id' }));
      expect(result.current.isSaved).toBe(true);
    });

    it('returns null when the update mutation does not return an id', async () => {
      mockUpdateFond.mockResolvedValue({ data: { updateFond: null } });
      const { result } = renderHook(() => useUpsertFond());
      setValidDetails(result);

      let saved: string | null = 'unset';
      await act(async () => {
        saved = await result.current.handleSave(BaseContentStatuses.Draft);
      });

      expect(saved).toBeNull();
    });
  });

  it('includes optional fields (chronologicalBoundaries, organizationForm) in payload if provided', async () => {
    mockCreateFond.mockResolvedValue({ data: { createFond: { id: 'new-id' } } });
    const { result } = renderHook(() => useUpsertFond());
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

    expect(mockCreateFond).toHaveBeenCalledWith(
      expect.objectContaining({
        chronologicalBoundaries: { uk: '1900-1920', en: '1900-1920' },
        organizationForm: { uk: 'Організація', en: 'Organization' }
      })
    );
  });

  it('handles exceptions thrown as strings instead of Error objects', async () => {
    mockCreateFond.mockRejectedValue('уже існує string error');
      
    const { result } = renderHook(() => useUpsertFond());
    setValidDetails(result);

    await act(async () => {
      await result.current.handleSave(BaseContentStatuses.Draft);
    });

    expect(result.current.errors.fondNumber).toBeDefined();
    expect(toast.error).toHaveBeenCalled();
  });
});