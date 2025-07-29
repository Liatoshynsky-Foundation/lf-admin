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
};

export type ErrorPayload = {
  __typename?: 'ErrorPayload';
  message: Scalars['String']['output'];
  statusCode: Scalars['Int']['output'];
  success: Scalars['Boolean']['output'];
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
  login: LoginResult;
  logout: Scalars['Boolean']['output'];
  refreshToken: RefreshTokenPayload;
};

export type MutationLoginArgs = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
};

export type Query = {
  __typename?: 'Query';
  _empty?: Maybe<Scalars['String']['output']>;
  getAdminProfile: RefreshTokenPayload;
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

export type GetAdminProfileQueryVariables = Exact<{ [key: string]: never }>;

export type GetAdminProfileQuery = {
  __typename?: 'Query';
  getAdminProfile: { __typename: 'RefreshTokenPayload'; success: boolean };
};

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
export const GetAdminProfileDocument = gql`
  query GetAdminProfile {
    getAdminProfile {
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
