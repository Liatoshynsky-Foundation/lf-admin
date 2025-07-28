import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import React from 'react';

import { ACCESS_TOKEN_COOKIE_NAME } from '~/back-constants/index';

export default async function AuthWrapper({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const authToken = cookieStore.get(ACCESS_TOKEN_COOKIE_NAME);

  console.log('AuthWrapper triggered, auth-token:', authToken);

  if (authToken) {
    return <>{children}</>;
  }

  redirect('/login');
}
