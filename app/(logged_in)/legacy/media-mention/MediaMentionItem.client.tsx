'use client';

import React, { useState } from 'react';

import {
  useAddMediaMentionView,
  useDeleteMediaMention,
  useUpdateMediaMention
} from '~/shared/hooks/use-media-mentions/useMediaMentions';
import type { MediaMention, MediaStatus, UpdateMediaMentionInput } from '~/types/graphql/generated/graphql';

type Props = {
  item: MediaMention;
  onRefetch: () => Promise<unknown>;
};

export default function MediaMentionItem({ item, onRefetch }: Readonly<Props>) {
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const [updateMedia, { loading: updating }] = useUpdateMediaMention();
  const [deleteMedia, { loading: deleting }] = useDeleteMediaMention();
  const [addView] = useAddMediaMentionView();

  const initialDraft: UpdateMediaMentionInput = {
    title: item.title,
    description: item.description ?? undefined,
    slug: item.slug,
    status: item.status as MediaStatus,
    publishedAt: item.publishedAt ?? undefined
  };

  const [draft, setDraft] = useState<UpdateMediaMentionInput>(initialDraft);

  function resetDraft(): void {
    setDraft({ ...initialDraft });
  }

  async function handleSave(): Promise<void> {
    const { errors } = await updateMedia(item.id, draft);
    if (errors && errors.length > 0) {
      console.error('Error updating media mention:', errors);
      return;
    }
    await onRefetch();
    setIsEditing(false);
  }

  async function handleDelete(): Promise<void> {
    const { errors } = await deleteMedia(item.id);
    if (errors && errors.length > 0) {
      console.error('Error deleting media mention:', errors);
      return;
    }
    await onRefetch();
  }

  async function handleAddView(): Promise<void> {
    const { errors } = await addView(item.id);
    if (errors && errors.length > 0) {
      console.error('Error adding view:', errors);
      return;
    }
    await onRefetch();
  }

  const imgSrc = item.coverImage?.src?.length ? item.coverImage!.src : undefined;
  const imgWidth = item.coverImage?.width ?? 160;
  const imgHeight = item.coverImage?.height ?? 90;

  return (
    <div style={{ padding: 8, border: '1px solid #ddd', display: 'flex', gap: 12 }}>
      <div style={{ width: imgWidth, height: imgHeight, flex: '0 0 auto' }}>
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={item.coverImage?.alt ?? item.title}
            width={imgWidth}
            height={imgHeight}
            style={{ objectFit: 'cover' }}
          />
        ) : (
          <div
            style={{
              width: imgWidth,
              height: imgHeight,
              background: '#f3f3f3',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#888'
            }}
          >
            No image
          </div>
        )}
      </div>

      <div style={{ flex: 1 }}>
        {isEditing ? (
          <div style={{ display: 'grid', gap: 8 }}>
            <input value={draft.title ?? ''} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
            <textarea
              value={draft.description ?? ''}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
            />
            <input value={draft.slug ?? ''} onChange={(e) => setDraft({ ...draft, slug: e.target.value })} />
            <select
              value={String(draft.status)}
              onChange={(e) => setDraft({ ...draft, status: e.target.value as MediaStatus })}
            >
              <option value="DRAFT">DRAFT</option>
              <option value="PUBLISHED">PUBLISHED</option>
              <option value="HIDDEN">HIDDEN</option>
              <option value="ARCHIVED">ARCHIVED</option>
              <option value="EDITING">EDITING</option>
            </select>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={handleSave} disabled={updating}>
                {updating ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={() => {
                  resetDraft();
                  setIsEditing(false);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <div style={{ fontWeight: 600 }}>{item.title}</div>
            <div style={{ fontSize: 12, color: '#666' }}>{item.description ?? item.url}</div>
            <div style={{ fontSize: 12, color: '#666' }}>status: {item.status}</div>
          </>
        )}
      </div>

      <div style={{ display: 'flex', gap: 6, alignItems: 'start' }}>
        {!isEditing ? (
          <button
            onClick={() => {
              setIsEditing(true);
              resetDraft();
            }}
          >
            Edit
          </button>
        ) : null}
        <button onClick={handleAddView}>+view</button>
        <button onClick={handleDelete} style={{ color: '#900' }} disabled={deleting}>
          {deleting ? 'Deleting...' : 'Delete'}
        </button>
      </div>
    </div>
  );
}
