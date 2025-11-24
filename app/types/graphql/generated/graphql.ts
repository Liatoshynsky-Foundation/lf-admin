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

export type CreateNewsInput = {
  content: Scalars['JSON']['input'];
  coverImage: Scalars['JSON']['input'];
  description?: InputMaybe<Scalars['JSON']['input']>;
  newsDate?: InputMaybe<Scalars['String']['input']>;
  publishedAt?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<NewsStatus>;
  title: Scalars['JSON']['input'];
};

export type ErrorPayload = {
  __typename?: 'ErrorPayload';
  message: Scalars['String']['output'];
  statusCode: Scalars['Int']['output'];
  success: Scalars['Boolean']['output'];
};

export type LocalizedNewsContent = {
  __typename?: 'LocalizedNewsContent';
  en: Scalars['String']['output'];
  uk: Scalars['String']['output'];
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
  archiveNews: News;
  createNews: News;
  deleteBlob: BlobPayload;
  deleteNews: Scalars['Boolean']['output'];
  hideNews: News;
  incrementNewsViews: News;
  login: LoginResult;
  logout: Scalars['Boolean']['output'];
  publishNews: News;
  publishPage: Page;
  refreshToken: RefreshTokenPayload;
  unpublishNews: News;
  updateNews: News;
  updatePageBlocks: Page;
  uploadBlob: BlobPayload;
  upsertPageDraft: Page;
};

export type MutationArchiveNewsArgs = {
  id: Scalars['ID']['input'];
};

export type MutationCreateNewsArgs = {
  input: CreateNewsInput;
};

export type MutationDeleteBlobArgs = {
  blobName: Scalars['String']['input'];
  folderName: Scalars['String']['input'];
};

export type MutationDeleteNewsArgs = {
  id: Scalars['ID']['input'];
};

export type MutationHideNewsArgs = {
  id: Scalars['ID']['input'];
};

export type MutationIncrementNewsViewsArgs = {
  id: Scalars['ID']['input'];
};

export type MutationLoginArgs = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
};

export type MutationPublishNewsArgs = {
  input: PublishNewsInput;
};

export type MutationPublishPageArgs = {
  input: PublishPageInput;
};

export type MutationUnpublishNewsArgs = {
  id: Scalars['ID']['input'];
};

export type MutationUpdateNewsArgs = {
  id: Scalars['ID']['input'];
  input: UpdateNewsInput;
};

export type MutationUpdatePageBlocksArgs = {
  input: UpdatePageBlocksInput;
};

export type MutationUploadBlobArgs = {
  blobName: Scalars['String']['input'];
  buffer: Scalars['String']['input'];
  contentType: Scalars['String']['input'];
  folderName: Scalars['String']['input'];
};

export type MutationUpsertPageDraftArgs = {
  input: UpsertPageDraftInput;
};

export type News = {
  __typename?: 'News';
  content: LocalizedNewsContent;
  coverImage: NewsImageBlock;
  createdAt: Scalars['String']['output'];
  description?: Maybe<LocalizedNewsContent>;
  id: Scalars['ID']['output'];
  meta: NewsMeta;
  newsDate?: Maybe<Scalars['String']['output']>;
  publishedAt?: Maybe<Scalars['String']['output']>;
  slug: Scalars['String']['output'];
  status: NewsStatus;
  title: LocalizedNewsContent;
  updatedAt: Scalars['String']['output'];
};

export type NewsFiltersInput = {
  slug?: InputMaybe<Scalars['String']['input']>;
  sortBy?: InputMaybe<NewsSortBy>;
  sortOrder?: InputMaybe<SortOrder>;
  status?: InputMaybe<NewsStatus>;
};

export type NewsImageBlock = {
  __typename?: 'NewsImageBlock';
  alt: LocalizedNewsContent;
  caption: LocalizedNewsContent;
  isTmp?: Maybe<Scalars['Boolean']['output']>;
  src: Scalars['String']['output'];
};

export type NewsMeta = {
  __typename?: 'NewsMeta';
  views: Scalars['Int']['output'];
};

export enum NewsSortBy {
  CreatedAt = 'createdAt',
  NewsDate = 'newsDate',
  PublishedAt = 'publishedAt',
  UpdatedAt = 'updatedAt'
}

export enum NewsStatus {
  Archived = 'archived',
  Draft = 'draft',
  Editing = 'editing',
  Hidden = 'hidden',
  Published = 'published'
}

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

export type PaginatedNews = {
  __typename?: 'PaginatedNews';
  news: Array<News>;
  page: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
  totalPages: Scalars['Int']['output'];
};

export type PublishNewsInput = {
  id: Scalars['ID']['input'];
  publishedAt?: InputMaybe<Scalars['String']['input']>;
};

export type PublishPageInput = {
  blocks?: InputMaybe<Scalars['JSON']['input']>;
  slug: Scalars['String']['input'];
};

export type Query = {
  __typename?: 'Query';
  _empty?: Maybe<Scalars['String']['output']>;
  allNews: Array<News>;
  newsById?: Maybe<News>;
  newsBySlug?: Maybe<News>;
  newsCount: Scalars['Int']['output'];
  pageBlocks?: Maybe<Page>;
  paginatedNews: PaginatedNews;
  publishedNews: Array<News>;
  test: RefreshTokenPayload;
};

export type QueryAllNewsArgs = {
  filters?: InputMaybe<NewsFiltersInput>;
};

export type QueryNewsByIdArgs = {
  id: Scalars['ID']['input'];
};

