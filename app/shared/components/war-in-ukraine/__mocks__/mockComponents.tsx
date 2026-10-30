import type { JSONContent } from '@tiptap/react';
import React from 'react';

import type { ClickableButtonData } from '../ConfigurableButtonList/ConfigurableButtonList';
import type {
  MockCollapsibleBlockProps,
  MockConfigurableButtonListProps,
  MockCustomTextFieldProps
} from './mockProps';

export const MOCK_UPDATED_BUTTONS: ClickableButtonData[] = [
  {
    id: 'btn-1',
    shortText: { uk: 'Коротко', en: 'Short' },
    fullText: { uk: 'Повний текст', en: 'Full text' },
    link: 'https://test.com'
  }
];

export const MockCollapsibleBlock = ({ title, children, hidden, onToggleVisibility }: MockCollapsibleBlockProps) => (
  <div data-testid="collapsible-block" data-hidden={hidden}>
    <span>{title}</span>
    <button type="button" data-testid="toggle-visibility-btn" onClick={onToggleVisibility}>
      Toggle Visibility
    </button>
    {children}
  </div>
);

export const MockConfigurableButtonList = ({ buttons, onChange }: MockConfigurableButtonListProps) => (
  <div data-testid="configurable-button-list" data-count={buttons.length}>
    <button
      type="button"
      data-testid="trigger-buttons-change"
      onClick={() => onChange(MOCK_UPDATED_BUTTONS)}
    >
      Change Buttons
    </button>
  </div>
);

export const mockLocalizedTextField = (rawValueTitle: string, directStringValue: string) => {
  const MockCustomTextField = ({ title, value, onChange }: MockCustomTextFieldProps<JSONContent | string>) => (
    <div data-testid={`field-${title}`}>
      <input
        aria-label={title}
        value={typeof value === 'object' && value !== null ? JSON.stringify(value) : (value || '')}
        onChange={(e) => {
          if (title === rawValueTitle) {
            onChange(e.target.value);
          } else {
            onChange(e);
          }
        }}
        data-testid={`input-${title}`}
      />
      <button
        type="button"
        data-testid={`direct-string-btn-${title}`}
        onClick={() => onChange(directStringValue)}
      >
        Set Direct String
      </button>
    </div>
  );

  return MockCustomTextField;
};
