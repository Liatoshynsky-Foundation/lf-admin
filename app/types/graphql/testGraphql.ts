import { gql } from '@apollo/client';

export const TEST_QUERY = gql`
  query TestQuery {
    user {
      success
      __typename
    }
  }
`;
