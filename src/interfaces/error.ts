export interface ErrorMessage {
  Error(): string;
}

export function newError(message: string): ErrorMessage {
  return {
    Error: () => message
  };
}
