import type { KeyboardEvent } from 'react';
import { useCallback } from 'react';

const PHONE_COUNTRY_CODE = '38';
const PHONE_PREFIX = `+${PHONE_COUNTRY_CODE}`;
const PHONE_NUMBER_LENGTH = 10;

export const PHONE_MASK = `+${PHONE_COUNTRY_CODE} ___ ___ ____`;

export const usePhoneInput = () => {
  const formatPhoneNumber = useCallback((value: string): string => {
    const digits = value.replace(/\D/g, '');
    const number = (digits.startsWith(PHONE_COUNTRY_CODE) ? digits.slice(2) : digits).slice(0, PHONE_NUMBER_LENGTH);
    const groups = [number.slice(0, 3), number.slice(3, 6), number.slice(6, PHONE_NUMBER_LENGTH)].filter(Boolean);

    return groups.length > 0 ? [PHONE_PREFIX, ...groups].join(' ') : '';
  }, []);

  const handlePhoneKeyDown = useCallback((event: KeyboardEvent<HTMLInputElement>) => {
    const isDigit = event.key >= '0' && event.key <= '9';

    if (event.key.length === 1 && !isDigit && !event.ctrlKey && !event.metaKey) {
      event.preventDefault();
    }
  }, []);

  return { formatPhoneNumber, handlePhoneKeyDown };
};
