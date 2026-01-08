import { useCallback, useEffect, useState } from 'react';

export function useAutosavedDescription(opts: {
  fileId?: string;
  initialValue?: string;
  debounceMs: number;
  onSave?: (fileId: string, value: string) => Promise<void> | void;
  onError?: (error: unknown) => void;
}) {
  const { fileId, initialValue = '', debounceMs, onSave, onError } = opts;

  const [draft, setDraft] = useState(initialValue);
  const [lastCommitted, setLastCommitted] = useState(initialValue);

  useEffect(() => {
    setDraft(initialValue);
    setLastCommitted(initialValue);
  }, [initialValue, fileId]);

  const commit = useCallback(
    async (value: string) => {
      if (!fileId || !onSave) return;
      if (value === lastCommitted) return;

      try {
        await onSave(fileId, value);
        setLastCommitted(value);
      } catch (e) {
        onError?.(e);
      }
    },
    [fileId, onSave, lastCommitted, onError]
  );

  useEffect(() => {
    if (!fileId || !onSave) return;
    if (draft === lastCommitted) return;

    const t = globalThis.setTimeout(() => commit(draft), debounceMs);
    return () => globalThis.clearTimeout(t);
  }, [draft, lastCommitted, commit, debounceMs, fileId, onSave]);

  return { draft, setDraft, commit, lastCommitted };
}
