import { createReactBlockSpec } from '@blocknote/react';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

type MockEditor = {
  updateBlock: jest.Mock;
};

type MockBlockProps = {
  url: string;
  showPreview: boolean;
  caption: string;
  fileName: string;
  cropData: string;
  width: number;
  textAlignment: 'left' | 'center' | 'right';
  textColor: string;
};

type MockBlock = {
  id: string;
  props: MockBlockProps;
};

type ComponentProps = {
  block: MockBlock;
  editor: MockEditor;
};

type ExternalHTMLProps = {
  src?: string;
  alt?: string;
  'data-custom-cropped'?: string;
  'data-width'?: string;
  'data-crop-data'?: string;
  'data-filename'?: string;
  'data-preview'?: string;
  'data-caption'?: string;
};

type BlockImplementation = {
  render: React.FC<ComponentProps>;
  toExternalHTML: (props: { block: MockBlock }) => React.ReactElement<ExternalHTMLProps>;
  parse: (el: HTMLElement) => Partial<MockBlockProps> | undefined;
};

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  }
}));

jest.mock('@blocknote/react', () => ({
  createReactBlockSpec: jest.fn(() => jest.fn())
}));

jest.mock('@blocknote/core', () => ({
  defaultProps: {
    textAlignment: { default: 'left', values: ['left', 'center', 'right'] },
    textColor: { default: 'default' }
  }
}));

jest.mock('~/hooks/use-cropped-image/use-cropped-image', () => ({
  useCroppedImage: jest.fn(() => ({
    styles: { container: { overflow: 'hidden' }, image: { objectFit: 'cover' } },
    onLoad: jest.fn()
  }))
}));

jest.mock('lucide-react', () => ({
  FileImage: () => <span data-testid="file-image-icon" />,
  GripHorizontal: () => <span data-testid="grip-horizontal-icon" />
}));

import './CroppedImageBlock';

const blockImplementation = (createReactBlockSpec as jest.Mock).mock.calls[0][1] as BlockImplementation;

const renderBlock = (props: ComponentProps) => {
  const Component = blockImplementation.render;
  return render(<Component {...props} />);
};

