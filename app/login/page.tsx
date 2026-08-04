'use client';

import { useRouter } from 'next/navigation';
import { Suspense, useState } from 'react';
import toast from 'react-hot-toast';

import { LoginInactivityToast } from './LoginInactivityToast';
import { loginErrors } from '~/constants/errors';
import LoginModal from '~/shared/components/login-modal/LoginModal';
import { type LoginSubmitData } from '~/types/adminLogin';
import { useLoginMutation } from '~/types/graphql/generated/graphql';

export default function LoginPage() {
  const router = useRouter();
  const [triggerErrorClear, setTriggerErrorClear] = useState<number>(0);

  const [loginMutation, { loading }] = useLoginMutation({
    onCompleted: (data) => {
      const result = data.login;

      if (result.__typename === 'LoginPayload' && result.success) {
        toast.success('Ви успішно увійшли до адмін панелі!');
        router.push('/');
        return;
      }
      if (result.__typename === 'ErrorPayload') {
        setTriggerErrorClear(Date.now());

        if (result.message === loginErrors.TOO_MANY_ATTEMPTS) {
          toast.error(loginErrors.TOO_MANY_ATTEMPTS);
        } else {
          toast.error(loginErrors.INVALID_CREDENTIALS || result.message);
        }

        return;
      }
      toast.error(loginErrors.UNEXPECTED_ERROR);
      setTriggerErrorClear(Date.now());
    },
    onError: () => {
      toast.error(loginErrors.UNEXPECTED_ERROR);
      setTriggerErrorClear(Date.now());
    }
  });

  const handleLoginSubmit = (data: LoginSubmitData) => {
    loginMutation({
      variables: {
        email: data.login,
        password: data.password
      }
    });
  };

  return (
    <>
      <Suspense fallback={null}>
        <LoginInactivityToast />
      </Suspense>

      <LoginModal onSubmit={handleLoginSubmit} submitError={triggerErrorClear.toString()} loading={loading} />
    </>
  );
}
