import { fireEvent, render, screen } from '@testing-library/react';
import { JSONContent } from '@tiptap/react';
import { ReactNode } from 'react';

import FoundationFoundersRedirect from './FoundationFoundersRedirect';
import { BLOCK_IDS, PAGE_IDS } from '~/constants/pageBlocks';

interface MockCustomTextFieldProps {
  label: string;
  onChange: (value: JSONContent) => void;
  onBlur: () => void;
}

jest.mock('~/ds-components/text-field/TextField', () => ({
  __esModule: true,
  CustomTextField: ({ label, onChange, onBlur }: MockCustomTextFieldProps) => (
    <div data-testid={`mock-textfield-${label}`}>
      <button
        data-testid={`trigger-change-${label}`}
        onClick={() => onChange({ type: 'doc', content: [{ type: 'text', text: 'Changed ' + label }] })}
      >
        Change
      </button>
      <button data-testid={`trigger-blur-${label}`} onClick={onBlur}>
        Blur
      </button>
    </div>
  )
}));

const mockOnBlurListTitle = jest.fn();
const mockOnBlurTitleText = jest.fn();

jest.mock('~/shared/hooks/use-title-validation/useTitleValidation', () => ({
  useTitleValidation: (key: string) => {
    if (key.includes('listTitle')) return { onBlur: mockOnBlurListTitle, error: false, helperText: '' };
    return { onBlur: mockOnBlurTitleText, error: false, helperText: '' };
  }
}));

jest.mock('~/ds-components/collapsible-block/CollapsibleBlock', () => ({
  __esModule: true,
  default: ({ children }: { children: ReactNode }) => <div data-testid="mock-collapsible-block">{children}</div>
}));

jest.mock('~/shared/hooks/use-page-block/usePageBlock', () => ({
  usePageBlock: () => ({
    block: {
      listTitle: { uk: { type: 'doc', content: [] }, en: {} },
      titleText: { uk: { type: 'doc', content: [] }, en: {} }
    }
  })
}));

const mockSetField = jest.fn();
const mockToggleBlockVisibility = jest.fn();
jest.mock('~/store', () => ({
  useStore: jest.fn((selector) => {
    if (!selector) return { locale: 'uk', setField: mockSetField, setFieldValidity: jest.fn(), toggleBlockVisibility: mockToggleBlockVisibility };
    const mockState = { locale: 'uk', setField: mockSetField, setFieldValidity: jest.fn(), toggleBlockVisibility: mockToggleBlockVisibility };
    return selector(mockState);
  })
}));

describe('FoundationFoundersRedirect', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    render(<FoundationFoundersRedirect />);
    expect(screen.getByTestId('mock-textfield-Головний текст')).toBeInTheDocument();
    expect(screen.getByTestId('mock-textfield-Заголовок списку')).toBeInTheDocument();
  });

  it.each([
    { label: 'Заголовок списку', field: 'listTitle' },
    { label: 'Головний текст', field: 'titleText' }
  ])('should call setField when $field changes', ({ label, field }) => {
    render(<FoundationFoundersRedirect />);
    fireEvent.click(screen.getByTestId(`trigger-change-${label}`));
    
    expect(mockSetField).toHaveBeenCalledWith(
      PAGE_IDS.ABOUT_US,
      BLOCK_IDS.FOUNDATION_FOUNDERS,
      field,
      expect.objectContaining({
        uk: expect.objectContaining({ content: [{ type: 'text', text: `Changed ${label}` }] })
      })
    );
  });

  it.each([
    { label: 'Заголовок списку', mockFn: mockOnBlurListTitle },
    { label: 'Головний текст', mockFn: mockOnBlurTitleText }
  ])('should trigger onBlur validation for $label', ({ label, mockFn }) => {
    render(<FoundationFoundersRedirect />);
    fireEvent.click(screen.getByTestId(`trigger-blur-${label}`));
    expect(mockFn).toHaveBeenCalled();
  });
});