export type QueryNewsBySlugArgs = {
  slug: Scalars['String']['input'];
};

export type QueryNewsCountArgs = {
  status?: InputMaybe<NewsStatus>;
};

export type QueryPageBlocksArgs = {
  slug: Scalars['String']['input'];
  status?: InputMaybe<Scalars['String']['input']>;
};

export type QueryPaginatedNewsArgs = {
  filters?: InputMaybe<NewsFiltersInput>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
};

export type QueryPublishedNewsArgs = {
  filters?: InputMaybe<NewsFiltersInput>;
};

export type RefreshTokenPayload = {
  __typename?: 'RefreshTokenPayload';
  success: Scalars['Boolean']['output'];
};

export enum SortOrder {
  Asc = 'asc',
  Desc = 'desc'
}

export type UpdateNewsInput = {
  content?: InputMaybe<Scalars['JSON']['input']>;
  coverImage?: InputMaybe<Scalars['JSON']['input']>;
  description?: InputMaybe<Scalars['JSON']['input']>;
  newsDate?: InputMaybe<Scalars['String']['input']>;
  publishedAt?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<NewsStatus>;
  title?: InputMaybe<Scalars['JSON']['input']>;
};

export type UpdatePageBlocksInput = {
  blocks: Scalars['JSON']['input'];
  slug: Scalars['String']['input'];
};

export type UpsertPageDraftInput = {
  blocks: Scalars['JSON']['input'];
  slug: Scalars['String']['input'];
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

export type CreateNewsMutationVariables = Exact<{
  input: CreateNewsInput;
}>;

export type CreateNewsMutation = {
  __typename?: 'Mutation';
  createNews: {
    __typename?: 'News';
    id: string;
    publishedAt?: string | null;
    newsDate?: string | null;
    createdAt: string;
    updatedAt: string;
    slug: string;
    status: NewsStatus;
    title: { __typename?: 'LocalizedNewsContent'; uk: string; en: string };
    description?: { __typename?: 'LocalizedNewsContent'; uk: string; en: string } | null;
    content: { __typename?: 'LocalizedNewsContent'; uk: string; en: string };
    coverImage: {
      __typename?: 'NewsImageBlock';
      src: string;
      isTmp?: boolean | null;
      alt: { __typename?: 'LocalizedNewsContent'; uk: string; en: string };
      caption: { __typename?: 'LocalizedNewsContent'; uk: string; en: string };
    };
    meta: { __typename?: 'NewsMeta'; views: number };
  };
};

export type UpdateNewsMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: UpdateNewsInput;
}>;

export type UpdateNewsMutation = {
  __typename?: 'Mutation';
  updateNews: {
    __typename?: 'News';
    id: string;
    publishedAt?: string | null;
    newsDate?: string | null;
    createdAt: string;
    updatedAt: string;
    slug: string;
    status: NewsStatus;
    title: { __typename?: 'LocalizedNewsContent'; uk: string; en: string };
    description?: { __typename?: 'LocalizedNewsContent'; uk: string; en: string } | null;
    content: { __typename?: 'LocalizedNewsContent'; uk: string; en: string };
    coverImage: {
      __typename?: 'NewsImageBlock';
      src: string;
      isTmp?: boolean | null;
      alt: { __typename?: 'LocalizedNewsContent'; uk: string; en: string };
      caption: { __typename?: 'LocalizedNewsContent'; uk: string; en: string };
    };
    meta: { __typename?: 'NewsMeta'; views: number };
  };
};

export type PublishNewsMutationVariables = Exact<{
  input: PublishNewsInput;
}>;

export type PublishNewsMutation = {
  __typename?: 'Mutation';
  publishNews: {
    __typename?: 'News';
    id: string;
    publishedAt?: string | null;
    newsDate?: string | null;
    createdAt: string;
    updatedAt: string;
    slug: string;
    status: NewsStatus;
    title: { __typename?: 'LocalizedNewsContent'; uk: string; en: string };
    description?: { __typename?: 'LocalizedNewsContent'; uk: string; en: string } | null;
    content: { __typename?: 'LocalizedNewsContent'; uk: string; en: string };
    coverImage: {
      __typename?: 'NewsImageBlock';
      src: string;
      isTmp?: boolean | null;
      alt: { __typename?: 'LocalizedNewsContent'; uk: string; en: string };
      caption: { __typename?: 'LocalizedNewsContent'; uk: string; en: string };
    };
    meta: { __typename?: 'NewsMeta'; views: number };
  };
};

export type UnpublishNewsMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;

export type UnpublishNewsMutation = {
  __typename?: 'Mutation';
  unpublishNews: {
    __typename?: 'News';
    id: string;
    publishedAt?: string | null;
    newsDate?: string | null;
    createdAt: string;
    updatedAt: string;
    slug: string;
    status: NewsStatus;
    title: { __typename?: 'LocalizedNewsContent'; uk: string; en: string };
    description?: { __typename?: 'LocalizedNewsContent'; uk: string; en: string } | null;
    content: { __typename?: 'LocalizedNewsContent'; uk: string; en: string };
    coverImage: {
      __typename?: 'NewsImageBlock';
      src: string;
      isTmp?: boolean | null;
      alt: { __typename?: 'LocalizedNewsContent'; uk: string; en: string };
      caption: { __typename?: 'LocalizedNewsContent'; uk: string; en: string };
    };
    meta: { __typename?: 'NewsMeta'; views: number };
  };
};

export type ArchiveNewsMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;

