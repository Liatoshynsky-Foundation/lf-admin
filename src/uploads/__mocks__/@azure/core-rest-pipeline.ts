export class RestError extends Error {
  statusCode?: number;
  code?: string;
  request?: unknown;
  response?: unknown;

  constructor(message: string, options?: { statusCode?: number; code?: string }) {
    super(message);
    this.name = 'RestError';
    this.statusCode = options?.statusCode;
    this.code = options?.code;
  }
}

export const createPipelineRequest = jest.fn();
export const createHttpHeaders = jest.fn();
export const bearerTokenAuthenticationPolicy = jest.fn();
