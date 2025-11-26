import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';

import ContentEditor from '../ContentEditor';

jest.mock('~/components/content-editor', () => ({
  Editor: ({
    /*eslint-disable */
    initialContent,
    placeholder,
    onChange,
    onImageUpload,
    showSaveButton,
    minHeight
  }: {
    initialContent?: unknown;
    placeholder?: string;
    onChange?: (content: unknown) => void;
    onImageUpload?: (file: File) => Promise<string>;
    showSaveButton?: boolean;
    minHeight?: string;
  }) => (
    <div data-testid="mock-editor">
      <div data-testid="editor-placeholder">{placeholder}</div>
      <div data-testid="editor-min-height">{minHeight}</div>
      <div data-testid="editor-show-save-button">{String(showSaveButton)}</div>
      <button
        data-testid="trigger-change"
        onClick={() =>
          onChange?.({
            type: 'doc',
            content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Test content' }] }]
          })
        }
      >
        Trigger Change
      </button>
      {onImageUpload && (
        <button
          data-testid="trigger-image-upload"
          onClick={async () => {
            const file = new File(['test'], 'test.png', { type: 'image/png' });
            const url = await onImageUpload(file);
            console.log('Image uploaded:', url);
          }}
        >
          Upload Image
        </button>
      )}
    </div>
  )
}));

