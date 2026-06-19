import { hasContentChanges } from './hasContentChanges';
import { LocalizedEditorState } from '~/constants/publications';

jest.mock('~/shared/components/content-editor', () => ({
  isContentEmpty: jest.fn()
}));

import { isContentEmpty } from '~/shared/components/content-editor';

const mockedIsContentEmpty = jest.mocked(isContentEmpty);

const createState = (blocks: any[] = []): LocalizedEditorState => ({
  uk: {
    content: {
      blocks,
      version: '1',
      lastModified: '2025-01-01'
    }
  },
  en: {
    content: {
      blocks,
      version: '1',
      lastModified: '2025-01-01'
    }
  }
});

describe('hasContentChanges', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns false for identical content', () => {
    mockedIsContentEmpty.mockReturnValue(false);

    const state = createState([{ id: '1' }]);

    expect(hasContentChanges(state, state)).toBe(false);
  });

  it('returns true for different content', () => {
    mockedIsContentEmpty.mockReturnValue(false);

    const current = createState([{ id: '1' }]);
    const initial = createState([{ id: '2' }]);

    expect(hasContentChanges(current, initial)).toBe(true);
  });

  it('treats empty content as equal', () => {
    mockedIsContentEmpty.mockReturnValue(true);

    const current = createState([{ id: '1' }]);
    const initial = createState([]);

    expect(hasContentChanges(current, initial)).toBe(false);
  });
});
