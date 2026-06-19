'use client';
import { Box, Button, InputAdornment, Typography } from '@mui/material';
import { Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import toast from 'react-hot-toast';

import PasswordField from '../design-system/password-field/PasswordField';
import { styles } from './ResetPasswordForm.styles';
import { resetPasswordErrors } from '~/constants/errors';
import { placeholderStyle } from '~/constants/styles';
import { renderHelperText } from '~/lib/utils/renderHelperText';
import { AuthCardLayout } from '~/shared/components/auth-card/AuthCardLayout';
import { useResetPasswordMutation } from '~/types/graphql/generated/graphql';

interface ResetPasswordFormProps {
  token: string;
}

const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/;

const validatePassword = (password: string): string | null => {
  if (!password.trim()) return resetPasswordErrors.EMPTY_PASSWORD;
  if (password.length < 10) return resetPasswordErrors.REQUIREMENTS_NOT_MET;
  if (password.length > 72) return resetPasswordErrors.REQUIREMENTS_NOT_MET;
  if (!passwordRegex.test(password)) return resetPasswordErrors.REQUIREMENTS_NOT_MET;
  return null;
};

const PASSWORD_HINT =
  'Пароль має містити щонайменше 10 символів, включаючи велику літеру, цифру та спеціальний символ (наприклад, !@#$%). Максимальна довжина — 72 символи.';

export default function ResetPasswordForm({ token }: Readonly<ResetPasswordFormProps>) {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const [resetPasswordMutation, { loading }] = useResetPasswordMutation({
    onCompleted: (data) => {
      if (data.resetPassword.__typename === 'SuccessPayload') {
        toast.success('Пароль успішно змінено. Увійдіть з новим паролем.');
        router.push('/login');
        return;
      }
      if (data.resetPassword.__typename === 'ErrorPayload') {
        toast.error(data.resetPassword.message);
      }
    },
    onError: (error) => {
      const message = error.graphQLErrors[0]?.message;
      toast.error(message ?? 'Сталася помилка, спробуйте ще раз');
    }
  });

  const validate = () => {
    setIsSubmitted(true);
    const passError = validatePassword(password);
    setPasswordError(passError);

    let confirmError: string | null = null;
    if (!confirmPassword.trim()) {
      confirmError = 'Підтвердіть пароль';
    } else if (password !== confirmPassword) {
      confirmError = resetPasswordErrors.PASSWORDS_MISMATCH;
    }
    setConfirmPasswordError(confirmError);

    return !passError && !confirmError;
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (passwordError) setPasswordError(null);
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
    if (confirmPasswordError) setConfirmPasswordError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      resetPasswordMutation({ variables: { token, password } });
    }
  };

  return (
    <AuthCardLayout title="Зміна паролю" subtitle="Створіть новий пароль для захисту вашого акаунта">
      <Box component="form" onSubmit={handleSubmit} sx={styles.form}>
        <Box sx={styles.inputsWrapper}>
          <PasswordField
            label="Новий пароль *"
            value={password}
            placeholder="Введіть новий пароль"
            onChange={handlePasswordChange}
            error={isSubmitted && !!passwordError}
            helperText={isSubmitted && passwordError ? renderHelperText(passwordError) : ''}
            fullWidth
            sx={placeholderStyle}
            startAdornment={
              <InputAdornment position="start">
                <Lock size={20} strokeWidth={1.75} style={{ color: '#4E5061' }} />
              </InputAdornment>
            }
          />
          <Box sx={styles.passwordHintContainer}>
            <Typography sx={styles.passwordHintText}>{PASSWORD_HINT}</Typography>
          </Box>
          <PasswordField
            label="Повторіть пароль *"
            value={confirmPassword}
            placeholder="Повторіть пароль"
            onChange={handleConfirmPasswordChange}
            error={isSubmitted && !!confirmPasswordError}
            helperText={isSubmitted && confirmPasswordError ? renderHelperText(confirmPasswordError) : ''}
            fullWidth
            sx={placeholderStyle}
            startAdornment={
              <InputAdornment position="start">
                <Lock size={20} strokeWidth={1.75} style={{ color: '#4E5061' }} />
              </InputAdornment>
            }
          />
        </Box>
        <Button variant="contained" sx={styles.buttonSubmit} type="submit" fullWidth disabled={loading}>
          {loading ? 'Збереження...' : 'Змінити пароль'}
        </Button>
      </Box>
    </AuthCardLayout>
  );
}
