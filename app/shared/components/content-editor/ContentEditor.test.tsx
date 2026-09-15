import { Block } from '@blocknote/core';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';

import { ContentEditor } from './ContentEditor';

type BlockNoteEditorMockProps = {
  initialContent?: unknown;
  onChange?: (blocks: unknown) => void;
  keyboardShortcuts?: { onSave?: () => void };
  placeholder?: string;
  editable?: boolean;
  sx?: unknown;
};

type PersistenceWithoutSave = {
  onChange: jest.Mock;
  autoSaveInterval: number;
  onSave?: undefined;
};

jest.mock('./contentSerializer', () => ({
  deserializeContent: jest.fn((content) => (Array.isArray(content) ? content : (content?.blocks ?? null))),
  isContentEqual: jest.fn((a, b) => JSON.stringify(a) === JSON.stringify(b)),
  serializeContent: jest.fn((blocks) => ({ blocks, version: '1.0.0', lastModified: new Date().toISOString() }))
}));

jest.mock('./BlockNoteEditor', () => ({
  BlockNoteEditor: ({
    initialContent,
    onChange,
    keyboardShortcuts,
    placeholder,
    editable,
    sx
  }: BlockNoteEditorMockProps) => (
    <div>
      <div
        data-testid="blocknote-editor"
        data-placeholder={placeholder}
        data-editable={editable}
        data-sx={JSON.stringify(sx)}
      >
        {JSON.stringify(initialContent)}
      </div>
      <button data-testid="editor-change" onClick={() => onChange?.([{ id: '1', type: 'paragraph' }])} />
      <button data-testid="save-shortcut" onClick={() => keyboardShortcuts?.onSave?.()} />
    </div>
  )
}));

const persistence = {
  onSave: jest.fn(async () => true),
  onChange: jest.fn(),
  autoSaveInterval: 10
};

