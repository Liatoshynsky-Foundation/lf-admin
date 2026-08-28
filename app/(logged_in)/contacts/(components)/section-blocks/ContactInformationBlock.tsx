'use client';

import { Box } from '@mui/material';
import { useState } from 'react';

import { HeaderRow } from '../../(shared)/HeaderRow';
import { CustomTextField } from '~/ds-components/text-field/TextField';

export const ContactInformationBlock = () => {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <HeaderRow title="Контактна інформація" />
      <Box display="flex" flexDirection="column" gap={2}>
        <CustomTextField
          label="Назва"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
          fullWidth
        />
        <CustomTextField
          label="Локація"
          value={location}
          onChange={(event) => setLocation(event.target.value)}
          required
          fullWidth
        />
        <CustomTextField
          label="Номер телефону"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          required
          fullWidth
        />
        <CustomTextField
          type="email"
          label="Електронна адреса"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          fullWidth
        />
      </Box>
    </Box>
  );
};
