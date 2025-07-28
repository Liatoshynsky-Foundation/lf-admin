'use client';

import LoginModal from '~/shared/components/login-modal/LoginModal';
import { useGraphqlMutation } from '~/shared/hooks/use-graphql/use-graphql-mutation/useGraphqlMutation';
import { LoginSubmitData } from '~/types/adminLogin';
import { LOGIN_MUTATION } from '~/types/graphql/mutations/adminLogin';

export default function LoginPage() {
  const loginMutation = useGraphqlMutation(LOGIN_MUTATION);

  const handleLoginSubmit = (data: LoginSubmitData) => {
    loginMutation.mutate(
      { email: data.login, password: data.password },
      {
        onSuccess: (response) => {
          // Handle successful login response
          console.log('Login successful:', response);
        },
        onError: (error) => {
          // Handle error during login
          console.error('Login failed:', error);
        }
      }
    );
  };

  return <LoginModal onSubmit={handleLoginSubmit} />;
}
