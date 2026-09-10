const PHONE_COUNTRY_CODE = '38';
const PHONE_PREFIX = `+${PHONE_COUNTRY_CODE}`;
const PHONE_NUMBER_LENGTH = 10;

export const PHONE_MASK = `+${PHONE_COUNTRY_CODE} ___ ___ ____`;

export const usePhoneInput = () => {
  const formatPhoneNumber = (value: string): string => {
    const digits = value.replace(/\D/g, '');
    const number = (digits.startsWith(PHONE_COUNTRY_CODE) ? digits.slice(2) : digits).slice(0, PHONE_NUMBER_LENGTH);
    const groups = [number.slice(0, 3), number.slice(3, 6), number.slice(6, PHONE_NUMBER_LENGTH)].filter(Boolean);

    return groups.length > 0 ? [PHONE_PREFIX, ...groups].join(' ') : '';
  };

  return { formatPhoneNumber };
};
