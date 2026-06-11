'use client';

import { Box, Button, InputAdornment, Typography } from '@mui/material';
import { Mail } from 'lucide-react';
import React, { useState } from 'react';
import toast from 'react-hot-toast';

import { styles } from './ForgotPasswordForm.styles';
import { placeholderStyle } from '~/constants/styles';
import { CustomTextField } from '~/ds-components/text-field/TextField';
import { renderHelperText } from '~/lib/utils/renderHelperText';
import { validateEmail } from '~/lib/utils/validateEmail';
import { AuthCardLayout } from '~/shared/components/auth-card/AuthCardLayout';

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setEmailError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const error = validateEmail(email);
    setEmailError(error);
    if (!error) {
      setIsSubmitted(true);
      toast.success('Лист для відновлення надіслано');
    }
  };

  if (isSubmitted) {
    return (
      <AuthCardLayout title="Відновлення паролю" subtitle="">
        <Typography align="center">
          Якщо обліковий запис із цією електронною адресою існує, ми надіслали інструкції для відновлення пароля.
        </Typography>
      </AuthCardLayout>
    );
  }

  return (
    <AuthCardLayout
      title="Відновлення паролю"
      subtitle="Введіть свою електронну адресу, і ми надішлемо вам інструкції з відновлення."
    >
      <Box component="form" onSubmit={handleSubmit} sx={styles.form}>
        <CustomTextField
          label="Електронна пошта *"
          value={email}
          onChange={handleChange}
          error={!!emailError}
          helperText={renderHelperText(emailError)}
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

        <Button variant="contained" sx={styles.buttonSubmit} type="submit" fullWidth>
          Надіслати інструкції
        </Button>
      </Box>
    </AuthCardLayout>
  );
}
