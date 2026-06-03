export const validateEmail = (email: string): string | null => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email.trim()) return 'Введіть електронну пошту';
  if (!emailRegex.test(email)) return 'Введіть коректну електронну пошту';
  return null;
};
