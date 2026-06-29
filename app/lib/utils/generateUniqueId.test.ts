import { generateUniqueId } from './generateUniqueId';

describe('generateUniqueId Utility', () => {
  const originalCrypto = globalThis.crypto;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    Object.defineProperty(globalThis, 'crypto', {
      value: originalCrypto,
      configurable: true,
    });
    jest.useRealTimers();
  });

  it('should return a UUID if crypto.randomUUID is available (Modern browsers)', () => {
    const mockUUID = '123e4567-e89b-12d3-a456-426614174000';

    Object.defineProperty(globalThis, 'crypto', {
      value: {
        randomUUID: jest.fn().mockReturnValue(mockUUID),
      },
      configurable: true,
    });

    const id = generateUniqueId();

    expect(id).toBe(mockUUID);
    expect(globalThis.crypto.randomUUID).toHaveBeenCalledTimes(1);
  });

  it('should fallback to Date.now and getRandomValues if randomUUID is missing (Older browsers)', () => {
    const mockTimestamp = 1704067200000;
    jest.setSystemTime(new Date(mockTimestamp));

    const mockRandomNumber = 123456789;

    Object.defineProperty(globalThis, 'crypto', {
      value: {
        randomUUID: undefined, 
        getRandomValues: jest.fn().mockImplementation((arr: Uint32Array) => {
          arr[0] = mockRandomNumber;
          return arr;
        }),
      },
      configurable: true,
    });

    const id = generateUniqueId();

    const expectedRandomPart = mockRandomNumber.toString(36);
    const expectedId = `ui-${mockTimestamp}-${expectedRandomPart}`;

    expect(id).toBe(expectedId);
    expect(globalThis.crypto.getRandomValues).toHaveBeenCalledTimes(1);
  });
});
