export const generateUniqueId = (): string => {
  if (typeof globalThis !== 'undefined' && globalThis.crypto && typeof globalThis.crypto.randomUUID === 'function') {
    return globalThis.crypto.randomUUID();
  }

  const array = new Uint32Array(1);
  globalThis.crypto.getRandomValues(array);
  return `ui-${Date.now()}-${array[0].toString(36)}`;
};
