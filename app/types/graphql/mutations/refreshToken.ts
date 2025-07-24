export const REFRESH_TOKEN_MUTATION = `
  mutation RefreshToken {
    refreshToken {
      success
    }
  }
`;

export const TEST_QUERY = `
query GetAdminProfile {
   getAdminProfile { 
      success
   }
}
`;
