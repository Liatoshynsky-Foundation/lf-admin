import { JSONContent } from '@tiptap/react';
import React from 'react';

import { createDocNode } from '~/__mocks__/utils';

export interface MockTextFieldProps {
  readonly title?: string;
  readonly label?: string;
  readonly value: JSONContent;
  readonly onChange: (value: JSONContent) => void;
  readonly onBlur?: () => void;
  readonly error?: boolean;
  readonly helperText?: string;
}

export const CustomTextField = ({ title, label, value, onChange, onBlur, error, helperText }: MockTextFieldProps) => {
  const selectorKey = title || label || 'default';

  return (
    <div data-testid={`textfield-wrapper-${selectorKey}`}>
      <span data-testid={`textfield-json-${selectorKey}`}>{JSON.stringify(value)}</span>
      <button
        data-testid={`trigger-change-${selectorKey}`}
        onClick={() => onChange(createDocNode(`Updated ${selectorKey}`))}
      >
        Change {selectorKey}
      </button>
      <button data-testid={`trigger-clear-${selectorKey}`} onClick={() => onChange({ type: 'doc', content: [] })}>
        Clear {selectorKey}
      </button>
      {onBlur && (
        <button data-testid={`trigger-blur-${selectorKey}`} onClick={onBlur}>
          Blur {selectorKey}
        </button>
      )}
      {error && <span data-testid={`textfield-error-${selectorKey}`}>{helperText}</span>}
    </div>
  );
};
