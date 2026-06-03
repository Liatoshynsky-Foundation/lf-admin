'use client';

import { Box, Button, InputAdornment, Typography } from '@mui/material';
import { Lock, Mail } from 'lucide-react';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';

import { AuthCardLayout } from '../auth-card/AuthCardLayout';
import PasswordField from '../design-system/password-field/PasswordField';
import { styles } from './LoginModal.styles';
import { loginErrors } from '~/constants/errors';
import { placeholderStyle } from '~/constants/styles';
import { CustomTextField } from '~/ds-components/text-field/TextField';
import { renderHelperText } from '~/lib/utils/renderHelperText';
import { validateEmail } from '~/lib/utils/validateEmail';
import { LoginModalProps } from '~/types/adminLogin';

const LoginModal = ({ onSubmit, submitError }: LoginModalProps) => {
  const [username, setUsername] = useState('');
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    if (submitError) {
      const errorText = submitError.toLowerCase();

      if (errorText.includes('email')) {
        setUsernameError(loginErrors.INVALID_EMAIL || 'Введіть коректну електронну пошту');
        setServerError(null);
      } else if (errorText.includes('password')) {
        setPasswordError(loginErrors.INVALID_PASSWORD || 'Неправильний пароль');
        setPassword('');
        setServerError(null);
      } else {
        setServerError(submitError);
        setPassword('');
      }
    }
  }, [submitError]);

  const validateUsername = () => {
    if (!username.trim()) {
      setUsernameError(loginErrors.EMPTY_EMAIL);
      return false;
    }
    const error = validateEmail(username);
    if (error) {
      setUsernameError(loginErrors.INVALID_EMAIL);
      return false;
    }
    setUsernameError(null);
    return true;
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
    setUsernameError(null);
    setServerError(null);
  };

  const validatePassword = () => {
    if (!password.trim()) {
      setPasswordError(loginErrors.EMPTY_PASSWORD);
      return false;
    }
    setPasswordError(null);
    return true;
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setPasswordError(null);
    setServerError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const isUsernameValid = validateUsername();
    const isPasswordValid = validatePassword();

    if (isUsernameValid && isPasswordValid) {
      onSubmit({ login: username, password });
    }
  };

  return (
    <AuthCardLayout
      title="Вхід до адмін-панелі"
      subtitle="Увійдіть щоб отримати доступ до робочого простору вашої фірми."
    >
      <Box component="form" onSubmit={handleSubmit}>
        <Box sx={styles.inputs}>
          <CustomTextField
            label="Електронна пошта *"
            value={username}
            onChange={handleUsernameChange}
            error={!!usernameError}
            helperText={renderHelperText(usernameError)}
            placeholder="Введіть електронну пошту"
            fullWidth
            sx={placeholderStyle}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Mail size={20} strokeWidth={1.75} style={{ color: '#4E5061' }} />
                </InputAdornment>
              )
            }}
          />
          <PasswordField
            label="Пароль *"
            value={password}
            placeholder="Введіть пароль"
            onChange={handlePasswordChange}
            error={!!passwordError}
            helperText={renderHelperText(passwordError)}
            sx={placeholderStyle}
            startAdornment={
              <InputAdornment position="start">
                <Lock size={20} strokeWidth={1.75} style={{ color: '#4E5061' }} />
              </InputAdornment>
            }
          />
        </Box>
        <Box sx={styles.buttonsContainer}>
          {serverError && (
            <Box sx={{ mt: 1, mb: 2, mx: 'auto' }}>
              <Typography variant="body2" sx={{ color: '#d32f2f' }}>
                {renderHelperText(serverError)}
              </Typography>
            </Box>
          )}
          <Button variant="contained" sx={styles.buttonLogin} type="submit" fullWidth>
            Увійти
          </Button>
          <Button component={Link} href="/forgot-password" variant="outlined" sx={styles.buttonReset} fullWidth>
            Забули пароль?
          </Button>
        </Box>
      </Box>
    </AuthCardLayout>
  );
};

export default LoginModal;
