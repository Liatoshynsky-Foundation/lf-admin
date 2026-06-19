export interface RateLimitRepository {
  incrementAndCheck: (key: string, limit: number, windowMinutes: number) => Promise<boolean>;
}
