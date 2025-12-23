'use client';

import React, { useState } from 'react';

import MediaMentionItem from './media-mention/MediaMentionItem.client';
import { useAllMediaMentions, useCreateMediaMention } from '~/shared/hooks/use-media-mentions/useMediaMentions';
import type { MediaMention } from '~/types/graphql/generated/graphql';

export default function MediaMentionsTest() {
  const { data, refetch, loading, error } = useAllMediaMentions();

  const items: MediaMention[] = data && Array.isArray(data.allMediaMentions) ? data.allMediaMentions : [];

  const [createMedia, { loading: creating }] = useCreateMediaMention();

  const [newUrl, setNewUrl] = useState<string>('');

  async function handleCreate(): Promise<void> {
    if (newUrl.trim().length === 0) return;
    await createMedia(newUrl.trim());
    await refetch();
    setNewUrl('');
  }

  return (
    <div style={{ padding: 12, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <h3>Media Mentions — Simple Editor</h3>

      <div style={{ marginBottom: 12 }}>
        <input
          placeholder="https://example.com/article"
          value={newUrl}
          onChange={(e) => setNewUrl(e.target.value)}
          style={{ width: 440, marginRight: 8 }}
        />
        <button onClick={handleCreate} disabled={creating}>
          {creating ? 'Creating...' : 'Create'}
        </button>
      </div>

      <div style={{ marginBottom: 12 }}>
        <strong>Query status:</strong> {loading ? 'loading' : 'idle'}
        {error ? <span style={{ color: 'red', marginLeft: 8 }}>{String(error)}</span> : null}
      </div>

      <div style={{ display: 'flex', gap: 16 }}>
        <div style={{ flex: 1 }}>
          <h4>Items ({items.length})</h4>
          <div style={{ display: 'grid', gap: 8 }}>
            {items.map((it) => (
              <MediaMentionItem key={it.id} item={it} onRefetch={refetch} />
            ))}
          </div>
        </div>
      </div>

      <details style={{ marginTop: 12 }}>
        <summary>Raw query result</summary>
        <pre style={{ maxHeight: 300, overflow: 'auto' }}>{JSON.stringify(data, null, 2)}</pre>
      </details>
    </div>
  );
}
