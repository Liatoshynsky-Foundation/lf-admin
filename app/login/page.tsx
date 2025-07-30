'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

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
      setLoginError('Непередбачена помилка. Спробуйте ще раз.');
      return;
    }

    const result = response.login;

    if (result.__typename === 'ErrorPayload') {
      setLoginError(result.message || 'Неправильний логін або пароль');
      return;
    }

    if (result.__typename === 'LoginPayload') {
      if (result.success) {
        router.push('/');
        return;
      }
    }

    setLoginError('Непередбачена помилка. Спробуйте ще раз.');
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
