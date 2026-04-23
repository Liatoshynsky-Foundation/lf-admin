import type { RequestHandler } from 'msw';

export function withMswHandlers(...handlers: RequestHandler[]) {
  return {
    msw: {
      handlers,
    },
  };
}