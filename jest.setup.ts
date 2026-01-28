import '@testing-library/jest-dom';

if (typeof globalThis.structuredClone === 'undefined') {
  globalThis.structuredClone = function structuredClone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
  };
}
