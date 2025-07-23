import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

import OurMission from './OurMission';

jest.mock('~/ds-components/collapsible-block/CollapsibleBlock', () => {
  const MockCollapsibleBlock = ({ children, title }: { children: React.ReactNode; title: string }) => (
    <div data-testid="collapsible-block">
      <h2>{title}</h2>
      {children}
    </div>
  );
  MockCollapsibleBlock.displayName = 'MockCollapsibleBlock';
  return MockCollapsibleBlock;
});

jest.mock('~/ds-components/text-field/TextField', () => {
  return {
    CustomTextField: ({
      title,
      value,
      defaultValue,
      onChange,
      label,
      placeholder,
      multiline,
      disabled,
      ...props
    }: any) => {
      const Element = multiline ? 'textarea' : 'input';
      const inputValue = value !== undefined ? value : undefined;
      const inputDefaultValue = value === undefined ? defaultValue : undefined;

      return (
        <div data-testid="custom-text-field">
          {title && <span data-testid="field-title">{title}</span>}
          <Element
            data-testid={props['data-testid'] || 'text-field-input'}
            value={inputValue}
            defaultValue={inputDefaultValue}
            onChange={onChange || (() => {})}
            placeholder={placeholder || label}
            disabled={disabled}
          />
        </div>
      );
    }
  };
});

jest.mock('~/components/configurable-list/ConfigurableList', () => {
  return function ConfigurableListMock(props: any) {
    return (
      <div data-testid="configurable-list">
        {props.items.map((item: any) => (
          <div key={item.id} data-testid="configurable-list-item">
            {props.renderItem({
              item,
              onChange: (updatedItem: any) => props.onChange?.(updatedItem)
            })}
            <button data-testid="delete-btn" onClick={() => props.onDelete?.(item.id)}>
              Delete
            </button>
          </div>
        ))}
        <button data-testid="add-btn" onClick={() => props.onCreate?.()}>
          Додати пункт
        </button>
      </div>
    );
  };
});

jest.mock('~/ds-components/photo-block/PhotoBlock', () => ({
  ImagePreviewBlock: (props: any) => (
    <div data-testid="image-preview-block">
      <img src={props.imageUrl} alt={props.title || 'preview'} />
      <input
        type="file"
        data-testid="image-upload"
        onChange={(e: any) => {
          if (e.target.files?.[0] && props.onChangeImage) {
            props.onChangeImage(e.target.files[0]);
          }
        }}
      />
    </div>
  )
}));

beforeAll(() => {
  let counter = 0;
  crypto.randomUUID = jest.fn(() => `test-uuid-${counter++}`) as typeof crypto.randomUUID;
  URL.createObjectURL = jest.fn(() => 'mocked-url');
});

describe('OurMission Component', () => {
  beforeEach(() => {
    (crypto.randomUUID as jest.Mock).mockClear();
    jest.clearAllMocks();
  });

  it('should render add button with label "Додати пункт"', () => {
    render(<OurMission />);
    const addButton = screen.getByTestId('add-btn');
    expect(addButton).toBeInTheDocument();
    expect(addButton).toHaveTextContent('Додати пункт');
  });

  it('should add new mission point when add button is clicked', () => {
    render(<OurMission />);
    const initialItemsCount = screen.getAllByTestId('configurable-list-item').length;
    fireEvent.click(screen.getByTestId('add-btn'));
    const updatedItemsCount = screen.getAllByTestId('configurable-list-item').length;
    expect(updatedItemsCount).toBe(initialItemsCount + 1);
  });

  it('should update mission point value when text field changes', () => {
    render(<OurMission />);
    const textFields = screen.getAllByPlaceholderText('Текст пункту');
    if (textFields.length > 0) {
      const firstTextField = textFields[0];
      fireEvent.change(firstTextField, { target: { value: 'Updated mission point' } });
      expect(firstTextField).toHaveValue('Updated mission point');
    } else {
      expect(screen.getByTestId('configurable-list')).toBeInTheDocument();
    }
  });

  it('should handle image upload correctly', () => {
    render(<OurMission />);
    const imageUploads = screen.getAllByTestId('image-upload');
    if (imageUploads.length > 0) {
      const imageUpload = imageUploads[0];
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      fireEvent.change(imageUpload, { target: { files: [mockFile] } });
      expect(URL.createObjectURL).toHaveBeenCalledWith(mockFile);
    }
  });

  it('should delete mission point when delete button is clicked', () => {
    render(<OurMission />);
    const initialItemsCount = screen.getAllByTestId('configurable-list-item').length;
    const deleteButtons = screen.getAllByTestId('delete-btn');
    if (deleteButtons.length > 0) {
      fireEvent.click(deleteButtons[0]);
      const updatedItemsCount = screen.getAllByTestId('configurable-list-item').length;
      expect(updatedItemsCount).toBe(initialItemsCount - 1);
    }
  });
});
