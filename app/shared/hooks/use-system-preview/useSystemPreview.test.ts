import { DocumentNode, gql } from '@apollo/client';
import { renderHook } from '@testing-library/react';

import { PreviewDocument, useSystemPreview } from './useSystemPreview';

const mockApolloQuery = jest.fn();

jest.mock('@apollo/client', () => {
  const actual = jest.requireActual('@apollo/client');
  return {
    ...actual,
    useApolloClient: () => ({ query: mockApolloQuery })
  };
});

const MOCK_PREVIEW_SLUG = 'sys-preview-news';

const MOCK_QUERY: DocumentNode = gql`
  query TestQuery {
    allNews {
      id
      adminTitle
      slug
    }
  }
`;

const MOCK_QUERY_VARIABLES = { locale: 'uk' };

const MOCK_DOCUMENTS = {
  matchingAdminTitle: {
    id: 'doc-id-1',
    adminTitle: MOCK_PREVIEW_SLUG,
    slug: 'regular-slug-1'
  } satisfies PreviewDocument,
  matchingSlug: {
    id: 'doc-id-2',
    adminTitle: 'Заголовок 2',
    slug: MOCK_PREVIEW_SLUG
  } satisfies PreviewDocument,
  nonMatching: {
    id: 'doc-id-3',
    adminTitle: 'Інший заголовок',
    slug: 'other-slug'
  } satisfies PreviewDocument
} as const;

type MockQueryData = {
  allNews: PreviewDocument[];
};

const itemsAccessor = (data: MockQueryData) => data?.allNews;

describe('useSystemPreview', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should find document id when slug matches previewSlug', async () => {
    mockApolloQuery.mockResolvedValue({
      data: { allNews: [MOCK_DOCUMENTS.nonMatching, MOCK_DOCUMENTS.matchingSlug] }
    });

    const { result } = renderHook(() => useSystemPreview());

    const documentId = await result.current.findSystemPreviewDocument(
      MOCK_QUERY,
      MOCK_QUERY_VARIABLES,
      MOCK_PREVIEW_SLUG,
      itemsAccessor
    );

    expect(mockApolloQuery).toHaveBeenCalledWith({
      query: MOCK_QUERY,
      variables: MOCK_QUERY_VARIABLES,
      fetchPolicy: 'network-only'
    });
    expect(documentId).toBe(MOCK_DOCUMENTS.matchingSlug.id);
  });

  it('should return undefined when no document matches previewSlug', async () => {
    mockApolloQuery.mockResolvedValue({
      data: { allNews: [MOCK_DOCUMENTS.nonMatching] }
    });

    const { result } = renderHook(() => useSystemPreview());

    const documentId = await result.current.findSystemPreviewDocument(
      MOCK_QUERY,
      MOCK_QUERY_VARIABLES,
      MOCK_PREVIEW_SLUG,
      itemsAccessor
    );

    expect(documentId).toBeUndefined();
  });

  it('should return undefined when itemsAccessor returns null or undefined', async () => {
    mockApolloQuery.mockResolvedValue({
      data: { allNews: [] }
    });

    const { result } = renderHook(() => useSystemPreview());

    const documentId = await result.current.findSystemPreviewDocument(
      MOCK_QUERY,
      MOCK_QUERY_VARIABLES,
      MOCK_PREVIEW_SLUG,
      () => null
    );

    expect(documentId).toBeUndefined();
  });

  it('should log error and return undefined when apollo query throws error', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const queryError = new Error('GraphQL Network Error');
    mockApolloQuery.mockRejectedValue(queryError);

    const { result } = renderHook(() => useSystemPreview());

    const documentId = await result.current.findSystemPreviewDocument(
      MOCK_QUERY,
      MOCK_QUERY_VARIABLES,
      MOCK_PREVIEW_SLUG,
      itemsAccessor
    );

    expect(documentId).toBeUndefined();
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error finding system preview document:', queryError);

    consoleErrorSpy.mockRestore();
  });
});
