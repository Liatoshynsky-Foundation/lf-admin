export const getEventValue = (e: string | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
  return typeof e === 'string' ? e : e?.target?.value || '';
};