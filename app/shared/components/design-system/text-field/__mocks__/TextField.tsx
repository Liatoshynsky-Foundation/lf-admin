import { JSONContent } from '@tiptap/react';
import React from 'react';

import { createDocNode } from '~/shared/components/about-us/__mocks__/utils';

export interface MockTextFieldProps {
  readonly title?: string;
  readonly label?: string;
  readonly value: JSONContent;
  readonly onChange: (value: JSONContent) => void;
}

export const CustomTextField = ({ title, label, value, onChange }: MockTextFieldProps) => {
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
    </div>
  );
};
