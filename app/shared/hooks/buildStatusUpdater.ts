// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MutateFn<TResult> = (opts: any) => Promise<TResult>;

export function buildStatusUpdater<TResult>(
  mutate: MutateFn<TResult>,
  publishedStatus: string
): (status: string) => (id: string, input?: { publishedAt?: string | null }) => Promise<TResult> {
  return (status: string) =>
    async (id: string, input?: { publishedAt?: string | null }) => {
      const payload: { status: string; publishedAt?: string | null } = { status };
      if (status === publishedStatus) {
        payload.publishedAt = input?.publishedAt ?? new Date().toISOString();
      }
      return mutate({ variables: { id, input: payload } });
    };
}
