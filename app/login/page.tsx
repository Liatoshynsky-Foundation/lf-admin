'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';

import { loginErrors } from '~/constants/errors';
import LoginModal from '~/shared/components/login-modal/LoginModal';
import { type LoginSubmitData } from '~/types/adminLogin';
import { useLoginMutation } from '~/types/graphql/generated/graphql';

export default function LoginPage() {
  const router = useRouter();
  const [loginError, setLoginError] = useState<string | null>(null);

  const [loginMutation] = useLoginMutation({
    onCompleted: (data) => {
      const result = data.login;

      if (result.__typename === 'LoginPayload' && result.success) {
        toast.success('Ви успішно увійшли до адмін панелі!');
        router.push('/');
        return;
      }
      if (result.__typename === 'ErrorPayload') {
        setLoginError(result.message);
        return;
      }
      setLoginError(loginErrors.UNEXPECTED_ERROR);
    },
    onError: () => {
      setLoginError(loginErrors.UNEXPECTED_ERROR);
    }
  });

  const handleLoginSubmit = (data: LoginSubmitData) => {
    setLoginError(null);
    loginMutation({
      variables: {
        email: data.login,
        password: data.password
      }
    });
  };

  return <LoginModal onSubmit={handleLoginSubmit} submitError={loginError} />;
}