describe('CroppedImageBlock', () => {
  let mockEditor: MockEditor;
  let defaultProps: ComponentProps;

  beforeEach(() => {
    mockEditor = {
      updateBlock: jest.fn()
    };

    defaultProps = {
      block: {
        id: 'test-block',
        props: {
          url: 'http://example.com/image.png',
          showPreview: true,
          caption: 'Initial Caption',
          fileName: 'image.png',
          cropData: '{}',
          width: 500,
          textAlignment: 'center',
          textColor: 'default'
        }
      },
      editor: mockEditor
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering States', () => {
    it('should return null if url is empty', () => {
      defaultProps.block.props.url = '';
      const { container } = renderBlock(defaultProps);
      expect(container).toBeEmptyDOMElement();
    });

    it('should render the File Card (collapsed state) when showPreview is false', () => {
      defaultProps.block.props.showPreview = false;
      renderBlock(defaultProps);

      expect(screen.getByTestId('file-image-icon')).toBeInTheDocument();
      expect(screen.getByText('image.png')).toBeInTheDocument();
      expect(screen.queryByPlaceholderText('Додати підпис...')).not.toBeInTheDocument();
    });

    it('should render the expanded image and caption input when showPreview is true', () => {
      renderBlock(defaultProps);

      expect(screen.queryByTestId('file-image-icon')).not.toBeInTheDocument();
      
      const image = screen.getByAltText('image.png');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', 'http://example.com/image.png');
      
      const captionInput = screen.getByPlaceholderText('Додати підпис...');
      expect(captionInput).toBeInTheDocument();
      expect(captionInput).toHaveValue('Initial Caption');
    });
  });

  describe('Interactions', () => {
    it('should call editor.updateBlock to set showPreview: true when clicking the File Card', () => {
      defaultProps.block.props.showPreview = false;
      renderBlock(defaultProps);

      const fileCard = screen.getByText('image.png').closest('.MuiPaper-root') as HTMLElement;
      fireEvent.click(fileCard);

      expect(mockEditor.updateBlock).toHaveBeenCalledWith('test-block', {
        type: 'image',
        props: { showPreview: true } 
      });
    });

    it('should call editor.updateBlock with the new caption string when typing in the caption input', () => {
      renderBlock(defaultProps);

      const captionInput = screen.getByPlaceholderText('Додати підпис...') as HTMLElement;
      fireEvent.change(captionInput, { target: { value: 'New Caption' } });

      expect(mockEditor.updateBlock).toHaveBeenCalledWith('test-block', {
        type: 'image',
        props: { caption: 'New Caption' }
      });
    });

    it('should trigger e.stopPropagation() when pressing a key inside the caption input', () => {
      renderBlock(defaultProps);
      
      const captionInput = screen.getByPlaceholderText('Додати підпис...') as HTMLElement;
      
      const event = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
      const stopPropagationSpy = jest.spyOn(event, 'stopPropagation');
      
      fireEvent(captionInput, event);

      expect(stopPropagationSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('Resize Logic (Mouse Events)', () => {
    it('should update width on mouse move and apply on mouse up', () => {
      renderBlock(defaultProps);

      const dragHandle = screen.getByTestId('grip-horizontal-icon').parentElement as HTMLElement;
      expect(dragHandle).toBeInTheDocument();

      fireEvent.mouseDown(dragHandle, { clientX: 100 });
      fireEvent.mouseMove(document, { clientX: 150 });
      fireEvent.mouseUp(document, { clientX: 150 });

      expect(mockEditor.updateBlock).toHaveBeenCalledWith('test-block', {
        type: 'image',
        props: { width: 550 }
      });
    });

    it('should respect the minimum width of 150px during resize', () => {
      renderBlock(defaultProps);

      const dragHandle = screen.getByTestId('grip-horizontal-icon').parentElement as HTMLElement;
      
      fireEvent.mouseDown(dragHandle, { clientX: 500 });
      fireEvent.mouseMove(document, { clientX: 100 }); 
      fireEvent.mouseUp(document, { clientX: 100 });

      expect(mockEditor.updateBlock).toHaveBeenCalledWith('test-block', {
        type: 'image',
        props: { width: 150 }
      });
    });
  });

  describe('Serialization Methods (toExternalHTML & parse)', () => {
    it('should return a React element with correct props in toExternalHTML', () => {
      const dummyProps: MockBlockProps = {
        url: 'http://test.com/img.jpg',
        caption: 'Test Caption',
        fileName: 'test.jpg',
        width: 300,
        showPreview: true,
        cropData: '{"x":10}',
        textAlignment: 'center',
        textColor: 'default'
      };

      const result = blockImplementation.toExternalHTML({ block: { id: 'mock-1', props: dummyProps } });

      expect(result.type).toBe('img');
      expect(result.props.src).toBe('http://test.com/img.jpg');
      expect(result.props['data-custom-cropped']).toBe('true');
      expect(result.props['data-width']).toBe('300');
      expect(result.props['data-crop-data']).toBe('{"x":10}');
      expect(result.props['alt']).toBe('test.jpg');
      expect(result.props['data-preview']).toBe('true');
      expect(result.props['data-caption']).toBe('Test Caption');
    });

    it('should correctly reconstruct props from an img element in parse', () => {
      const element = document.createElement('img');
      element.setAttribute('src', 'http://test.com/parsed.jpg');
      element.setAttribute('data-custom-cropped', 'true');
      element.setAttribute('data-width', '400');
      element.setAttribute('alt', 'parsed.jpg');
      element.setAttribute('data-crop-data', '{"x":50}');
      element.setAttribute('data-preview', 'true');
      element.setAttribute('data-caption', 'Parsed Caption');

      const parsedProps = blockImplementation.parse(element);

      expect(parsedProps).toEqual({
        url: 'http://test.com/parsed.jpg',
        width: 400,
        fileName: 'parsed.jpg',
        cropData: '{"x":50}',
        showPreview: true,
        caption: 'Parsed Caption'
      });
    });
      
    it('should return undefined in parse if element does not have data-custom-cropped', () => {
      const element = document.createElement('div');
      const parsedProps = blockImplementation.parse(element);
      
      expect(parsedProps).toBeUndefined();
    });
  });
});