export type ArchiveNewsMutation = {
  __typename?: 'Mutation';
  archiveNews: {
    __typename?: 'News';
    id: string;
    publishedAt?: string | null;
    newsDate?: string | null;
    createdAt: string;
    updatedAt: string;
    slug: string;
    status: NewsStatus;
    title: { __typename?: 'LocalizedNewsContent'; uk: string; en: string };
    description?: { __typename?: 'LocalizedNewsContent'; uk: string; en: string } | null;
    content: { __typename?: 'LocalizedNewsContent'; uk: string; en: string };
    coverImage: {
      __typename?: 'NewsImageBlock';
      src: string;
      isTmp?: boolean | null;
      alt: { __typename?: 'LocalizedNewsContent'; uk: string; en: string };
      caption: { __typename?: 'LocalizedNewsContent'; uk: string; en: string };
    };
    meta: { __typename?: 'NewsMeta'; views: number };
  };
};

export type HideNewsMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;

export type HideNewsMutation = {
  __typename?: 'Mutation';
  hideNews: {
    __typename?: 'News';
    id: string;
    publishedAt?: string | null;
    newsDate?: string | null;
    createdAt: string;
    updatedAt: string;
    slug: string;
    status: NewsStatus;
    title: { __typename?: 'LocalizedNewsContent'; uk: string; en: string };
    description?: { __typename?: 'LocalizedNewsContent'; uk: string; en: string } | null;
    content: { __typename?: 'LocalizedNewsContent'; uk: string; en: string };
    coverImage: {
      __typename?: 'NewsImageBlock';
      src: string;
      isTmp?: boolean | null;
      alt: { __typename?: 'LocalizedNewsContent'; uk: string; en: string };
      caption: { __typename?: 'LocalizedNewsContent'; uk: string; en: string };
    };
    meta: { __typename?: 'NewsMeta'; views: number };
  };
};

export type DeleteNewsMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;

export type DeleteNewsMutation = { __typename?: 'Mutation'; deleteNews: boolean };

export type IncrementNewsViewsMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;

export type IncrementNewsViewsMutation = {
  __typename?: 'Mutation';
  incrementNewsViews: { __typename?: 'News'; id: string; meta: { __typename?: 'NewsMeta'; views: number } };
};

export type PublishPageMutationVariables = Exact<{
  input: PublishPageInput;
}>;

