import { gql } from '@apollo/client';

export const TEST_QUERY = gql`
  query TestQuery {
    test {
      success
      __typename
    }
  }
`;
