import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
const defaultOptions = {} as const;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
  JSON: { input: any; output: any };
};

export type BlobPayload = {
  __typename?: 'BlobPayload';
  blobName?: Maybe<Scalars['String']['output']>;
  message?: Maybe<Scalars['String']['output']>;
  success: Scalars['Boolean']['output'];
};

export type ErrorPayload = {
  __typename?: 'ErrorPayload';
  message: Scalars['String']['output'];
  statusCode: Scalars['Int']['output'];
  success: Scalars['Boolean']['output'];
};

export type LocalizedString = {
  __typename?: 'LocalizedString';
  en?: Maybe<Scalars['String']['output']>;
  uk?: Maybe<Scalars['String']['output']>;
};

export type LoginPayload = {
  __typename?: 'LoginPayload';
  adminId?: Maybe<Scalars['ID']['output']>;
  adminType?: Maybe<Scalars['String']['output']>;
  success: Scalars['Boolean']['output'];
};

export type LoginResult = ErrorPayload | LoginPayload;

export type Mutation = {
  __typename?: 'Mutation';
  _empty?: Maybe<Scalars['String']['output']>;
  deleteBlob: BlobPayload;
  login: LoginResult;
  logout: Scalars['Boolean']['output'];
  refreshToken: RefreshTokenPayload;
  uploadBlob: BlobPayload;
};

export type MutationDeleteBlobArgs = {
  blobName: Scalars['String']['input'];
  folderName: Scalars['String']['input'];
};

export type MutationLoginArgs = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
};

export type MutationUploadBlobArgs = {
  blobName: Scalars['String']['input'];
  buffer: Scalars['String']['input'];
  contentType: Scalars['String']['input'];
  folderName: Scalars['String']['input'];
};

export type Page = {
  __typename?: 'Page';
  blocks: Scalars['JSON']['output'];
  createdAt: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  pageType: Scalars['String']['output'];
  slug: Scalars['String']['output'];
  status: Scalars['String']['output'];
  title: LocalizedString;
  updatedAt: Scalars['String']['output'];
};

export type Query = {
  __typename?: 'Query';
  _empty?: Maybe<Scalars['String']['output']>;
  pageBlocks?: Maybe<Page>;
  test: RefreshTokenPayload;
};

export type QueryPageBlocksArgs = {
  slug: Scalars['String']['input'];
};

export type RefreshTokenPayload = {
  __typename?: 'RefreshTokenPayload';
  success: Scalars['Boolean']['output'];
};

export type LoginMutationVariables = Exact<{
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
}>;

export type LoginMutation = {
  __typename?: 'Mutation';
  login:
    | { __typename: 'ErrorPayload'; success: boolean; message: string; statusCode: number }
    | { __typename: 'LoginPayload'; success: boolean; adminId?: string | null; adminType?: string | null };
};

export type DeleteBlobMutationVariables = Exact<{
  folderName: Scalars['String']['input'];
  blobName: Scalars['String']['input'];
}>;

export type DeleteBlobMutation = {
  __typename?: 'Mutation';
  deleteBlob: { __typename?: 'BlobPayload'; success: boolean; message?: string | null; blobName?: string | null };
};

export type UploadBlobMutationVariables = Exact<{
  folderName: Scalars['String']['input'];
  blobName: Scalars['String']['input'];
  buffer: Scalars['String']['input'];
  contentType: Scalars['String']['input'];
}>;

export type UploadBlobMutation = {
  __typename?: 'Mutation';
  uploadBlob: { __typename?: 'BlobPayload'; success: boolean; message?: string | null; blobName?: string | null };
};

export type GetAdminProfileQueryVariables = Exact<{ [key: string]: never }>;

export type GetAdminProfileQuery = {
  __typename?: 'Query';
  test: { __typename: 'RefreshTokenPayload'; success: boolean };
};

export type GetPageQueryVariables = Exact<{
  slug: Scalars['String']['input'];
}>;

export type GetPageQuery = { __typename?: 'Query'; pageBlocks?: { __typename?: 'Page'; blocks: any } | null };

export const LoginDocument = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      __typename
      ... on LoginPayload {
        success
        adminId
        adminType
      }
      ... on ErrorPayload {
        success
        message
        statusCode
      }
    }
  }
`;
export type LoginMutationFn = Apollo.MutationFunction<LoginMutation, LoginMutationVariables>;

/**
 * __useLoginMutation__
 *
 * To run a mutation, you first call `useLoginMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useLoginMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [loginMutation, { data, loading, error }] = useLoginMutation({
 *   variables: {
 *      email: // value for 'email'
 *      password: // value for 'password'
 *   },
 * });
 */
export function useLoginMutation(baseOptions?: Apollo.MutationHookOptions<LoginMutation, LoginMutationVariables>) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<LoginMutation, LoginMutationVariables>(LoginDocument, options);
}
export type LoginMutationHookResult = ReturnType<typeof useLoginMutation>;
export type LoginMutationResult = Apollo.MutationResult<LoginMutation>;
export type LoginMutationOptions = Apollo.BaseMutationOptions<LoginMutation, LoginMutationVariables>;
export const DeleteBlobDocument = gql`
  mutation DeleteBlob($folderName: String!, $blobName: String!) {
    deleteBlob(folderName: $folderName, blobName: $blobName) {
      success
      message
      blobName
    }
  }
`;
export type DeleteBlobMutationFn = Apollo.MutationFunction<DeleteBlobMutation, DeleteBlobMutationVariables>;

