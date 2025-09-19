import { JsonValue } from '~/back-shared/types/pages/types';

export const extractImageSrcs = (data: JsonValue): string[] => {
  const sources = new Set<string>();
  const findRecursively = (value: unknown) => {
    if (!value) return;
    if (Array.isArray(value)) {
      value.forEach(findRecursively);
      return;
    }
    if (typeof value === 'object') {
      const obj = value as { [key: string]: unknown };
      if (typeof obj.src === 'string' && obj.isTmp === true) {
        sources.add(obj.src);
      }
      Object.values(obj).forEach(findRecursively);
    }
  };
  findRecursively(data);
  return Array.from(sources);
};