export type PublishPageMutation = {
  __typename?: 'Mutation';
  publishPage: { __typename: 'Page'; id: string; slug: string; status: string; blocks: any; updatedAt: string };
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

export type UpsertPageDraftMutationVariables = Exact<{
  input: UpsertPageDraftInput;
}>;

export type UpsertPageDraftMutation = {
  __typename?: 'Mutation';
  upsertPageDraft: { __typename: 'Page'; id: string; slug: string; status: string; blocks: any; updatedAt: string };
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

export type NewsByIdQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;

export type NewsByIdQuery = {
  __typename?: 'Query';
  newsById?: {
    __typename?: 'News';
    id: string;
    publishedAt?: string | null;
    newsDate?: string | null;
    createdAt: string;
    updatedAt: string;
    slug: string;
    status: NewsStatus;
    title: { __typename?: 'LocalizedNewsContent'; uk: string; en: string };
    description?: { __typename?: 'LocalizedNewsContent'; uk: string; en: string } | null;
    content: { __typename?: 'LocalizedNewsContent'; uk: string; en: string };
    coverImage: {
      __typename?: 'NewsImageBlock';
      src: string;
      isTmp?: boolean | null;
      alt: { __typename?: 'LocalizedNewsContent'; uk: string; en: string };
      caption: { __typename?: 'LocalizedNewsContent'; uk: string; en: string };
    };
    meta: { __typename?: 'NewsMeta'; views: number };
  } | null;
};

export type NewsBySlugQueryVariables = Exact<{
  slug: Scalars['String']['input'];
}>;

export type NewsBySlugQuery = {
  __typename?: 'Query';
  newsBySlug?: {
    __typename?: 'News';
    id: string;
    publishedAt?: string | null;
    newsDate?: string | null;
    createdAt: string;
    updatedAt: string;
    slug: string;
    status: NewsStatus;
    title: { __typename?: 'LocalizedNewsContent'; uk: string; en: string };
    description?: { __typename?: 'LocalizedNewsContent'; uk: string; en: string } | null;
    content: { __typename?: 'LocalizedNewsContent'; uk: string; en: string };
    coverImage: {
      __typename?: 'NewsImageBlock';
      src: string;
      isTmp?: boolean | null;
      alt: { __typename?: 'LocalizedNewsContent'; uk: string; en: string };
      caption: { __typename?: 'LocalizedNewsContent'; uk: string; en: string };
    };
    meta: { __typename?: 'NewsMeta'; views: number };
  } | null;
};

export type AllNewsQueryVariables = Exact<{
  filters?: InputMaybe<NewsFiltersInput>;
}>;

export type AllNewsQuery = {
  __typename?: 'Query';
  allNews: Array<{
    __typename?: 'News';
    id: string;
    publishedAt?: string | null;
    newsDate?: string | null;
    createdAt: string;
    updatedAt: string;
    slug: string;
    status: NewsStatus;
    title: { __typename?: 'LocalizedNewsContent'; uk: string; en: string };
    description?: { __typename?: 'LocalizedNewsContent'; uk: string; en: string } | null;
    content: { __typename?: 'LocalizedNewsContent'; uk: string; en: string };
    coverImage: {
      __typename?: 'NewsImageBlock';
      src: string;
      isTmp?: boolean | null;
      alt: { __typename?: 'LocalizedNewsContent'; uk: string; en: string };
      caption: { __typename?: 'LocalizedNewsContent'; uk: string; en: string };
    };
    meta: { __typename?: 'NewsMeta'; views: number };
  }>;
};

export type PublishedNewsQueryVariables = Exact<{
  filters?: InputMaybe<NewsFiltersInput>;
}>;

export type PublishedNewsQuery = {
  __typename?: 'Query';
  publishedNews: Array<{
    __typename?: 'News';
    id: string;
    publishedAt?: string | null;
    newsDate?: string | null;
    createdAt: string;
    updatedAt: string;
    slug: string;
    status: NewsStatus;
    title: { __typename?: 'LocalizedNewsContent'; uk: string; en: string };
    description?: { __typename?: 'LocalizedNewsContent'; uk: string; en: string } | null;
    content: { __typename?: 'LocalizedNewsContent'; uk: string; en: string };
    coverImage: {
      __typename?: 'NewsImageBlock';
      src: string;
      isTmp?: boolean | null;
      alt: { __typename?: 'LocalizedNewsContent'; uk: string; en: string };
      caption: { __typename?: 'LocalizedNewsContent'; uk: string; en: string };
    };
    meta: { __typename?: 'NewsMeta'; views: number };
  }>;
};

export type PaginatedNewsQueryVariables = Exact<{
  page?: InputMaybe<Scalars['Int']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  filters?: InputMaybe<NewsFiltersInput>;
}>;

export type PaginatedNewsQuery = {
  __typename?: 'Query';
  paginatedNews: {
    __typename?: 'PaginatedNews';
    total: number;
    page: number;
    totalPages: number;
    news: Array<{
      __typename?: 'News';
      id: string;
      publishedAt?: string | null;
      newsDate?: string | null;
      createdAt: string;
      updatedAt: string;
      slug: string;
      status: NewsStatus;
      title: { __typename?: 'LocalizedNewsContent'; uk: string; en: string };
      description?: { __typename?: 'LocalizedNewsContent'; uk: string; en: string } | null;
      content: { __typename?: 'LocalizedNewsContent'; uk: string; en: string };
      coverImage: {
        __typename?: 'NewsImageBlock';
        src: string;
        isTmp?: boolean | null;
        alt: { __typename?: 'LocalizedNewsContent'; uk: string; en: string };
        caption: { __typename?: 'LocalizedNewsContent'; uk: string; en: string };
      };
      meta: { __typename?: 'NewsMeta'; views: number };
    }>;
  };
};

export type NewsCountQueryVariables = Exact<{
  status?: InputMaybe<NewsStatus>;
}>;

export type NewsCountQuery = { __typename?: 'Query'; newsCount: number };

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
export const CreateNewsDocument = gql`
  mutation CreateNews($input: CreateNewsInput!) {
    createNews(input: $input) {
      id
      publishedAt
      newsDate
      createdAt
      updatedAt
      title {
        uk
        en
      }
      description {
        uk
        en
      }
      content {
        uk
        en
      }
      slug
      coverImage {
        src
        alt {
          uk
          en
        }
        caption {
          uk
          en
        }
        isTmp
      }
      status
      meta {
        views
      }
    }
  }
`;
export type CreateNewsMutationFn = Apollo.MutationFunction<CreateNewsMutation, CreateNewsMutationVariables>;

/**
 * __useCreateNewsMutation__
 *
 * To run a mutation, you first call `useCreateNewsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateNewsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createNewsMutation, { data, loading, error }] = useCreateNewsMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateNewsMutation(
  baseOptions?: Apollo.MutationHookOptions<CreateNewsMutation, CreateNewsMutationVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<CreateNewsMutation, CreateNewsMutationVariables>(CreateNewsDocument, options);
}
export type CreateNewsMutationHookResult = ReturnType<typeof useCreateNewsMutation>;
export type CreateNewsMutationResult = Apollo.MutationResult<CreateNewsMutation>;
export type CreateNewsMutationOptions = Apollo.BaseMutationOptions<CreateNewsMutation, CreateNewsMutationVariables>;
export const UpdateNewsDocument = gql`
  mutation UpdateNews($id: ID!, $input: UpdateNewsInput!) {
    updateNews(id: $id, input: $input) {
      id
      publishedAt
      newsDate
      createdAt
      updatedAt
      title {
        uk
        en
      }
      description {
        uk
        en
      }
      content {
        uk
        en
      }
      slug
      coverImage {
        src
        alt {
          uk
          en
        }
        caption {
          uk
          en
        }
        isTmp
      }
      status
      meta {
        views
      }
    }
  }
`;
export type UpdateNewsMutationFn = Apollo.MutationFunction<UpdateNewsMutation, UpdateNewsMutationVariables>;

/**
 * __useUpdateNewsMutation__
 *
 * To run a mutation, you first call `useUpdateNewsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateNewsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateNewsMutation, { data, loading, error }] = useUpdateNewsMutation({
 *   variables: {
 *      id: // value for 'id'
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateNewsMutation(
  baseOptions?: Apollo.MutationHookOptions<UpdateNewsMutation, UpdateNewsMutationVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<UpdateNewsMutation, UpdateNewsMutationVariables>(UpdateNewsDocument, options);
}
export type UpdateNewsMutationHookResult = ReturnType<typeof useUpdateNewsMutation>;
export type UpdateNewsMutationResult = Apollo.MutationResult<UpdateNewsMutation>;
export type UpdateNewsMutationOptions = Apollo.BaseMutationOptions<UpdateNewsMutation, UpdateNewsMutationVariables>;
export const PublishNewsDocument = gql`
  mutation PublishNews($input: PublishNewsInput!) {
    publishNews(input: $input) {
      id
      publishedAt
      newsDate
      createdAt
      updatedAt
      title {
        uk
        en
      }
      description {
        uk
        en
      }
      content {
        uk
        en
      }
      slug
      coverImage {
        src
        alt {
          uk
          en
        }
        caption {
          uk
          en
        }
        isTmp
      }
      status
      meta {
        views
      }
    }
  }
`;
export type PublishNewsMutationFn = Apollo.MutationFunction<PublishNewsMutation, PublishNewsMutationVariables>;

/**
 * __usePublishNewsMutation__
 *
 * To run a mutation, you first call `usePublishNewsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `usePublishNewsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [publishNewsMutation, { data, loading, error }] = usePublishNewsMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function usePublishNewsMutation(
  baseOptions?: Apollo.MutationHookOptions<PublishNewsMutation, PublishNewsMutationVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<PublishNewsMutation, PublishNewsMutationVariables>(PublishNewsDocument, options);
}
export type PublishNewsMutationHookResult = ReturnType<typeof usePublishNewsMutation>;
export type PublishNewsMutationResult = Apollo.MutationResult<PublishNewsMutation>;
export type PublishNewsMutationOptions = Apollo.BaseMutationOptions<PublishNewsMutation, PublishNewsMutationVariables>;
export const UnpublishNewsDocument = gql`
  mutation UnpublishNews($id: ID!) {
    unpublishNews(id: $id) {
      id
      publishedAt
      newsDate
      createdAt
      updatedAt
      title {
        uk
        en
      }
      description {
        uk
        en
      }
      content {
        uk
        en
      }
      slug
      coverImage {
        src
        alt {
          uk
          en
        }
        caption {
          uk
          en
        }
        isTmp
      }
      status
      meta {
        views
      }
    }
  }
`;
export type UnpublishNewsMutationFn = Apollo.MutationFunction<UnpublishNewsMutation, UnpublishNewsMutationVariables>;

/**
 * __useUnpublishNewsMutation__
 *
 * To run a mutation, you first call `useUnpublishNewsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUnpublishNewsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [unpublishNewsMutation, { data, loading, error }] = useUnpublishNewsMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useUnpublishNewsMutation(
  baseOptions?: Apollo.MutationHookOptions<UnpublishNewsMutation, UnpublishNewsMutationVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<UnpublishNewsMutation, UnpublishNewsMutationVariables>(UnpublishNewsDocument, options);
}
export type UnpublishNewsMutationHookResult = ReturnType<typeof useUnpublishNewsMutation>;
export type UnpublishNewsMutationResult = Apollo.MutationResult<UnpublishNewsMutation>;
export type UnpublishNewsMutationOptions = Apollo.BaseMutationOptions<
  UnpublishNewsMutation,
  UnpublishNewsMutationVariables
>;
export const ArchiveNewsDocument = gql`
  mutation ArchiveNews($id: ID!) {
    archiveNews(id: $id) {
      id
      publishedAt
      newsDate
      createdAt
      updatedAt
      title {
        uk
        en
      }
      description {
        uk
        en
      }
      content {
        uk
        en
      }
      slug
      coverImage {
        src
        alt {
          uk
          en
        }
        caption {
          uk
          en
        }
        isTmp
      }
      status
      meta {
        views
      }
    }
  }
`;
export type ArchiveNewsMutationFn = Apollo.MutationFunction<ArchiveNewsMutation, ArchiveNewsMutationVariables>;

/**
 * __useArchiveNewsMutation__
 *
 * To run a mutation, you first call `useArchiveNewsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useArchiveNewsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [archiveNewsMutation, { data, loading, error }] = useArchiveNewsMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useArchiveNewsMutation(
  baseOptions?: Apollo.MutationHookOptions<ArchiveNewsMutation, ArchiveNewsMutationVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<ArchiveNewsMutation, ArchiveNewsMutationVariables>(ArchiveNewsDocument, options);
}
export type ArchiveNewsMutationHookResult = ReturnType<typeof useArchiveNewsMutation>;
export type ArchiveNewsMutationResult = Apollo.MutationResult<ArchiveNewsMutation>;
export type ArchiveNewsMutationOptions = Apollo.BaseMutationOptions<ArchiveNewsMutation, ArchiveNewsMutationVariables>;
export const HideNewsDocument = gql`
  mutation HideNews($id: ID!) {
    hideNews(id: $id) {
      id
      publishedAt
      newsDate
      createdAt
      updatedAt
      title {
        uk
        en
      }
      description {
        uk
        en
      }
      content {
        uk
        en
      }
      slug
      coverImage {
        src
        alt {
          uk
          en
        }
        caption {
          uk
          en
        }
        isTmp
      }
      status
      meta {
        views
      }
    }
  }
`;
export type HideNewsMutationFn = Apollo.MutationFunction<HideNewsMutation, HideNewsMutationVariables>;

/**
 * __useHideNewsMutation__
 *
 * To run a mutation, you first call `useHideNewsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useHideNewsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [hideNewsMutation, { data, loading, error }] = useHideNewsMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useHideNewsMutation(
  baseOptions?: Apollo.MutationHookOptions<HideNewsMutation, HideNewsMutationVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<HideNewsMutation, HideNewsMutationVariables>(HideNewsDocument, options);
}
export type HideNewsMutationHookResult = ReturnType<typeof useHideNewsMutation>;
export type HideNewsMutationResult = Apollo.MutationResult<HideNewsMutation>;
export type HideNewsMutationOptions = Apollo.BaseMutationOptions<HideNewsMutation, HideNewsMutationVariables>;
export const DeleteNewsDocument = gql`
  mutation DeleteNews($id: ID!) {
    deleteNews(id: $id)
  }
`;
export type DeleteNewsMutationFn = Apollo.MutationFunction<DeleteNewsMutation, DeleteNewsMutationVariables>;

/**
 * __useDeleteNewsMutation__
 *
 * To run a mutation, you first call `useDeleteNewsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteNewsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteNewsMutation, { data, loading, error }] = useDeleteNewsMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteNewsMutation(
  baseOptions?: Apollo.MutationHookOptions<DeleteNewsMutation, DeleteNewsMutationVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<DeleteNewsMutation, DeleteNewsMutationVariables>(DeleteNewsDocument, options);
}
export type DeleteNewsMutationHookResult = ReturnType<typeof useDeleteNewsMutation>;
export type DeleteNewsMutationResult = Apollo.MutationResult<DeleteNewsMutation>;
export type DeleteNewsMutationOptions = Apollo.BaseMutationOptions<DeleteNewsMutation, DeleteNewsMutationVariables>;
export const IncrementNewsViewsDocument = gql`
  mutation IncrementNewsViews($id: ID!) {
    incrementNewsViews(id: $id) {
      id
      meta {
        views
      }
    }
  }
`;
export type IncrementNewsViewsMutationFn = Apollo.MutationFunction<
  IncrementNewsViewsMutation,
  IncrementNewsViewsMutationVariables
>;

/**
 * __useIncrementNewsViewsMutation__
 *
 * To run a mutation, you first call `useIncrementNewsViewsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useIncrementNewsViewsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [incrementNewsViewsMutation, { data, loading, error }] = useIncrementNewsViewsMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useIncrementNewsViewsMutation(
  baseOptions?: Apollo.MutationHookOptions<IncrementNewsViewsMutation, IncrementNewsViewsMutationVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<IncrementNewsViewsMutation, IncrementNewsViewsMutationVariables>(
    IncrementNewsViewsDocument,
    options
  );
}
export type IncrementNewsViewsMutationHookResult = ReturnType<typeof useIncrementNewsViewsMutation>;
export type IncrementNewsViewsMutationResult = Apollo.MutationResult<IncrementNewsViewsMutation>;
export type IncrementNewsViewsMutationOptions = Apollo.BaseMutationOptions<
  IncrementNewsViewsMutation,
  IncrementNewsViewsMutationVariables
>;
export const PublishPageDocument = gql`
  mutation PublishPage($input: PublishPageInput!) {
    publishPage(input: $input) {
      id
      slug
      status
      blocks
      updatedAt
      __typename
    }
  }
`;
export type PublishPageMutationFn = Apollo.MutationFunction<PublishPageMutation, PublishPageMutationVariables>;

/**
 * __usePublishPageMutation__
 *
 * To run a mutation, you first call `usePublishPageMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `usePublishPageMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [publishPageMutation, { data, loading, error }] = usePublishPageMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function usePublishPageMutation(
  baseOptions?: Apollo.MutationHookOptions<PublishPageMutation, PublishPageMutationVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<PublishPageMutation, PublishPageMutationVariables>(PublishPageDocument, options);
}
export type PublishPageMutationHookResult = ReturnType<typeof usePublishPageMutation>;
export type PublishPageMutationResult = Apollo.MutationResult<PublishPageMutation>;
export type PublishPageMutationOptions = Apollo.BaseMutationOptions<PublishPageMutation, PublishPageMutationVariables>;
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
export const UpsertPageDraftDocument = gql`
  mutation UpsertPageDraft($input: UpsertPageDraftInput!) {
    upsertPageDraft(input: $input) {
      id
      slug
      status
      blocks
      updatedAt
      __typename
    }
  }
`;
export type UpsertPageDraftMutationFn = Apollo.MutationFunction<
  UpsertPageDraftMutation,
  UpsertPageDraftMutationVariables
>;

/**
 * __useUpsertPageDraftMutation__
 *
 * To run a mutation, you first call `useUpsertPageDraftMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpsertPageDraftMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [upsertPageDraftMutation, { data, loading, error }] = useUpsertPageDraftMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpsertPageDraftMutation(
  baseOptions?: Apollo.MutationHookOptions<UpsertPageDraftMutation, UpsertPageDraftMutationVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<UpsertPageDraftMutation, UpsertPageDraftMutationVariables>(
    UpsertPageDraftDocument,
    options
  );
}
export type UpsertPageDraftMutationHookResult = ReturnType<typeof useUpsertPageDraftMutation>;
export type UpsertPageDraftMutationResult = Apollo.MutationResult<UpsertPageDraftMutation>;
export type UpsertPageDraftMutationOptions = Apollo.BaseMutationOptions<
  UpsertPageDraftMutation,
  UpsertPageDraftMutationVariables
>;
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
export const NewsByIdDocument = gql`
  query NewsById($id: ID!) {
    newsById(id: $id) {
      id
      publishedAt
      newsDate
      createdAt
      updatedAt
      title {
        uk
        en
      }
      description {
        uk
        en
      }
      content {
        uk
        en
      }
      slug
      coverImage {
        src
        alt {
          uk
          en
        }
        caption {
          uk
          en
        }
        isTmp
      }
      status
      meta {
        views
      }
    }
  }
`;

/**
 * __useNewsByIdQuery__
 *
 * To run a query within a React component, call `useNewsByIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useNewsByIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useNewsByIdQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useNewsByIdQuery(
  baseOptions: Apollo.QueryHookOptions<NewsByIdQuery, NewsByIdQueryVariables> &
    ({ variables: NewsByIdQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<NewsByIdQuery, NewsByIdQueryVariables>(NewsByIdDocument, options);
}
export function useNewsByIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<NewsByIdQuery, NewsByIdQueryVariables>) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<NewsByIdQuery, NewsByIdQueryVariables>(NewsByIdDocument, options);
}
export function useNewsByIdSuspenseQuery(
  baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<NewsByIdQuery, NewsByIdQueryVariables>
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<NewsByIdQuery, NewsByIdQueryVariables>(NewsByIdDocument, options);
}
export type NewsByIdQueryHookResult = ReturnType<typeof useNewsByIdQuery>;
export type NewsByIdLazyQueryHookResult = ReturnType<typeof useNewsByIdLazyQuery>;
export type NewsByIdSuspenseQueryHookResult = ReturnType<typeof useNewsByIdSuspenseQuery>;
export type NewsByIdQueryResult = Apollo.QueryResult<NewsByIdQuery, NewsByIdQueryVariables>;
export const NewsBySlugDocument = gql`
  query NewsBySlug($slug: String!) {
    newsBySlug(slug: $slug) {
      id
      publishedAt
      newsDate
      createdAt
      updatedAt
      title {
        uk
        en
      }
      description {
        uk
        en
      }
      content {
        uk
        en
      }
      slug
      coverImage {
        src
        alt {
          uk
          en
        }
        caption {
          uk
          en
        }
        isTmp
      }
      status
      meta {
        views
      }
    }
  }
`;

/**
 * __useNewsBySlugQuery__
 *
 * To run a query within a React component, call `useNewsBySlugQuery` and pass it any options that fit your needs.
 * When your component renders, `useNewsBySlugQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useNewsBySlugQuery({
 *   variables: {
 *      slug: // value for 'slug'
 *   },
 * });
 */
export function useNewsBySlugQuery(
  baseOptions: Apollo.QueryHookOptions<NewsBySlugQuery, NewsBySlugQueryVariables> &
    ({ variables: NewsBySlugQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<NewsBySlugQuery, NewsBySlugQueryVariables>(NewsBySlugDocument, options);
}
export function useNewsBySlugLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<NewsBySlugQuery, NewsBySlugQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<NewsBySlugQuery, NewsBySlugQueryVariables>(NewsBySlugDocument, options);
}
export function useNewsBySlugSuspenseQuery(
  baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<NewsBySlugQuery, NewsBySlugQueryVariables>
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<NewsBySlugQuery, NewsBySlugQueryVariables>(NewsBySlugDocument, options);
}
export type NewsBySlugQueryHookResult = ReturnType<typeof useNewsBySlugQuery>;
export type NewsBySlugLazyQueryHookResult = ReturnType<typeof useNewsBySlugLazyQuery>;
export type NewsBySlugSuspenseQueryHookResult = ReturnType<typeof useNewsBySlugSuspenseQuery>;
export type NewsBySlugQueryResult = Apollo.QueryResult<NewsBySlugQuery, NewsBySlugQueryVariables>;
export const AllNewsDocument = gql`
  query AllNews($filters: NewsFiltersInput) {
    allNews(filters: $filters) {
      id
      publishedAt
      newsDate
      createdAt
      updatedAt
      title {
        uk
        en
      }
      description {
        uk
        en
      }
      content {
        uk
        en
      }
      slug
      coverImage {
        src
        alt {
          uk
          en
        }
        caption {
          uk
          en
        }
        isTmp
      }
      status
      meta {
        views
      }
    }
  }
`;

/**
 * __useAllNewsQuery__
 *
 * To run a query within a React component, call `useAllNewsQuery` and pass it any options that fit your needs.
 * When your component renders, `useAllNewsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAllNewsQuery({
 *   variables: {
 *      filters: // value for 'filters'
 *   },
 * });
 */
export function useAllNewsQuery(baseOptions?: Apollo.QueryHookOptions<AllNewsQuery, AllNewsQueryVariables>) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<AllNewsQuery, AllNewsQueryVariables>(AllNewsDocument, options);
}
export function useAllNewsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<AllNewsQuery, AllNewsQueryVariables>) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<AllNewsQuery, AllNewsQueryVariables>(AllNewsDocument, options);
}
export function useAllNewsSuspenseQuery(
  baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<AllNewsQuery, AllNewsQueryVariables>
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<AllNewsQuery, AllNewsQueryVariables>(AllNewsDocument, options);
}
export type AllNewsQueryHookResult = ReturnType<typeof useAllNewsQuery>;
export type AllNewsLazyQueryHookResult = ReturnType<typeof useAllNewsLazyQuery>;
export type AllNewsSuspenseQueryHookResult = ReturnType<typeof useAllNewsSuspenseQuery>;
export type AllNewsQueryResult = Apollo.QueryResult<AllNewsQuery, AllNewsQueryVariables>;
export const PublishedNewsDocument = gql`
  query PublishedNews($filters: NewsFiltersInput) {
    publishedNews(filters: $filters) {
      id
      publishedAt
      newsDate
      createdAt
      updatedAt
      title {
        uk
        en
      }
      description {
        uk
        en
      }
      content {
        uk
        en
      }
      slug
      coverImage {
        src
        alt {
          uk
          en
        }
        caption {
          uk
          en
        }
        isTmp
      }
      status
      meta {
        views
      }
    }
  }
`;

