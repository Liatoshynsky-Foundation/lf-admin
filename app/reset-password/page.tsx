import { Typography } from '@mui/material';
import React from 'react';

import { AuthCardLayout } from '~/shared/components/auth-card/AuthCardLayout';
import ResetPasswordForm from '~/shared/components/reset-password-form/ResetPasswordForm';

type ResetPasswordPageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

async function verifyToken(token: string): Promise<boolean> {
  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
    const res = await fetch(`${appUrl}/api/graphql`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: 'query VerifyResetToken($token: String!) { verifyResetToken(token: $token) }',
        variables: { token }
      }),
      cache: 'no-store'
    });
    const json = await res.json();
    return json?.data?.verifyResetToken === true;
  } catch {
    return false;
  }
}

export default async function ResetPasswordPage({ searchParams }: Readonly<ResetPasswordPageProps>) {
  const params = await searchParams;
  const token = typeof params.token === 'string' ? params.token : '';
  if (!token) {
    return (
      <AuthCardLayout title="Помилка" subtitle="Посилання недійсне">
        <Typography align="center">Будь ласка, перейдіть за посиланням з вашого листа.</Typography>
      </AuthCardLayout>
    );
  }

  const isTokenValid = await verifyToken(token);

  if (!isTokenValid) {
    return (
      <AuthCardLayout title="Помилка" subtitle="Посилання недійсне">
        <Typography align="center">
          Посилання для відновлення пароля вже було використано або втратило чинність. Будь ласка, створіть новий запит
          на відновлення пароля.
        </Typography>
      </AuthCardLayout>
    );
  }

  return <ResetPasswordForm token={token} />;
}