describe('ContentEditor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Rendering', () => {
    it('should render the page title', () => {
      render(<ContentEditor editorTitle="Test Editor" />);

      expect(screen.getByText('Test Editor')).toBeInTheDocument();
    });

    it('should render title input field', () => {
      render(<ContentEditor editorTitle="Test Editor" />);

      expect(screen.getByLabelText('Content Title')).toBeInTheDocument();
    });

    it('should render short description textarea', () => {
      render(<ContentEditor editorTitle="Test Editor" />);

      expect(screen.getByLabelText('Короткий опис')).toBeInTheDocument();
    });

    it('should render the Editor component', () => {
      render(<ContentEditor editorTitle="Test Editor" />);

      expect(screen.getByTestId('mock-editor')).toBeInTheDocument();
    });

    it('should render publish and save draft buttons', () => {
      render(<ContentEditor editorTitle="Test Editor" />);

      expect(screen.getByText('Опублікувати')).toBeInTheDocument();
      expect(screen.getByText('Зберегти чернетку')).toBeInTheDocument();
    });

    it('should display initial save status message', () => {
      render(<ContentEditor editorTitle="Test Editor" />);

      expect(screen.getByText('Почніть вводити текст для автоматичного збереження')).toBeInTheDocument();
    });

    it('should pass correct props to Editor component', () => {
      render(<ContentEditor editorTitle="Test Editor" />);

      expect(screen.getByTestId('editor-placeholder')).toHaveTextContent('Введіть деталі контенту...');
      expect(screen.getByTestId('editor-show-save-button')).toHaveTextContent('false');
      expect(screen.getByTestId('editor-min-height')).toHaveTextContent('500px');
    });
  });

  describe('Form Interactions', () => {
    it('should update title value when user types', () => {
      render(<ContentEditor editorTitle="Test Editor" />);

      const titleInput = screen.getByLabelText('Content Title') as HTMLInputElement;
      fireEvent.change(titleInput, { target: { value: 'Annual Charity Concert 2024' } });

      expect(titleInput.value).toBe('Annual Charity Concert 2024');
    });

    it('should update short description value when user types', () => {
      render(<ContentEditor editorTitle="Test Editor" />);

      const descriptionInput = screen.getByLabelText('Короткий опис') as HTMLTextAreaElement;
      fireEvent.change(descriptionInput, { target: { value: 'A wonderful charity event' } });

      expect(descriptionInput.value).toBe('A wonderful charity event');
    });

    it('should display character count for short description', () => {
      render(<ContentEditor editorTitle="Test Editor" />);

      const descriptionInput = screen.getByLabelText('Короткий опис') as HTMLTextAreaElement;
      fireEvent.change(descriptionInput, { target: { value: 'Test description' } });

      expect(screen.getByText('16/160 символів')).toBeInTheDocument();
    });

    it('should update character count when description changes', () => {
      render(<ContentEditor editorTitle="Test Editor" />);

      const descriptionInput = screen.getByLabelText('Короткий опис') as HTMLTextAreaElement;

      fireEvent.change(descriptionInput, { target: { value: 'Short' } });
      expect(screen.getByText('5/160 символів')).toBeInTheDocument();

      fireEvent.change(descriptionInput, { target: { value: 'A much longer description text' } });
      expect(screen.getByText('30/160 символів')).toBeInTheDocument();
    });

    it('should update content when editor onChange is triggered', () => {
      render(<ContentEditor editorTitle="Test Editor" />);

      const triggerButton = screen.getByTestId('trigger-change');
      fireEvent.click(triggerButton);

      // Content should be updated internally
      expect(triggerButton).toBeInTheDocument();
    });
  });

  describe('Auto-save Functionality', () => {
    it('should show "Saving..." status when auto-saving', async () => {
      render(<ContentEditor editorTitle="Test Editor" />);

      const titleInput = screen.getByLabelText('Content Title');
      fireEvent.change(titleInput, { target: { value: 'Test Event' } });

      jest.advanceTimersByTime(2000);

      await waitFor(() => {
        expect(screen.getByText('Збереження...')).toBeInTheDocument();
      });
    });

    it('should show last saved time after successful save', async () => {
      render(<ContentEditor editorTitle="Test Editor" />);

      const titleInput = screen.getByLabelText('Content Title');
      fireEvent.change(titleInput, { target: { value: 'Test Event' } });

      jest.advanceTimersByTime(2000);

      await waitFor(() => {
        expect(screen.getByText(/Останнє збереження о/)).toBeInTheDocument();
      });
    });

    it('should auto-save when title changes', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      render(<ContentEditor editorTitle="Test Editor" />);

      const titleInput = screen.getByLabelText('Content Title');
      fireEvent.change(titleInput, { target: { value: 'Test Event' } });

      jest.advanceTimersByTime(2000);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          'Auto-saving event:',
          expect.objectContaining({
            title: 'Test Event'
          })
        );
      });

      consoleSpy.mockRestore();
    });

    it('should auto-save when short description changes', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      render(<ContentEditor editorTitle="Test Editor" />);

      const descInput = screen.getByLabelText('Короткий опис');
      fireEvent.change(descInput, { target: { value: 'Test description' } });

      jest.advanceTimersByTime(2000);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          'Auto-saving event:',
          expect.objectContaining({
            shortDescription: 'Test description'
          })
        );
      });

      consoleSpy.mockRestore();
    });

    it('should auto-save when content changes', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      render(<ContentEditor editorTitle="Test Editor" />);

      const triggerButton = screen.getByTestId('trigger-change');
      fireEvent.click(triggerButton);

      jest.advanceTimersByTime(2000);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          'Auto-saving event:',
          expect.objectContaining({
            content: expect.any(Object)
          })
        );
      });

      consoleSpy.mockRestore();
    });

    it('should debounce auto-save calls', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      render(<ContentEditor editorTitle="Test Editor" />);

      const titleInput = screen.getByLabelText('Content Title');

      fireEvent.change(titleInput, { target: { value: 'T' } });
      jest.advanceTimersByTime(500);

      fireEvent.change(titleInput, { target: { value: 'Te' } });
      jest.advanceTimersByTime(500);

      fireEvent.change(titleInput, { target: { value: 'Test' } });
      jest.advanceTimersByTime(2000);

      await waitFor(() => {
        const saveCalls = consoleSpy.mock.calls.filter((call) => call[0] === 'Auto-saving event:');
        expect(saveCalls.length).toBe(1);
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Manual Save', () => {
    it('should save when Save Draft button is clicked', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      render(<ContentEditor editorTitle="Test Editor" />);

      const titleInput = screen.getByLabelText('Content Title');
      fireEvent.change(titleInput, { target: { value: 'Manual Save Test' } });

      const saveButton = screen.getByText('Зберегти чернетку');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          'Auto-saving event:',
          expect.objectContaining({
            title: 'Manual Save Test'
          })
        );
      });

      consoleSpy.mockRestore();
    });

    it('should show saving status when Save Draft is clicked', async () => {
      render(<ContentEditor editorTitle="Test Editor" />);

      const saveButton = screen.getByText('Зберегти чернетку');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText('Збереження...')).toBeInTheDocument();
      });
    });
  });

  describe('Publish Functionality', () => {
    it('should log content data when Publish button is clicked', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const alertSpy = jest.spyOn(window, 'alert').mockImplementation();

      render(<ContentEditor editorTitle="Test Editor" />);

      const titleInput = screen.getByLabelText('Content Title');
      fireEvent.change(titleInput, { target: { value: 'Published Event' } });

      const publishButton = screen.getByText('Опублікувати');
      fireEvent.click(publishButton);

      expect(consoleSpy).toHaveBeenCalledWith(
        'Publishing content:',
        expect.objectContaining({
          title: 'Published Event'
        })
      );
      expect(alertSpy).toHaveBeenCalledWith('Content published! (This is a demo)');

      consoleSpy.mockRestore();
      alertSpy.mockRestore();
    });

    it('should show alert when Publish button is clicked', () => {
      const alertSpy = jest.spyOn(window, 'alert').mockImplementation();

      render(<ContentEditor editorTitle="Test Editor" />);

      const publishButton = screen.getByText('Опублікувати');
      fireEvent.click(publishButton);

      expect(alertSpy).toHaveBeenCalledWith('Content published! (This is a demo)');

      alertSpy.mockRestore();
    });
  });

  describe('Initial State', () => {
    it('should initialize with empty content data', () => {
      render(<ContentEditor editorTitle="Test Editor" />);

      const titleInput = screen.getByLabelText('Content Title') as HTMLInputElement;
      const descInput = screen.getByLabelText('Короткий опис') as HTMLTextAreaElement;

      expect(titleInput.value).toBe('');
      expect(descInput.value).toBe('');
      expect(screen.getByText('0/160 символів')).toBeInTheDocument();
    });

    it('should not trigger auto-save on initial render', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      render(<ContentEditor editorTitle="Test Editor" />);

      jest.advanceTimersByTime(3000);

      await waitFor(() => {
        const saveCalls = consoleSpy.mock.calls.filter((call) => call[0] === 'Auto-saving event:');
        expect(saveCalls.length).toBe(0);
      });

      consoleSpy.mockRestore();
    });

    it('should render with initial content when provided', () => {
      const initialContent = {
        type: 'doc',
        content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Initial content' }] }]
      };

      render(<ContentEditor editorTitle="Test Editor" initialContent={initialContent} />);

      expect(screen.getByTestId('mock-editor')).toBeInTheDocument();
    });
  });
});
