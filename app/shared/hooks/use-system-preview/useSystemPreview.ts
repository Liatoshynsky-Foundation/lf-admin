import { DocumentNode, OperationVariables,TypedDocumentNode, useApolloClient } from '@apollo/client';

export type PreviewDocument = {
  id: string;
  adminTitle?: string | null;
  slug?: string | null;
};

export const useSystemPreview = () => {
  const client = useApolloClient();

  const findSystemPreviewDocument = async <TData, TVariables extends OperationVariables>(
    query: DocumentNode | TypedDocumentNode<TData, TVariables>,
    variables: TVariables,
    previewSlug: string,
    itemsAccessor: (data: TData) => PreviewDocument[] | undefined | null
  ): Promise<string | undefined> => {
    try {
      const { data } = await client.query<TData, TVariables>({
        query,
        variables,
        fetchPolicy: 'network-only'
      });

      const items = itemsAccessor(data);
      const existingDoc = items?.find((g) => g.slug === previewSlug);

      return existingDoc?.id;
    } catch (error) {
      console.error('Error finding system preview document:', error);
      return undefined;
    }
  };

  return { findSystemPreviewDocument };
};
