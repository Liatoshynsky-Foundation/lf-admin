import '@testing-library/jest-dom';

if (typeof global.structuredClone === 'undefined') {
  global.structuredClone = function structuredClone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
  };
}
