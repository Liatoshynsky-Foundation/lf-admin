'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { loginErrors } from '~/constants/errors';
import LoginModal from '~/shared/components/login-modal/LoginModal';
import { useGraphqlMutation } from '~/shared/hooks/use-graphql/use-graphql-mutation/useGraphqlMutation';
import { LoginSubmitData } from '~/types/adminLogin';
import { LoginMutationResponse } from '~/types/graphql/adminLogin';
import { LOGIN_MUTATION } from '~/types/graphql/mutations/adminLogin';

export default function LoginPage() {
  const router = useRouter();
  const [loginError, setLoginError] = useState<string | null>(null);

  const loginMutation = useGraphqlMutation(LOGIN_MUTATION);

  const responseHandler = (data: unknown, _error: Error | null, _variables: unknown, _context: unknown) => {
    const response = data as LoginMutationResponse;
    if (!response || typeof response !== 'object' || !('login' in response)) {
      setLoginError(loginErrors.UNEXPECTED_ERROR);
      return;
    }

    const result = response.login;

    if (result.__typename === 'ErrorPayload') {
      setLoginError(result.message || loginErrors.INVALID_CREDENTIALS);
      return;
    }

    if (result.__typename === 'LoginPayload') {
      if (result.success) {
        router.push('/');
        return;
      }
    }

    setLoginError(loginErrors.UNEXPECTED_ERROR);
  };

  const handleLoginSubmit = (data: LoginSubmitData) => {
    loginMutation.mutate(
      { email: data.login, password: data.password },
      {
        onSettled: responseHandler
      }
    );
  };

  return <LoginModal onSubmit={handleLoginSubmit} submitError={loginError} />;
}