/**
 * __useDeleteBlobMutation__
 *
 * To run a mutation, you first call `useDeleteBlobMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteBlobMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteBlobMutation, { data, loading, error }] = useDeleteBlobMutation({
 *   variables: {
 *      folderName: // value for 'folderName'
 *      blobName: // value for 'blobName'
 *   },
 * });
 */
export function useDeleteBlobMutation(
  baseOptions?: Apollo.MutationHookOptions<DeleteBlobMutation, DeleteBlobMutationVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<DeleteBlobMutation, DeleteBlobMutationVariables>(DeleteBlobDocument, options);
}
export type DeleteBlobMutationHookResult = ReturnType<typeof useDeleteBlobMutation>;
export type DeleteBlobMutationResult = Apollo.MutationResult<DeleteBlobMutation>;
export type DeleteBlobMutationOptions = Apollo.BaseMutationOptions<DeleteBlobMutation, DeleteBlobMutationVariables>;
export const UploadBlobDocument = gql`
  mutation UploadBlob($folderName: String!, $blobName: String!, $buffer: String!, $contentType: String!) {
    uploadBlob(folderName: $folderName, blobName: $blobName, buffer: $buffer, contentType: $contentType) {
      success
      message
      blobName
    }
  }
`;
export type UploadBlobMutationFn = Apollo.MutationFunction<UploadBlobMutation, UploadBlobMutationVariables>;

/**
 * __useUploadBlobMutation__
 *
 * To run a mutation, you first call `useUploadBlobMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUploadBlobMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [uploadBlobMutation, { data, loading, error }] = useUploadBlobMutation({
 *   variables: {
 *      folderName: // value for 'folderName'
 *      blobName: // value for 'blobName'
 *      buffer: // value for 'buffer'
 *      contentType: // value for 'contentType'
 *   },
 * });
 */
export function useUploadBlobMutation(
  baseOptions?: Apollo.MutationHookOptions<UploadBlobMutation, UploadBlobMutationVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<UploadBlobMutation, UploadBlobMutationVariables>(UploadBlobDocument, options);
}
export type UploadBlobMutationHookResult = ReturnType<typeof useUploadBlobMutation>;
export type UploadBlobMutationResult = Apollo.MutationResult<UploadBlobMutation>;
export type UploadBlobMutationOptions = Apollo.BaseMutationOptions<UploadBlobMutation, UploadBlobMutationVariables>;
export const GetAdminProfileDocument = gql`
  query GetAdminProfile {
    test {
      __typename
      success
    }
  }
`;

/**
 * __useGetAdminProfileQuery__
 *
 * To run a query within a React component, call `useGetAdminProfileQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAdminProfileQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAdminProfileQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetAdminProfileQuery(
  baseOptions?: Apollo.QueryHookOptions<GetAdminProfileQuery, GetAdminProfileQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetAdminProfileQuery, GetAdminProfileQueryVariables>(GetAdminProfileDocument, options);
}
export function useGetAdminProfileLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<GetAdminProfileQuery, GetAdminProfileQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<GetAdminProfileQuery, GetAdminProfileQueryVariables>(GetAdminProfileDocument, options);
}
export function useGetAdminProfileSuspenseQuery(
  baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetAdminProfileQuery, GetAdminProfileQueryVariables>
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<GetAdminProfileQuery, GetAdminProfileQueryVariables>(GetAdminProfileDocument, options);
}
export type GetAdminProfileQueryHookResult = ReturnType<typeof useGetAdminProfileQuery>;
export type GetAdminProfileLazyQueryHookResult = ReturnType<typeof useGetAdminProfileLazyQuery>;
export type GetAdminProfileSuspenseQueryHookResult = ReturnType<typeof useGetAdminProfileSuspenseQuery>;
export type GetAdminProfileQueryResult = Apollo.QueryResult<GetAdminProfileQuery, GetAdminProfileQueryVariables>;
export const GetPageDocument = gql`
  query GetPage($slug: String!) {
    pageBlocks(slug: $slug) {
      blocks
    }
  }
`;

/**
 * __useGetPageQuery__
 *
 * To run a query within a React component, call `useGetPageQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetPageQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetPageQuery({
 *   variables: {
 *      slug: // value for 'slug'
 *   },
 * });
 */
export function useGetPageQuery(
  baseOptions: Apollo.QueryHookOptions<GetPageQuery, GetPageQueryVariables> &
    ({ variables: GetPageQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetPageQuery, GetPageQueryVariables>(GetPageDocument, options);
}
export function useGetPageLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetPageQuery, GetPageQueryVariables>) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<GetPageQuery, GetPageQueryVariables>(GetPageDocument, options);
}
export function useGetPageSuspenseQuery(
  baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetPageQuery, GetPageQueryVariables>
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<GetPageQuery, GetPageQueryVariables>(GetPageDocument, options);
}
export type GetPageQueryHookResult = ReturnType<typeof useGetPageQuery>;
export type GetPageLazyQueryHookResult = ReturnType<typeof useGetPageLazyQuery>;
export type GetPageSuspenseQueryHookResult = ReturnType<typeof useGetPageSuspenseQuery>;
export type GetPageQueryResult = Apollo.QueryResult<GetPageQuery, GetPageQueryVariables>;
