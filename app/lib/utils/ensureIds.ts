export const ensureIds = <T extends object>(list: (T & Partial<{ id: string }>)[]): (T & { id: string })[] => {
  return list.map((item) => ({
    ...item,
    id: item.id ?? crypto.randomUUID()
  }));
};
