'use client';

import { Box, Button, Typography } from '@mui/material';
import Image from 'next/image';
import React, { useState } from 'react';

import PasswordField from '../design-system/password-field/PasswordField';
import { CustomTextField } from '../design-system/text-field/TextField';
import { styles } from './LoginModal.styles';
import { loginErrors } from '~/constants/errors';
import { LoginModalProps } from '~/types/adminLogin';

const LoginModal = ({ onSubmit, submitError }: LoginModalProps) => {
  const [username, setUsername] = useState('');
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const validateUsername = () => {
    if (!username.trim()) {
      setUsernameError(loginErrors.EMPTY_USERNAME);
      return false;
    }
    setUsernameError(null);
    return true;
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
    if (usernameError) validateUsername();
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
    if (passwordError) validatePassword();
  };

  const handleSubmit = () => {
    const isUsernameValid = validateUsername();
    const isPasswordValid = validatePassword();

    if (isUsernameValid && isPasswordValid) {
      onSubmit({ login: username, password });
    }
  };

  return (
    <Box sx={styles.outerContainer}>
      <Image src="./icons/logo.svg" alt="logo" width={96} height={80} />
      <Box sx={styles.container}>
        <Typography sx={styles.title} variant="h5">
          Вхід до адмін-панелі
        </Typography>
        <Typography sx={styles.subtitle} variant="subtitle1">
          Для редагування сайту увійдіть у свій обліковий запис.
        </Typography>
        <CustomTextField
          sx={styles.textField}
          label="Логін"
          value={username}
          onChange={handleUsernameChange}
          error={!!usernameError}
          helperText={usernameError}
        />
        <PasswordField
          sx={styles.passwordField}
          value={password}
          onChange={handlePasswordChange}
          error={!!passwordError}
          helperText={passwordError}
        />
        {submitError && (
          <Typography sx={styles.errorText} variant="body2">
            {submitError}
          </Typography>
        )}
        <Button variant="contained" sx={styles.button} onClick={handleSubmit} disabled={!username || !password}>
          Увійти
        </Button>
      </Box>
    </Box>
  );
};

export default LoginModal;