/**
 * __usePublishedNewsQuery__
 *
 * To run a query within a React component, call `usePublishedNewsQuery` and pass it any options that fit your needs.
 * When your component renders, `usePublishedNewsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = usePublishedNewsQuery({
 *   variables: {
 *      filters: // value for 'filters'
 *   },
 * });
 */
export function usePublishedNewsQuery(
  baseOptions?: Apollo.QueryHookOptions<PublishedNewsQuery, PublishedNewsQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<PublishedNewsQuery, PublishedNewsQueryVariables>(PublishedNewsDocument, options);
}
export function usePublishedNewsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<PublishedNewsQuery, PublishedNewsQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<PublishedNewsQuery, PublishedNewsQueryVariables>(PublishedNewsDocument, options);
}
export function usePublishedNewsSuspenseQuery(
  baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<PublishedNewsQuery, PublishedNewsQueryVariables>
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<PublishedNewsQuery, PublishedNewsQueryVariables>(PublishedNewsDocument, options);
}
export type PublishedNewsQueryHookResult = ReturnType<typeof usePublishedNewsQuery>;
export type PublishedNewsLazyQueryHookResult = ReturnType<typeof usePublishedNewsLazyQuery>;
export type PublishedNewsSuspenseQueryHookResult = ReturnType<typeof usePublishedNewsSuspenseQuery>;
export type PublishedNewsQueryResult = Apollo.QueryResult<PublishedNewsQuery, PublishedNewsQueryVariables>;
export const PaginatedNewsDocument = gql`
  query PaginatedNews($page: Int = 1, $limit: Int = 10, $filters: NewsFiltersInput) {
    paginatedNews(page: $page, limit: $limit, filters: $filters) {
      news {
        id
        publishedAt
        newsDate
        createdAt
        updatedAt
        title {
          uk
          en
        }
        description {
          uk
          en
        }
        content {
          uk
          en
        }
        slug
        coverImage {
          src
          alt {
            uk
            en
          }
          caption {
            uk
            en
          }
          isTmp
        }
        status
        meta {
          views
        }
      }
      total
      page
      totalPages
    }
  }
`;