describe('ContentEditor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders editor and save button via renderSaveButton', async () => {
    render(
      <ContentEditor
        initialContent={null}
        persistence={persistence}
        editorConfig={{ placeholder: 'Write here', editable: false, minHeight: '200px' }}
        renderSaveButton={({ onSave, isSaving }) => (
          <button data-testid="save-button" onClick={onSave} disabled={isSaving}>
            Save
          </button>
        )}
      />
    );

    expect(await screen.findByTestId('blocknote-editor')).toBeInTheDocument();
    expect(screen.getByTestId('blocknote-editor')).toHaveAttribute('data-placeholder', 'Write here');
    expect(screen.getByTestId('save-button')).toBeEnabled();
  });

  it('does not render a save button when renderSaveButton is not provided', async () => {
    render(<ContentEditor initialContent={[]} persistence={persistence} />);

    expect(await screen.findByTestId('blocknote-editor')).toBeInTheDocument();
    expect(screen.queryByTestId('save-button')).toBeNull();
  });

  it('passes onSave and isSaving to renderSaveButton when provided', async () => {
    const renderSaveButton = jest.fn(() => <button data-testid="save-button">Save</button>);

    render(<ContentEditor initialContent={[]} persistence={persistence} renderSaveButton={renderSaveButton} />);

    await screen.findByTestId('blocknote-editor');
    expect(renderSaveButton).toHaveBeenCalledWith(
      expect.objectContaining({
        onSave: expect.any(Function),
        isSaving: false
      })
    );
  });

  it('calls onChange persistence when content changes', async () => {
    render(<ContentEditor initialContent={[]} persistence={persistence} />);

    await screen.findByTestId('blocknote-editor');

    await act(async () => {
      fireEvent.click(screen.getByTestId('editor-change'));
    });

    await waitFor(() => expect(persistence.onChange).toHaveBeenCalled());
    expect(persistence.onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        blocks: [{ id: '1', type: 'paragraph' }],
        version: '1.0.0'
      })
    );
  });

  it('reports failure when save throws an error', async () => {
    const persistenceError = {
      onSave: jest.fn(async () => {
        throw new Error('fail');
      }),
      autoSaveInterval: 10
    };
    const onSaveComplete = jest.fn();

    render(<ContentEditor initialContent={[]} persistence={persistenceError} onSaveComplete={onSaveComplete} />);

    await screen.findByTestId('blocknote-editor');

    await act(async () => {
      fireEvent.click(screen.getByTestId('save-shortcut'));
    });

    await waitFor(() => expect(onSaveComplete).toHaveBeenCalledWith(false));
  });

  it('calls clearTimeout when a new change arrives before the previous auto-save timer fires', async () => {
    const clearSpy = jest.spyOn(global, 'clearTimeout');

    render(<ContentEditor initialContent={[]} persistence={persistence} />);

    await screen.findByTestId('blocknote-editor');

    await act(async () => {
      fireEvent.click(screen.getByTestId('editor-change'));
      jest.advanceTimersByTime(1);
      fireEvent.click(screen.getByTestId('editor-change'));
      jest.advanceTimersByTime(20);
    });

    expect(clearSpy).toHaveBeenCalled();
    clearSpy.mockRestore();
  });

  it('does not call onChange when persistence.onChange is absent', async () => {
    const persistenceWithoutOnChange = { onSave: jest.fn(async () => true), autoSaveInterval: 10 };

    render(<ContentEditor initialContent={[]} persistence={persistenceWithoutOnChange} />);

    await screen.findByTestId('blocknote-editor');

    await act(async () => {
      fireEvent.click(screen.getByTestId('editor-change'));
    });

    expect(persistenceWithoutOnChange.onSave).not.toHaveBeenCalled();
  });

  it('returns early when persistence.onSave is missing', async () => {
    const persistenceWithoutSave: PersistenceWithoutSave = { onChange: jest.fn(), autoSaveInterval: 10 };

    render(<ContentEditor initialContent={[]} persistence={persistenceWithoutSave} />);

    await screen.findByTestId('blocknote-editor');

    await act(async () => {
      fireEvent.click(screen.getByTestId('save-shortcut'));
    });

    expect(persistenceWithoutSave.onChange).not.toHaveBeenCalled();
  });

  it('reports failure when save returns false', async () => {
    const persistenceFail = { onSave: jest.fn(async () => false), autoSaveInterval: 10 };
    const onSaveComplete = jest.fn();

    render(
      <ContentEditor
        initialContent={[{ id: '1', type: 'paragraph' } as Block]}
        persistence={persistenceFail}
        onSaveComplete={onSaveComplete}
      />
    );

    await screen.findByTestId('blocknote-editor');

    await act(async () => {
      fireEvent.click(screen.getByTestId('save-shortcut'));
    });

    await waitFor(() => expect(persistenceFail.onSave).toHaveBeenCalled());
    expect(onSaveComplete).toHaveBeenCalledWith(false);
  });

  it('clears the previous auto-save timer before setting a new one', async () => {
    const persistenceTimer = { ...persistence, autoSaveInterval: 10 };

    render(<ContentEditor initialContent={[]} persistence={persistenceTimer} />);

    await screen.findByTestId('blocknote-editor');

    await act(async () => {
      fireEvent.click(screen.getByTestId('editor-change'));
      jest.advanceTimersByTime(5);
      fireEvent.click(screen.getByTestId('editor-change'));
      jest.advanceTimersByTime(10);
    });

    await waitFor(() => expect(persistenceTimer.onSave).toHaveBeenCalled());
  });

  it('saves content when save shortcut triggers and reports success', async () => {
    const onSaveComplete = jest.fn();

    render(<ContentEditor initialContent={[]} persistence={persistence} onSaveComplete={onSaveComplete} />);

    await screen.findByTestId('blocknote-editor');

    await act(async () => {
      fireEvent.click(screen.getByTestId('save-shortcut'));
    });

    await waitFor(() => expect(persistence.onSave).toHaveBeenCalled());
    expect(onSaveComplete).toHaveBeenCalledWith(true);
  });

  it('auto-saves after the configured interval when content is dirty', async () => {
    render(<ContentEditor initialContent={[]} persistence={persistence} />);

    await screen.findByTestId('blocknote-editor');

    await act(async () => {
      fireEvent.click(screen.getByTestId('editor-change'));
      jest.advanceTimersByTime(20);
    });

    await waitFor(() => expect(persistence.onSave).toHaveBeenCalled());
  });
});
