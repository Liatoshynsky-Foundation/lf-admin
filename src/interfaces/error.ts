export interface error {
  Error(): string;
}

export function newError(message: string): error {
  return {
    Error: () => message
  };
}