/**
 * __usePaginatedNewsQuery__
 *
 * To run a query within a React component, call `usePaginatedNewsQuery` and pass it any options that fit your needs.
 * When your component renders, `usePaginatedNewsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = usePaginatedNewsQuery({
 *   variables: {
 *      page: // value for 'page'
 *      limit: // value for 'limit'
 *      filters: // value for 'filters'
 *   },
 * });
 */
export function usePaginatedNewsQuery(
  baseOptions?: Apollo.QueryHookOptions<PaginatedNewsQuery, PaginatedNewsQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<PaginatedNewsQuery, PaginatedNewsQueryVariables>(PaginatedNewsDocument, options);
}
export function usePaginatedNewsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<PaginatedNewsQuery, PaginatedNewsQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<PaginatedNewsQuery, PaginatedNewsQueryVariables>(PaginatedNewsDocument, options);
}
export function usePaginatedNewsSuspenseQuery(
  baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<PaginatedNewsQuery, PaginatedNewsQueryVariables>
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<PaginatedNewsQuery, PaginatedNewsQueryVariables>(PaginatedNewsDocument, options);
}
export type PaginatedNewsQueryHookResult = ReturnType<typeof usePaginatedNewsQuery>;
export type PaginatedNewsLazyQueryHookResult = ReturnType<typeof usePaginatedNewsLazyQuery>;
export type PaginatedNewsSuspenseQueryHookResult = ReturnType<typeof usePaginatedNewsSuspenseQuery>;
export type PaginatedNewsQueryResult = Apollo.QueryResult<PaginatedNewsQuery, PaginatedNewsQueryVariables>;
export const NewsCountDocument = gql`
  query NewsCount($status: NewsStatus) {
    newsCount(status: $status)
  }
`;

