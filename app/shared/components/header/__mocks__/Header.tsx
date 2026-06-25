import React from 'react';

export const Header = ({
  title,
  onPreview,
  onSave,
  onCancel,
  isSaving,
  onLanguageChange
}: {
  title: string;
  onPreview: () => void;
  onSave: () => void;
  onCancel: () => void;
  isSaving: boolean;
  onLanguageChange: (lang: 'uk' | 'en') => void;
}) => (
  <div data-testid="header">
    <span data-testid="title">{title}</span>
    <button data-testid="preview-btn" onClick={onPreview}>
      preview
    </button>
    <button data-testid="save-btn" onClick={onSave}>
      save
    </button>
    <button data-testid="cancel-btn" onClick={onCancel}>
      cancel
    </button>
    <span data-testid="saving-flag">{String(isSaving)}</span>
    <button data-testid="lang-en" onClick={() => onLanguageChange('en')}>
      set-en
    </button>
  </div>
);
