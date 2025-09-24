export const removeTmpFlagsRecursively = <T>(data: T): T => {
  if (!data || typeof data !== 'object') {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(removeTmpFlagsRecursively) as unknown as T;
  }

  const newObj = Object.fromEntries(
    Object.entries(data).map(([key, value]) => [key, removeTmpFlagsRecursively(value)])
  ) as { [K in keyof T]: T[K] };

  if ('isTmp' in newObj && newObj.isTmp === true) {
    newObj.isTmp = false;
  }

  return newObj;
};