/**
 * __useNewsCountQuery__
 *
 * To run a query within a React component, call `useNewsCountQuery` and pass it any options that fit your needs.
 * When your component renders, `useNewsCountQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useNewsCountQuery({
 *   variables: {
 *      status: // value for 'status'
 *   },
 * });
 */
export function useNewsCountQuery(baseOptions?: Apollo.QueryHookOptions<NewsCountQuery, NewsCountQueryVariables>) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<NewsCountQuery, NewsCountQueryVariables>(NewsCountDocument, options);
}
export function useNewsCountLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<NewsCountQuery, NewsCountQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<NewsCountQuery, NewsCountQueryVariables>(NewsCountDocument, options);
}
export function useNewsCountSuspenseQuery(
  baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<NewsCountQuery, NewsCountQueryVariables>
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<NewsCountQuery, NewsCountQueryVariables>(NewsCountDocument, options);
}
export type NewsCountQueryHookResult = ReturnType<typeof useNewsCountQuery>;
export type NewsCountLazyQueryHookResult = ReturnType<typeof useNewsCountLazyQuery>;
export type NewsCountSuspenseQueryHookResult = ReturnType<typeof useNewsCountSuspenseQuery>;
export type NewsCountQueryResult = Apollo.QueryResult<NewsCountQuery, NewsCountQueryVariables>;
