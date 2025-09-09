import { gql } from '@apollo/client';

export const UPDATE_PAGE_BLOCKS = gql`
  mutation UpdatePageBlocks($input: UpdatePageBlocksInput!) {
    updatePageBlocks(input: $input) {
      id
      slug
      blocks
      updatedAt
      __typename
    }
  }
`;
