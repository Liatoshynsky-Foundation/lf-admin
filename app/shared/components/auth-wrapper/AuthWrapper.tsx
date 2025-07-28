import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import React from 'react';

import { ACCESS_TOKEN_COOKIE_NAME } from '~/back-constants/index';

const AuthWrapper = async ({ children }: { children: React.ReactNode }) => {
  const authToken = await cookies().then((c) => c.get(ACCESS_TOKEN_COOKIE_NAME)); // Check for auth token in cookies

  console.log('AuthWrapper triggered, auth-token:', authToken);

  if (!authToken) {
    redirect('/login');
  }

  return <>{children}</>;
};

export default AuthWrapper;
