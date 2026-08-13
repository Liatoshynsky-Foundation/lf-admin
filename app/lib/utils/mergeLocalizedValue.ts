export const mergeLocalizedValue = <L extends string, V>(
  field: Record<L, V> | undefined,
  locale: L,
  value: V
): Record<L, V> =>
  ({
    ...field,
    [locale]: value
  }) as Record<L, V>;