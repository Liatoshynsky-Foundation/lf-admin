export const validateEmail = (email: string): string | null => {
  const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
  if (!email.trim()) return 'Введіть електронну пошту';
  if (email.length > 254) return 'Електронна пошта занадто довга';
  if (!emailRegex.test(email)) return 'Введіть коректну електронну пошту';
  return null;
};
