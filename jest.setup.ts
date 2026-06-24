import '@testing-library/jest-dom';

jest.mock('src/middleware/logger/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn()
  }
}));

if (typeof globalThis.structuredClone === 'undefined') {
  globalThis.structuredClone = function structuredClone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
  };
}

Object.defineProperty(globalThis, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn()
  }))
});
