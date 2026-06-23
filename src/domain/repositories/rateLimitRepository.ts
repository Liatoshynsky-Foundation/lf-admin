export interface RateLimitRepository {
  incrementAndCheck: (key: string, limit: number, windowMinutes: number) => Promise<boolean>;
  checkLimit: (key: string) => Promise<number>;
  incrementFailure: (key: string, windowMinutes: number) => Promise<void>;
  resetAttempts: (key: string) => Promise<void>;
}
