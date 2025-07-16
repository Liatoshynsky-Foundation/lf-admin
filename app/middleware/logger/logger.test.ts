import type { TransformableInfo } from 'logform';
import type { Logger } from 'winston';

const infoMock = jest.fn();
const errorMock = jest.fn();
const transportsMock = [
  { silent: false, type: 'console' },
  { silent: false, type: 'mongodb', constructor: { name: 'MongoDB' } }
];

let printfFormatterSpy: ((info: TransformableInfo) => string) | null = null;

jest.mock('winston', () => {
  const formatMock = jest.fn() as jest.Mock & {
    combine: jest.Mock;
    printf: jest.Mock;
    timestamp: jest.Mock;
    errors: jest.Mock;
    json: jest.Mock;
    colorize: jest.Mock;
  };

  formatMock.combine = jest.fn((...args) => args);
  formatMock.printf = jest.fn((formatter) => {
    printfFormatterSpy = formatter;
    return { transform: formatter };
  });
  formatMock.timestamp = jest.fn();
  formatMock.errors = jest.fn();
  formatMock.json = jest.fn();
  formatMock.colorize = jest.fn();

  return {
    createLogger: jest.fn(() => ({
      info: infoMock,
      error: errorMock,
      transports: transportsMock
    })),
    format: formatMock,
    transports: {
      Console: jest.fn()
    }
  };
});

jest.mock('winston-mongodb', () => ({
  MongoDB: jest.fn()
}));

describe('Logger', () => {
  let logger: Logger;

  beforeAll(async () => {
    logger = (await import('~/middleware/logger/logger')).default;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('calls logger.info', () => {
    logger.info('Test info message');
    expect(infoMock).toHaveBeenCalledWith('Test info message');
  });

  it('calls logger.error with error object', () => {
    const err = new Error('Something bad happened');
    logger.error(err);
    expect(errorMock).toHaveBeenCalledWith(err);
  });

  it('includes MongoDB transport', () => {
    const hasMongoDB = logger.transports.some((t) => t.constructor?.name === 'MongoDB');
    expect(hasMongoDB).toBe(true);
  });

  it('formats message with stack and metadata', () => {
    const formatter = printfFormatterSpy!;
    const info = {
      level: 'error',
      message: 'Something went wrong',
      timestamp: '2025-05-25T00:00:00.000Z',
      stack: 'Error: fail\n    at file.js:1:1'
    };

    const result = formatter(info);

    expect(result).toContain('🕒 2025-05-25T00:00:00.000Z error: Something went wrong');
    expect(result).toContain('📌 Stack trace:');
    expect(result).toContain('at file.js:1:1');
  });

  it('formats message without stack trace if stack is not a string', () => {
    const formatter = printfFormatterSpy!;
    const info = {
      level: 'warn',
      message: 'Just a warning',
      timestamp: '2025-05-25T00:00:00.000Z',
      stack: undefined,
      extra: { some: 'meta' }
    };

    const result = formatter(info);

    expect(result).toContain('🕒 2025-05-25T00:00:00.000Z warn: Just a warning');
    expect(result).not.toContain('📌 Stack trace:');
  });
});
